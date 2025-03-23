#!/usr/bin/env python3
import uuid
from datetime import datetime, timezone
from flask import Flask, jsonify, request
from functools import wraps
import functools
import awsgi
from dynamoutils import DynamoDBHelper
from organisertypes import Board, Task, Note
from datetime import datetime
from bedrock import Mistral, Meta
from db import (
    upsert_note,
    upsert_task,
    delete_note,
    delete_task,
    get_note,
    get_task,
    get_items,
)


app = Flask(__name__)


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
            if request.method in ['POST', 'PUT']:
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


@app.route("/upload", methods=["POST"])
@log_io()
@user_info
@parse_json
def upload(user, body):

    mistral = Mistral()
    x = mistral.invoke(body["text"])
    print("here")
    print(x)
    for i in x[0]:
        print("here in loop")

        print(i)
        if i["type"] == "note":
            # TODO: Need to pass the board id in the POST
            upsert_note(user["user_id"], i.get("board_id"), i)
            print("upserted note")
        elif i["type"] == "task":
            print("here3")
            upsert_task(
                user["user_id"], i.get("board_id"), i
            )
            print("upserted task")
    print("Done")
    return jsonify(x[0])


@app.route("/protected", methods=["GET"])
@user_info
def protected_endpoint(user_id, user_name, email, groups):
    return jsonify(
        {
            "message": "Access granted",
            "user_id": user_id,
            "user_name": user_name,
            "email": email,
            "groups": groups,
        }
    )

    # now = datetime.now(timezone.utc).isoformat()
    # if "ID" not in item or item["ID"] == "":
    #    item["ID"] = f"Board-{str(uuid.uuid4())}"
    #    item["CreatedDate"] = now

    # item["Owner"] = user["user_id"]
    # item["LastUpdate"] = now
    # board = Board(item)
    # return jsonify(board.to_dict())


@app.route("/boards", methods=["POST"])
@user_info
@parse_json
def upsert_board(user, body):
    """
    Create a board with associated tags and tasks in DynamoDB.

    Args:
        board_name (str): The name of the board.
        board_description (str): The description of the board.
        tags (list): List of tags to associate with the board.
        tasks (list): List of tasks to associate with the board.
        notes (list): List of notes to associate with the board.

    Returns:
        str: The unique ID of the created board.
    """
    now = datetime.now(timezone.utc).isoformat()
    if "ID" not in body or body["ID"] == "":
        body["ID"] = f"Board-{str(uuid.uuid4())}"
        body["CreatedDate"] = now

    body["Owner"] = user["user_id"]
    body["LastUpdate"] = now
    board = Board(body)
    try:
        r = dynamo.upsert(board.to_dict())
        return jsonify(r)
    except RuntimeError as e:
        return jsonify({"error": str(e)})


@app.route("/boards/<board_id>", methods=["DELETE"])
@user_info
def delete_board(user, board_id):

    try:
        r = dynamo.delete("Board", board_id)
        return jsonify(r)
    except RuntimeError as e:
        return jsonify({"error": str(e)})


@app.route("/boards/<board_id>")
@user_info
def get_board(user, board_id):

    try:
        r = dynamo.get("Board", board_id)
        return jsonify(r)
    except RuntimeError as e:
        return jsonify({"error": str(e)})


@app.route("/boards")
@user_info
def get_boards(user):
    try:
        r = dynamo.query_gsi(
            gsi_name="OwnerType",
            k1="Owner",
            v1=user["user_id"],
            k2="EntityType",
            v2="Board",
        )
        return jsonify(r)
    except RuntimeError as e:
        return jsonify({"error": str(e)})


# TODO: This fails and I don't know why.  Not even sure the method is called
@app.route("/boards/<board_id>/items", methods=["POST"])
@user_info
@parse_json
def upsert_board_item(user, board_id, body):
    print(body)
    dt = datetime.now(timezone.utc).isoformat()
    body["Owner"] = user["user_id"]
    body["LastUpdate"] = dt

    entityType = body["EntityType"]

    if "ID" not in body or body["ID"] == "":
        body["CreatedDate"] = dt
        if entityType == "Task":
            body["ID"] = f"{board_id}-Task-{str(uuid.uuid4())}"
        else:
            body["ID"] = f"{board_id}-Note-{str(uuid.uuid4())}"

    if entityType == "Task":
        i = Task(body)
    elif entityType == "Note":
        i = Note(body)
    else:
        raise ValueError("Invalid entity type")

    try:
        r = dynamo.upsert(i.to_dict())
        return jsonify(r)
    except RuntimeError as e:
        return jsonify({"error": str(e)})


@app.route("/boards/<board_id>/items/<item_id>")
@user_info
def get_item(user, board_id, item_id):
    if "Note" in item_id:
        entityType = "Note"
    elif "Task" in item_id:
        entityType = "Task"
    else:
        raise ValueError("Invalid entity type")
    try:
        r = dynamo.get(entityType, item_id)
        return jsonify(r)
    except RuntimeError as e:
        return jsonify({"error": str(e)})


@app.route("/boards/<board_id>/tasks")
@user_info
def get_board_tasks(user, board_id):
    try:
        r = dynamo.query_gsi(
            gsi_name="OwnerItemID",
            k1="Owner",
            v1=user["user_id"],
            k2="ID",
            v2=f"{board_id}-Task",
            startswith=True
        )
        return jsonify(r)
    except RuntimeError as e:
        return jsonify({"error": str(e)})


@app.route("/boards/<board_id>/notes")
@user_info
def get_board_notes(user, board_id):
    try:
        r = dynamo.query_gsi(
            gsi_name="OwnerItemID",
            k1="Owner",
            v1=user["user_id"],
            k2="ID",
            v2=f"{board_id}-Notes",
            startswith=True
        )
        return jsonify(r)
    except RuntimeError as e:
        return jsonify({"error": str(e)})


@app.after_request
def add_header(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response


# Entry point for AWS Lambda


def lambda_handler(event, context):
    return awsgi.response(app, event, context)


# Define the table name
TABLE_NAME = "Organiser"

dynamo = DynamoDBHelper(TABLE_NAME, "EntityType", "ID")

if __name__ == "__main__":
    app.run(debug=True)
