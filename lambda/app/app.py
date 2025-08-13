#!/usr/bin/env python3
# import boto3
import uuid
from flask import Flask, jsonify, request
from functools import wraps
import functools
import awsgi
from datetime import datetime, timedelta, timezone
from bedrock import Mistral, Meta
from db import get_session, init_db, drop_db
from models import Board, Task, Note, Entity, MeetingEntity, Meeting, TaskBlocker, EntityType
from sqlmodel import select
from sqlalchemy import not_


'''
rds = boto3.client("rds", region_name="eu-west-2")

DB_INSTANCE_ID = "your-db-instance-id"


def get_status():
    response = rds.describe_db_instances(DBInstanceIdentifier=DB_INSTANCE_ID)
    return response["DBInstances"][0]["DBInstanceStatus"]


def start_instance():
    status = get_status()
    if status == "available":
        print(f"RDS instance '{DB_INSTANCE_ID}' is already running.")
    elif status in ["stopped", "stopping"]:
        print(f"Starting RDS instance '{DB_INSTANCE_ID}'...")
        rds.start_db_instance(DBInstanceIdentifier=DB_INSTANCE_ID)
    elif status in ["starting"]:
        print(f"RDS instance '{DB_INSTANCE_ID}' is already starting.")
    else:
        print(f"RDS instance in unexpected state: {status}")


def stop_instance():
    status = get_status()
    if status == "stopped":
        print(f"RDS instance '{DB_INSTANCE_ID}' is already stopped.")
    elif status in ["available", "starting"]:
        print(f"Stopping RDS instance '{DB_INSTANCE_ID}'...")
        rds.stop_db_instance(DBInstanceIdentifier=DB_INSTANCE_ID)
    elif status == "stopping":
        print(f"RDS instance '{DB_INSTANCE_ID}' is already stopping.")
    else:
        print(f"RDS instance in unexpected state: {status}")


def show_status():
    status = get_status()
    print(f"RDS instance '{DB_INSTANCE_ID}' status: {status}")

'''


app = Flask(__name__)
init_db()


def log_io(enabled=True):
    """
    A decorator to optionally print the input arguments and output of a function.

    Args:
        enabled (bool): If True, log function input and output.
    """

    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            if enabled:
                print(f"Calling function: {func.__name__}")
                print(f"Input args: {args}")
                print(f"Input kwargs: {kwargs}")
            result = func(*args, **kwargs)  # Execute the actual function
            if enabled:
                print(f"Output: {result}")
            return result

        return wrapper

    return decorator


