#!/usr/bin/env python3
# import boto3
import uuid
from datetime import datetime, timezone
from flask import Flask, jsonify, request
from functools import wraps
import functools
import awsgi
from datetime import datetime
from bedrock import Mistral, Meta
from db import get_session, init_db
from models import Board, Task
from sqlmodel import select


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


@app.route("/api/boards")
@user_info
def get_boards(user):
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
    try:
        with get_session() as session:
            board = Board(title=body["name"], owner=user["user_id"])
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
    try:
        with get_session() as session:
            board = session.get(Board, board_id)

            if not board:
                return jsonify({"error": "Board not found"}), 404
            if board.owner != user["user_id"]:
                return jsonify({"error": "Unauthorized"}), 403

            # Apply updates from the request body
            if "name" in body:
                board.title = body["name"]

            # Add other fields here if needed

            session.add(board)
            session.commit()
            session.refresh(board)
            return jsonify(board.model_dump())

    except RuntimeError as e:
        return jsonify({"error": str(e)}), 500


# region Board Delete
@app.route("/api/boards/<int:board_id>", methods=["DELETE"])
@log_io()
@user_info
def delete_board(board_id, user):
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
# endregion


@app.after_request
def add_header(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response


# Entry point for AWS Lambda
def lambda_handler(event, context):
    return awsgi.response(app, event, context)
