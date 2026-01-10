#!/usr/bin/env python3
import argparse
import csv
import json
import os
import sys
import time
from datetime import datetime, timedelta, timezone

import boto3


DEFAULT_CONFIG = {
    "region": "eu-west-2",
    "poll_interval_seconds": 0.4,
    "max_poll_seconds": 60,
    "aliases": {
        # Fill these with YOUR real log group prefixes or exact names
        "cloudtrail": {
            "prefixes": ["/aws/cloudtrail/"],
            "log_groups": []
        },
        "waf": {
            "prefixes": ["/aws/waf/"],
            "log_groups": []
        },
        "flow": {
            "prefixes": ["/aws/vpc/flowlogs/"],
            "log_groups": []
        }
    }
}


def eprint(*args):
    print(*args, file=sys.stderr)


def config_dir():
    return os.path.expanduser("~/.config/awslogtools")


def queries_dir():
    return os.path.join(config_dir(), "queries")


def config_path():
    return os.path.join(config_dir(), "config.json")


def ensure_dirs():
    os.makedirs(config_dir(), exist_ok=True)
    os.makedirs(queries_dir(), exist_ok=True)


def load_config():
    ensure_dirs()
    path = config_path()
    if not os.path.exists(path):
        with open(path, "w", encoding="utf-8") as f:
            json.dump(DEFAULT_CONFIG, f, indent=2)
        eprint(f"Created default config: {path}")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def parse_time_window(args):
    # end = now (UTC)
    end = datetime.now(timezone.utc)

    if args.since:
        # ISO8601 e.g. 2026-01-06T18:00:00Z
        s = args.since.replace("Z", "+00:00")
        start = datetime.fromisoformat(s)
        if start.tzinfo is None:
            start = start.replace(tzinfo=timezone.utc)
        return int(start.timestamp()), int(end.timestamp())

    minutes = args.minutes or 0
    hours = args.hours or 0
    if minutes == 0 and hours == 0:
        minutes = 60  # default 60 minutes
    start = end - timedelta(hours=hours, minutes=minutes)
    return int(start.timestamp()), int(end.timestamp())


def discover_log_groups(client, prefixes, limit=200):
    found = []
    for prefix in prefixes:
        token = None
        while True:
            kwargs = {"logGroupNamePrefix": prefix, "limit": 50}
            if token:
                kwargs["nextToken"] = token
            resp = client.describe_log_groups(**kwargs)
            for lg in resp.get("logGroups", []):
                found.append(lg["logGroupName"])
                if len(found) >= limit:
                    return sorted(set(found))
            token = resp.get("nextToken")
            if not token:
                break
    return sorted(set(found))


def resolve_log_groups(client, cfg, args):
    # Priority:
    # 1) explicit --log-group (repeatable)
    # 2) --alias (uses config alias + discovery)
    # 3) --prefix (discovery)
    log_groups = []

    if args.log_group:
        log_groups.extend(args.log_group)

    if args.alias:
        alias = cfg.get("aliases", {}).get(args.alias)
        if not alias:
            raise SystemExit(f"Unknown alias '{args.alias}'. Check {config_path()}")
        log_groups.extend(alias.get("log_groups", []))
        prefixes = alias.get("prefixes", [])
        if prefixes:
            log_groups.extend(discover_log_groups(client, prefixes, limit=args.discover_limit))

    if args.prefix:
        log_groups.extend(discover_log_groups(client, [args.prefix], limit=args.discover_limit))

    log_groups = sorted(set([lg for lg in log_groups if lg]))
    if not log_groups:
        raise SystemExit("No log groups resolved. Use --alias, --prefix, or --log-group.")
    return log_groups


def load_query_from_template(template_name, params):
    path = os.path.join(queries_dir(), f"{template_name}.sql")
    if not os.path.exists(path):
        raise SystemExit(f"Template not found: {path}")
    with open(path, "r", encoding="utf-8") as f:
        q = f.read()
    # simple string substitution: {{name}}
    for k, v in (params or {}).items():
        q = q.replace("{{" + k + "}}", v)
    return q


def start_query(client, log_groups, query, start_ts, end_ts, limit):
    resp = client.start_query(
        logGroupNames=log_groups,
        startTime=start_ts,
        endTime=end_ts,
        queryString=query,
        limit=limit
    )
    return resp["queryId"]


def poll_query(client, query_id, poll_interval, max_poll_seconds):
    deadline = time.time() + max_poll_seconds
    while True:
        resp = client.get_query_results(queryId=query_id)
        status = resp["status"]
        if status in ("Complete", "Failed", "Cancelled", "Timeout"):
            return status, resp.get("results", []), resp
        if time.time() > deadline:
            return "Timeout", [], resp
        time.sleep(poll_interval)


def rows_from_results(results):
    # results: [ [ {"field":"@timestamp","value":"..."}, ... ], ... ]
    rows = []
    for item in results:
        row = {}
        for kv in item:
            row[kv.get("field", "")] = kv.get("value", "")
        rows.append(row)
    return rows