def user_info(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        # Get the AWS Lambda event object from awsgi
        event = request.environ.get("awsgi.event", {})
        authorizer = event.get("requestContext", {}).get("authorizer", {})

        # Extract identity information from the authorizer context
        user_id = authorizer.get("claims", {}).get("sub")  # Cognito User ID
        user_name = authorizer.get("claims", {}).get(
            "cognito:username"
        )  # Cognito User ID
        email = authorizer.get("claims", {}).get("email")  # Cognito User ID
        groups = authorizer.get("claims", {}).get(
            "cognito:groups", "").split(",")

        user = {
            "user_id": user_id,
            "user_name": user_name,
            "email": email,
            "groups": groups,
        }

        # Inject user info into the Flask function arguments
        return func(*args, user=user, **kwargs)

    return wrapper


def parse_json(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            if not request.is_json:  # Avoid calling get_json unnecessarily
                return jsonify({"error": "Request must be JSON"}), 400

            json_data = request.get_json(silent=True) or {}

            if not isinstance(json_data, dict):  # Ensure JSON is a dictionary
                return jsonify({"error": "Invalid JSON format"}), 400

            # Assign entire body to 'body' for POST/PUT requests
            if request.method in ['POST', 'PUT', 'PATCH']:
                print("Assigning body to kwargs")
                kwargs['body'] = json_data
            else:
                # Merge JSON fields into kwargs, avoiding conflicts
                for key in json_data:
                    if key in kwargs:
                        return jsonify({"error": f"Conflict: '{key}' already in function parameters"}), 400
                kwargs.update(json_data)

            return func(*args, **kwargs)

        except Exception as e:
            return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

    return wrapper


def generate_id():
    return uuid.uuid4().hex


@app.route("/api/schema-reload")
@user_info
def schema_reload(user):
    '''
    Reload the database schema
    '''
    drop_db()
    init_db()
    return jsonify({"message": "Schema reloaded"})


# region Boards
@app.route("/api/boards")
@user_info
def get_boards(user):
    '''
    Get all boards
    '''
    try:
        with get_session() as session:
            boards = session.exec(select(Board)).all()
            return jsonify([b.model_dump() for b in boards])
    except RuntimeError as e:
        return jsonify({"error": str(e)})


@app.route("/api/boards", methods=["POST"])
@log_io()
@user_info
@parse_json
def create_board(user, body):
    '''
    Create a board
    '''
    try:
        with get_session() as session:
            board = Board(title=body["title"], owner=user["user_id"])
            session.add(board)
            session.commit()
            session.refresh(board)
            return jsonify(board.model_dump())
    except RuntimeError as e:
        return jsonify({"error": str(e)})


@app.route("/api/boards/<int:board_id>", methods=["PATCH"])
@log_io()
@user_info
@parse_json
def update_board(board_id, user, body):
    '''
    Update a board
    '''
    try:
        with get_session() as session:
            board = session.get(Board, board_id)

            if not board:
                return jsonify({"error": "Board not found"}), 404
            if board.owner != user["user_id"]:
                return jsonify({"error": "Unauthorized"}), 403

            # Apply updates from the request body
            if "title" in body:
                board.title = body["title"]

            # Add other fields here if needed

            session.add(board)
            session.commit()
            session.refresh(board)
            return jsonify(board.model_dump())

    except RuntimeError as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/boards/<int:board_id>", methods=["DELETE"])
@log_io()
@user_info
def delete_board(board_id, user):
    '''
    Delete a board
    '''
    try:
        with get_session() as session:
            board = session.get(Board, board_id)

            if not board:
                return jsonify({"error": "Board not found"}), 404
            if board.owner != user["user_id"]:
                return jsonify({"error": "Unauthorized"}), 403

            session.delete(board)
            session.commit()

            return jsonify({"message": "Board deleted", "id": board_id})

    except RuntimeError as e:
        return jsonify({"error": str(e)}), 500

# end region Boards


@app.route("/api/tasks", methods=["POST"])
@log_io()
@user_info
@parse_json
def add_task(user, body):
    '''
    Add a task to a board, optionally as a sub-task
    '''
    try:
        with get_session() as session:
            board_id = body["board_id"]
            board = session.get(Board, board_id)

            if not board:
                return jsonify({"error": "Board not found"}), 404
            if board.owner != user["user_id"]:
                return jsonify({"error": "Unauthorized"}), 403

            # Check for optional parent task
            parent_id = body.get("parent_id")
            if parent_id:
                parent_task = session.get(Task, parent_id)
                if not parent_task:
                    return jsonify({"error": "Parent task not found"}), 404
                if parent_task.board_id != board_id:
                    return jsonify({"error": "Parent task must be on the same board"}), 400

            task = Task(
                title=body["title"],
                status=body.get("status", "todo"),
                board_id=board_id,
                parent_id=parent_id,  # This may be None
                owner=user["user_id"]
            )
            session.add(task)
            session.commit()
            session.refresh(task)

            return jsonify({"message": "Task created", "task": task.model_dump()}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/tasks/<int:task_id>", methods=["PUT"])
@log_io()
@user_info
@parse_json
def update_task(task_id, user, body):
    '''
    Update a task
    '''
    try:
        with get_session() as session:
            task = session.get(Task, task_id)

            if not task:
                return jsonify({"error": "Task not found"}), 404
            if task.owner != user["user_id"]:
                return jsonify({"error": "Unauthorized"}), 403

            task.title = body.get("title", task.title)
            task.status = body.get("status", task.status)
            session.commit()
            session.refresh(task)

            return jsonify({"message": "Task updated", "task": task.model_dump()})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
@log_io()
@user_info
def delete_task(task_id, user):
    '''
    Delete a task
    '''
    try:
        with get_session() as session:
            task = session.get(Task, task_id)

            if not task:
                return jsonify({"error": "Task not found"}), 404
            if task.owner != user["user_id"]:
                return jsonify({"error": "Unauthorized"}), 403

            session.delete(task)
            session.commit()
            return jsonify({"message": "Task deleted", "id": task_id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/boards/<int:board_id>/tasks", methods=["GET"])
@log_io()
@user_info
def list_tasks(board_id, user):
    '''
    List tasks for a board
    '''
    try:
        with get_session() as session:
            board = session.get(Board, board_id)

            if not board:
                return jsonify({"error": "Board not found"}), 404
            if board.owner != user["user_id"]:
                return jsonify({"error": "Unauthorized"}), 403

            cutoff = datetime.now(timezone.utc) - timedelta(days=14)
            tasks = session.exec(
                select(Task).where(
                    Task.board_id == board_id,
                    not_((Task.status == "done") & (Task.last_modified < cutoff))
                )
            ).all()
            return jsonify([task.model_dump() for task in tasks])
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/tasks/<int:task_id>", methods=["GET"])
@log_io()
@user_info
def get_task(task_id, user):
    '''
    Get a task, including its subtasks and notes, ordered by creation time
    '''
    try:
        with get_session() as session:
            task = session.get(Task, task_id)

            if not task:
                return jsonify({"error": "Task not found"}), 404

            if task.owner != user["user_id"]:
                return jsonify({"error": "Unauthorized"}), 403

            subtasks = session.exec(
                select(Task)
                .where(Task.parent_id == task_id)
                .order_by(Task.created_at)
            ).all()

            notes = session.exec(
                select(Note)
                .where(Note.task_id == task_id)
                .order_by(Note.created_at)
            ).all()

            return jsonify({
                "task": task.model_dump(),
                "subtasks": [t.model_dump() for t in subtasks],
                "notes": [n.model_dump() for n in notes]
            })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/notes", methods=["POST"])
@log_io()
@user_info
@parse_json
def add_note(user, body):
    '''
    Add a note to a board or task
    '''
    try:
        with get_session() as session:
            board_id = body["board_id"]
            board = session.get(Board, board_id)

            if not board:
                return jsonify({"error": "Board not found"}), 404
            if board.owner != user["user_id"]:
                return jsonify({"error": "Unauthorized"}), 403

            task_id = body.get("task_id")
            if task_id:
                task = session.get(Task, task_id)
                if not task or task.board_id != board_id:
                    return jsonify({"error": "Invalid or mismatched task_id"}), 400
                if task.owner != user["user_id"]:
                    return jsonify({"error": "Unauthorized"}), 403

            note = Note(
                board_id=board_id,
                task_id=task_id,
                content=body["content"],
                owner=user["user_id"]
            )
            session.add(note)
            session.commit()
            session.refresh(note)

            return jsonify({"message": "Note created", "note": note.model_dump()}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/notes/<int:note_id>", methods=["PUT"])
@log_io()
@user_info
@parse_json
def update_note(note_id, user, body):
    '''
    Update a note
    '''
    try:
        with get_session() as session:
            note = session.get(Note, note_id)
            if not note:
                return jsonify({"error": "Note not found"}), 404
            if note.owner != user["user_id"]:
                return jsonify({"error": "Unauthorized"}), 403

            board = session.get(Board, note.board_id)
            if board.owner != user["user_id"]:
                return jsonify({"error": "Unauthorized"}), 403

            note.content = body.get("content", note.content)
            
            if "task_id" in body:
                new_task_id = body["task_id"]
                if new_task_id is not None:
                    task = session.get(Task, new_task_id)
                    if not task:
                        return jsonify({"error": "Task not found"}), 404
                    if task.board_id != note.board_id:
                        return jsonify({"error": "Task must be on the same board"}), 400
                    if task.owner != user["user_id"]:
                        return jsonify({"error": "Unauthorized"}), 403
                note.task_id = new_task_id  # <- This line applies the change

            if "meeting_id" in body:
                new_meeting_id = body["meeting_id"]
                if new_meeting_id is not None:
                    meeting = session.get(Meeting, new_meeting_id)
                    if not meeting:
                        return jsonify({"error": "Meeting not found"}), 404
                    if meeting.board_id != note.board_id:
                        return jsonify({"error": "Meeting must be on the same board"}), 400
                    if meeting.owner != user["user_id"]:
                        return jsonify({"error": "Unauthorized"}), 403
                note.meeting_id = new_meeting_id  # <- This line applies the change

            session.commit()
            session.refresh(note)

            return jsonify({"message": "Note updated", "note": note.model_dump()})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/notes/<int:note_id>", methods=["DELETE"])
@log_io()
@user_info
def delete_note(note_id, user):
    '''
    Delete a note
    '''
    try:
        with get_session() as session:
            note = session.get(Note, note_id)
            if not note:
                return jsonify({"error": "Note not found"}), 404

            if note.owner != user["user_id"]:
                return jsonify({"error": "Unauthorized"}), 403

            session.delete(note)
            session.commit()
            return jsonify({"message": "Note deleted", "id": note_id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500



# --- helpers for date range parsing ---
def _parse_iso_datetime_utc(value: str) -> datetime:
    """
    Parse an ISO-like string. Supports:
    - full datetime with or without timezone (assumes UTC if none)
    - date-only (YYYY-MM-DD), interpreted as 00:00:00 UTC that day
    Returns an aware UTC datetime.
    """
    try:
        dt = datetime.fromisoformat(value)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    except Exception:
        # try date-only
        try:
            d = datetime.strptime(value, "%Y-%m-%d").date()
            return datetime(d.year, d.month, d.day, tzinfo=timezone.utc)
        except Exception as e:
            raise ValueError(f"Invalid date/datetime: {value}") from e


def _resolve_time_window_from_args(args):
    """
    Compute a half-open UTC interval [start, end) from query params.
    Priority: if either 'from' or 'to' is supplied, ignore 'days'.
    - from: ISO date/datetime (UTC assumed when tz missing)
    - to:   ISO date/datetime; if date-only, treated inclusive by bumping to next midnight UTC
    - days: positive integer; window is [now-days, now)
    Returns (start_utc or None, end_utc or None).
    """
    q_from = args.get("from")
    q_to = args.get("to")
    q_days = args.get("days")

    # Explicit bounds take precedence
    if q_from or q_to:
        start_utc = _parse_iso_datetime_utc(q_from) if q_from else None
        end_utc = None
        if q_to:
            end_utc = _parse_iso_datetime_utc(q_to)
            # If 'to' looked like a date-only, make it inclusive by bumping to next day
            if "T" not in q_to and ":" not in q_to:
                end_utc = end_utc + timedelta(days=1)
        return start_utc, end_utc

    # Fallback to days rolling window
    if q_days is not None:
        try:
            days = int(q_days)
            if days <= 0:
                raise ValueError
        except ValueError:
            raise ValueError("days must be a positive integer")
        now_utc = datetime.now(timezone.utc)
        return now_utc - timedelta(days=days), now_utc

    # No time filter
    return None, None
# --- end helpers ---


@app.route("/api/boards/<int:board_id>/notes", methods=["GET"])
@log_io()
@user_info
def list_notes(board_id, user):
    '''
    List notes for a board, optionally filtered by last_modified using one of:
      - ?days=INTEGER               → last X days (rolling window)
      - ?from=ISO[Z]&to=ISO[Z]      → explicit UTC range (half-open [start,end))
      - ?from=ISO[Z]                → from this time onwards
      - ?to=ISO[Z]                  → up to (but not including) this time
    For date-only values (YYYY-MM-DD), 'to' is treated inclusive (bumped to next midnight UTC).
    '''
    try:
        with get_session() as session:
            board = session.get(Board, board_id)
            if not board:
                return jsonify({"error": "Board not found"}), 404
            if board.owner != user["user_id"]:
                return jsonify({"error": "Unauthorized"}), 403

            # Resolve time window
            try:
                start_utc, end_utc = _resolve_time_window_from_args(request.args)
            except ValueError as ve:
                return jsonify({"error": str(ve)}), 400

            query = select(Note).where(Note.board_id == board_id)

            # Apply half-open interval [start, end)
            if start_utc is not None:
                query = query.where(Note.last_modified >= start_utc)
            if end_utc is not None:
                query = query.where(Note.last_modified < end_utc)

            notes = session.exec(query).all()
            return jsonify([note.model_dump() for note in notes])
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# region Meetings API

@app.route("/api/meetings", methods=["POST"])
@log_io()
@user_info
@parse_json
def create_meeting(user, body):
    '''
    Create a meeting (one-off or recurring)
    '''
    try:
        with get_session() as session:
            meeting = Meeting(
                board_id=body["board_id"],
                title=body["title"],
                owner=user["user_id"],
                date=body["date"],
                recurrence=body.get("recurrence")  # Optional
            )
            session.add(meeting)
            session.commit()
            session.refresh(meeting)
            return jsonify({"message": "Meeting created", "meeting": meeting.model_dump()}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/meetings/<int:meeting_id>", methods=["PUT"])
@log_io()
@user_info
@parse_json
def update_meeting(meeting_id, user, body):
    '''
    Update a meeting
    '''
    try:
        with get_session() as session:
            meeting = session.get(Meeting, meeting_id)
            if not meeting:
                return jsonify({"error": "Meeting not found"}), 404
            if meeting.owner != user["user_id"]:
                return jsonify({"error": "Unauthorized"}), 403

            print(f"Meeting title 1 : {body.get('title')}")
            meeting.title = body.get("title", meeting.title)
            print(f"Meeting title 2 : {meeting.title}")
            meeting.date = body.get("date", meeting.date)
            meeting.recurrence = body.get("recurrence", meeting.recurrence)

            session.commit()
            session.refresh(meeting)
            return jsonify({"message": "Meeting updated", "meeting": meeting.model_dump()})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/meetings/<int:meeting_id>", methods=["DELETE"])
@log_io()
@user_info
def delete_meeting(meeting_id, user):
    '''
    Delete a meeting
    '''
    try:
        with get_session() as session:
            meeting = session.get(Meeting, meeting_id)
            if not meeting:
                return jsonify({"error": "Meeting not found"}), 404
            if meeting.owner != user["user_id"]:
                return jsonify({"error": "Unauthorized"}), 403

            session.delete(meeting)
            session.commit()
            return jsonify({"message": "Meeting deleted", "id": meeting_id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/boards/<int:board_id>/meetings", methods=["GET"])
@log_io()
@user_info
def list_board_meetings(board_id, user):
    '''
    List meetings for a board
    '''
    try:
        with get_session() as session:
            board = session.get(Board, board_id)
            if not board:
                return jsonify({"error": "Board not found"}), 404
            if board.owner != user["user_id"]:
                return jsonify({"error": "Unauthorized"}), 403

            meetings = session.exec(select(Meeting).where(Meeting.board_id == board_id)).all()
            return jsonify([note.model_dump() for note in meetings])
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/meetings", methods=["GET"])
@log_io()
@user_info
def list_meetings(user):
    '''
    List meetings owned by the user
    '''
    try:
        with get_session() as session:
            meetings = session.exec(
                select(Meeting).where(Meeting.owner == user["user_id"])
            ).all()
            return jsonify([m.model_dump() for m in meetings])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# endregion Meetings API
    
    
@app.route("/api/diary/<when>", methods=["GET"])
@log_io()
@user_info
def get_diary_entries(user, when: str = "today"):
    user_id = user["user_id"]
    now = datetime.now(timezone.utc)
    if when == "yesterday":
        start = (now - timedelta(days=1)).replace(hour=0,
                                                  minute=0, second=0, microsecond=0)
        end = start + timedelta(days=1)
    else:  # today
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end = start + timedelta(days=1)

    try:
        with get_session() as session:
            # Resolve Entity for user_id (email or system ID)
            entity = session.exec(select(Entity).where(
                Entity.name == user_id)).first()
            if not entity:
                return jsonify({"error": "User entity not found"}), 404

            # Completed tasks
            completed_tasks = session.exec(
                select(Task).where(
                    Task.assigned_to == entity.id,
                    Task.status == Status.DONE,
                    Task.last_modified >= start,
                    Task.last_modified < end
                )
            ).all()

            # Due today
            due_tasks = session.exec(
                select(Task).where(
                    Task.assigned_to == entity.id,
                    Task.due_date >= start,
                    Task.due_date < end
                )
            ).all()

            # Notes created or modified
            notes = session.exec(
                select(Note).where(
                    Note.user_id == user_id,
                    Note.last_modified >= start,
                    Note.last_modified < end
                )
            ).all()

            # Meetings attended
            meetings = session.exec(
                select(Meeting)
                .join(MeetingEntity)
                .where(
                    MeetingEntity.entity_id == entity.id,
                    Meeting.datetime >= start,
                    Meeting.datetime < end
                )
            ).all()

            return {
                "completed_tasks": completed_tasks,
                "due_tasks": due_tasks,
                "notes": notes,
                "meetings": meetings
            }

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/entities/<int:entity_id>", methods=["DELETE"])
@log_io()
@user_info
def delete_entity(entity_id, user):
    '''
    Delete a person or team entity
    '''
    try:
        with get_session() as session:
            entity = session.get(Entity, entity_id)
            if not entity:
                return jsonify({"error": "Entity not found"}), 404
            if entity.owner != user["user_id"]:
                return jsonify({"error": "Unauthorized"}), 403

            session.delete(entity)
            session.commit()
            return jsonify({"message": "Entity deleted", "id": entity_id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/entities", methods=["POST"])
@log_io()
@user_info
@parse_json
def add_entity(user, body):
    '''
    Add a new person or team entity
    '''
    try:
        name = body["name"]
        type_ = body.get("type", "person").lower()
        email = body.get("email")
        description = body.get("description")
        owner = user["user_id"]

        entity_type = None
        try:
            entity_type = EntityType[type_.upper()]
        except KeyError:
            return jsonify({"error": "Invalid entity type"}), 400
        
        with get_session() as session:
            existing = session.exec(
                select(Entity).where(Entity.name == name, Entity.type == entity_type)
            ).first()
            if existing:
                return jsonify({"error": "Entity already exists"}), 409

            entity = Entity(
                name=name,
                type=entity_type,
                email=email,
                description=description,
                owner=owner
            )
            session.add(entity)
            session.commit()
            session.refresh(entity)

            return jsonify({"message": "Entity created", "entity": entity.model_dump()}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/entities/<int:entity_id>", methods=["PUT"])
@log_io()
@user_info
@parse_json
def update_entity(entity_id, user, body):
    '''
    Update a person or team entity
    '''
    try:
        with get_session() as session:
            entity = session.get(Entity, entity_id)
            if not entity:
                return jsonify({"error": "Entity not found"}), 404
            if entity.owner != user["user_id"]:
                return jsonify({"error": "Unauthorized"}), 403

            entity.name = body.get("name", entity.name)
            entity.email = body.get("email", entity.email)
            entity.description = body.get("description", entity.description)
            
            session.commit()
            session.refresh(entity)
            return jsonify({"message": "Entity updated", "entity": entity.model_dump()})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/entities", methods=["GET"])
@log_io()
@user_info
def list_entities(user):
    '''
    List people or teams (entities), with optional filters
    '''
    try:
        entity_type = request.args.get("type")  # e.g., "person" or "team"
        search = request.args.get("search", "").strip().lower()

        with get_session() as session:
            query = select(Entity)

            if entity_type:
                if entity_type.lower() not in EntityType.__members__:
                    return jsonify({"error": "Invalid entity type filter"}), 400
                query = query.where(Entity.type == EntityType[entity_type.upper()])

            if search:
                query = query.where(Entity.name.ilike(f"%{search}%"))

            results = session.exec(query).all()

            return jsonify([
                {
                    "id": e.id,
                    "name": e.name,
                    "type": e.type,
                    "email": e.email,
                    "description": e.description
                } for e in results
            ])
    except Exception as e:
        return jsonify({"error": str(e)}), 500  


@app.after_request
def add_header(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response


# Entry point for AWS Lambda
def lambda_handler(event, context):
    return awsgi.response(app, event, context)
