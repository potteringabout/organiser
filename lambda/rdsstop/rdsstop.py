import boto3
import os

rds = boto3.client("rds")
INSTANCE_ID = os.environ["RDS_INSTANCE_ID"]


def lambda_handler(event, context):
    status = rds.describe_db_instances(DBInstanceIdentifier=INSTANCE_ID)[
        "DBInstances"][0]["DBInstanceStatus"]

    if status == "stopped":
        return {"message": f"RDS already stopped (status: {status})"}

    rds.stop_db_instance(DBInstanceIdentifier=INSTANCE_ID)
    return {"message": f"Stopped {INSTANCE_ID}"}