def print_table(rows, max_width=50):
    if not rows:
        print("(no results)")
        return

    # stable columns: union of keys, but put @timestamp first if present
    keys = sorted({k for r in rows for k in r.keys() if k})
    if "@timestamp" in keys:
        keys.remove("@timestamp")
        keys = ["@timestamp"] + keys

    # compute widths
    widths = {}
    for k in keys:
        w = len(k)
        for r in rows:
            w = max(w, len(str(r.get(k, ""))))
        widths[k] = min(w, max_width)

    def fmt(val, width):
        s = str(val)
        if len(s) > width:
            return s[:width - 1] + "…"
        return s.ljust(width)

    header = "  ".join(fmt(k, widths[k]) for k in keys)
    sep = "  ".join("-" * widths[k] for k in keys)
    print(header)
    print(sep)
    for r in rows:
        print("  ".join(fmt(r.get(k, ""), widths[k]) for k in keys))


def print_csv(rows):
    if not rows:
        return
    keys = sorted({k for r in rows for k in r.keys() if k})
    w = csv.DictWriter(sys.stdout, fieldnames=keys)
    w.writeheader()
    for r in rows:
        w.writerow({k: r.get(k, "") for k in keys})


def parse_kv_list(kv_list):
    params = {}
    if not kv_list:
        return params
    for item in kv_list:
        if "=" not in item:
            raise SystemExit(f"Bad --param '{item}', expected key=value")
        k, v = item.split("=", 1)
        params[k.strip()] = v.strip()
    return params


def cmd_list_templates(_args):
    d = queries_dir()
    ensure_dirs()
    files = sorted([f for f in os.listdir(d) if f.endswith(".sql")])
    if not files:
        print(f"No templates found in {d}")
        return
    for f in files:
        print(f[:-4])


def cmd_list_log_groups(args, cfg):
    client = boto3.client("logs", region_name=cfg["region"])
    if args.prefix:
        groups = discover_log_groups(client, [args.prefix], limit=args.discover_limit)
    elif args.alias:
        alias = cfg.get("aliases", {}).get(args.alias)
        if not alias:
            raise SystemExit(f"Unknown alias '{args.alias}'.")
        prefixes = alias.get("prefixes", [])
        groups = discover_log_groups(client, prefixes, limit=args.discover_limit)
        groups = sorted(set(groups + alias.get("log_groups", [])))
    else:
        raise SystemExit("Use --prefix or --alias")
    for g in groups:
        print(g)


def cmd_run(args, cfg):
    client = boto3.client("logs", region_name=cfg["region"])

    log_groups = resolve_log_groups(client, cfg, args)
    start_ts, end_ts = parse_time_window(args)

    params = parse_kv_list(args.param)
    query = load_query_from_template(args.template, params)

    qid = start_query(client, log_groups, query, start_ts, end_ts, args.limit)

    status, results, _raw = poll_query(
        client,
        qid,
        poll_interval=cfg.get("poll_interval_seconds", 0.4),
        max_poll_seconds=cfg.get("max_poll_seconds", 60)
    )

    if status != "Complete":
        raise SystemExit(f"Query status: {status} (queryId={qid})")

    rows = rows_from_results(results)

    if args.output == "json":
        print(json.dumps(rows, indent=2))
    elif args.output == "csv":
        print_csv(rows)
    else:
        print_table(rows)


def main():
    cfg = load_config()

    p = argparse.ArgumentParser(
        prog="logs.py",
        description="Quick CloudWatch Logs Insights querying via templates."
    )
    sub = p.add_subparsers(dest="cmd", required=True)

    p_tpl = sub.add_parser("templates", help="List available query templates")
    p_tpl.set_defaults(func=lambda a: cmd_list_templates(a))

    p_lg = sub.add_parser("log-groups", help="List log groups by alias or prefix")
    p_lg.add_argument("--alias", help="Alias from config.json (e.g. cloudtrail, waf, flow)")
    p_lg.add_argument("--prefix", help="Log group name prefix to discover")
    p_lg.add_argument("--discover-limit", type=int, default=200)
    p_lg.set_defaults(func=lambda a: cmd_list_log_groups(a, cfg))

    p_run = sub.add_parser("run", help="Run a template against chosen log groups")
    p_run.add_argument("--template", required=True, help="Template name (without .sql)")
    p_run.add_argument("--param", action="append", help="Template param key=value (repeatable)")
    p_run.add_argument("--alias", help="Alias from config.json (e.g. cloudtrail, waf, flow)")
    p_run.add_argument("--prefix", help="Log group prefix to discover and query")
    p_run.add_argument("--log-group", action="append", help="Explicit log group name (repeatable)")
    p_run.add_argument("--discover-limit", type=int, default=200)
    p_run.add_argument("--minutes", type=int, default=0)
    p_run.add_argument("--hours", type=int, default=0)
    p_run.add_argument("--since", help="ISO8601 start time, e.g. 2026-01-06T18:00:00Z")
    p_run.add_argument("--limit", type=int, default=100)
    p_run.add_argument("--output", choices=["table", "json", "csv"], default="table")
    p_run.set_defaults(func=lambda a: cmd_run(a, cfg))

    args = p.parse_args()
    return args.func(args)


if __name__ == "__main__":
    main()