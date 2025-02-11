#!/usr/bin/env python3
import uuid
from datetime import datetime, timezone
from flask import Flask, jsonify, request
from functools import wraps
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
        @wraps(func)
        def wrapper(*args, **kwargs):
            if enabled:
                print(f"Calling function: {func.__name__}")
                print(f"Input args: {args}")
                print(f"Input kwargs: {kwargs}")
            result = func(*args, **kwargs)
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
        groups = authorizer.get("claims", {}).get("cognito:groups", "").split(",")

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
      json_data = request.get_json(silent=True) or {}

      if not isinstance(json_data, dict):  # Ensure JSON is a dictionary
        return jsonify({"error": "Invalid JSON format"}), 400
      
      # Assign the entire body to 'body' param for POST/PUT
      if request.method in ['POST', 'PUT']:
        kwargs['body'] = json_data
      else:
        # Merge JSON fields into kwargs (avoiding conflicts)
        for key in json_data:
          if key in kwargs:
            return jsonify({"error": f"Conflict: '{key}' already in function parameters"}), 400
        kwargs.update(json_data)

      return func(*args, **kwargs)
    except Exception as e:
      return jsonify({"error": str(e)}), 400

  return wrapper


def generate_id():
    return uuid.uuid4().hex


@app.route("/upload", methods=["POST"])
@user_info
@parse_json
def upload(user, text):

    mistral = Mistral()
    x = mistral.invoke(text)
    for i in x:
        print(i)
        if i["type"] == "note":
            # TODO: Need to pass the board id in the POST
            upsert_note(user["user_id"], i.get("board_id"), i.get("text"))
        elif i["type"] == "task":
            upsert_task(
                user["user_id"], i.get("board_id"), i.get("text"), i.get("dueDate")
            )

    return jsonify(x)


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


@app.route("/boards2", methods=["POST"])
#@user_info
#@parse_json
def upsert_board2():
    return jsonify({"success": True})


@app.route("/boards3", methods=["POST"])
#@user_info
#@parse_json
def upsert_board3():
    x = request.get_json()
    return jsonify(x)

@app.route("/boards4", methods=["POST"])
@user_info
#@parse_json
def upsert_board4(user):
    item = request.get_json()
    return jsonify(user)


@app.route("/boards5", methods=["POST"])
@user_info
@parse_json
def upsert_board5(user, body):
    item = request.get_json()
    return jsonify(user)


    #now = datetime.now(timezone.utc).isoformat()
    #if "ID" not in item or item["ID"] == "":
    #    item["ID"] = f"Board-{str(uuid.uuid4())}"
    #    item["CreatedDate"] = now

    #item["Owner"] = user["user_id"]
    #item["LastUpdate"] = now
    #board = Board(item)
    #return jsonify(board.to_dict())


@app.route("/boards", methods=["POST"])
@user_info
#@parse_json
def upsert_board(user):
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
    item = request.get_json()
    now = datetime.now(timezone.utc).isoformat()
    if "ID" not in item or item["ID"] == "":
        item["ID"] = f"Board-{str(uuid.uuid4())}"
        item["CreatedDate"] = now

    item["Owner"] = user["user_id"]
    item["LastUpdate"] = now
    board = Board(item)
    try:
        r = dynamo.upsert(board.to_dict())
        return jsonify(r)
    except RuntimeError as e:
        return jsonify({"error": str(e)})


@app.route("/boards/<board_id>", methods=["DELETE"])
def delete_board(board_id):

    try:
        r = dynamo.delete("Board", board_id)
        return jsonify(r)
    except RuntimeError as e:
        return jsonify({"error": str(e)})


@app.route("/boards/<board_id>")
def get_board(board_id):

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

@app.route("/boards/<board_id>/items", methods=["POST"]) # TODO: This fails and I don't know why.  Not even sure the method is called
@user_info
def upsert_board_item(user, board_id):
    item = request.get_json()
    print(item)
    dt = datetime.now(timezone.utc).isoformat()
    item["Owner"] = user["user_id"]
    item["LastUpdate"] = dt

    entityType = item["EntityType"]

    if "ID" not in item or item["ID"] == "":
      item["CreatedDate"] = dt
      if entityType == "Task":
        item["ID"] = f"{board_id}-Task-{str(uuid.uuid4())}"
      else:
        item["ID"] = f"{board_id}-Note-{str(uuid.uuid4())}"

    if entityType == "Task":
      i = Task(item)
    elif entityType == "Note":
      i = Note(item)
    else:
      raise ValueError("Invalid entity type")
    
    try:
      r = dynamo.upsert(i.to_dict())
      return jsonify(r)
    except RuntimeError as e:
      return jsonify({"error": str(e)})  


@app.route("/boards/<board_id>/items/<item_id>")
def get_item(board_id, item_id):
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
