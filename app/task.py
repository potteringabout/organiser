#!/usr/bin/env python3
import uuid
from datetime import datetime, timezone
from flask import Flask, jsonify, request
from functools import wraps
import awsgi
import boto3
from dynamo import DynamoDBHelper
from organisertypes import Board
from datetime import date
from botocore.exceptions import ClientError
import json
import re
from datetime import datetime


def parse_dates(obj):
    """Recursively converts ISO date strings to datetime objects."""
    if isinstance(obj, dict):
        return {k: parse_dates(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [parse_dates(i) for i in obj]
    elif isinstance(obj, str):
        try:
            # Handle UTC Z format
            return datetime.fromisoformat(obj.replace("Z", "+00:00"))
        except ValueError:
            return obj  # Return as-is if not a valid date
    return obj


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
            "cognito:username")  # Cognito User ID
        email = authorizer.get("claims", {}).get("email")  # Cognito User ID
        groups = authorizer.get("claims", {}).get(
            "cognito:groups", "").split(",")

        user = {
            "user_id": user_id,
            "user_name": user_name,
            "email": email,
            "groups": groups
        }

        # Inject user info into the Flask function arguments
        return func(*args, user=user, **kwargs)
    return wrapper

def parse_json(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        kwargs.update(request.get_json() or {})
        return func(*args, **kwargs)
    return wrapper


def extract_json_from_string(text):
    """
    Extracts JSON objects from a given string and returns them as Python objects.

    Args:
        text (str): The input string containing JSON.

    Returns:
        list: A list of extracted JSON objects (dicts or lists).
    """
    json_objects = []

    # Regular expression to find JSON objects (matches {...} or [...])
    json_pattern = r'(\{.*?\}|\[.*?\])'

    # Find all matches
    matches = re.findall(json_pattern, text, re.DOTALL)

    for match in matches:
        try:
            parsed_json = json.loads(match)
            parsed_json = parse_dates(parsed_json)  # Convert dates
            json_objects.append(parsed_json)
        except json.JSONDecodeError:
            continue  # Skip invalid JSON

    return json_objects


def generate_id():
    return uuid.uuid4().hex


# Create an Amazon Bedrock Runtime client.
brt = boto3.client("bedrock-runtime", region_name='eu-west-2')

@app.route("/upload", methods=["POST"])
@parse_json
def upload(text):

    model_id = "meta.llama3-70b-instruct-v1:0"
    today = date.today()

    # Define the prompt for the model.
    prompt = f"""
    Today is {today}. The following text is describes some actions that need to be taken, or it might be an update with no actions requireed.  Or it may contain both.  If it there is an update, it should be a single update.  IE. it could span multiple sentences.  Extract the update and actions.
    I'd like the response in JSON formation. It should be a list of dictionary objects.  The dictionary object should have a type (action or update), the text, and a dueDate.  If there is no due date, then the dueDate should not be included.
    If a due date can be inferred for the action, include that as an attribute of the action converted to YYYY-MM-DD. If calculating the due date based on a day ( EG. next Tuesday ), assume the task to be due by 11am. 
    Please also correct any spelling mistakes in the text.  Reword the text to be concise and professional.
    The text is  :  {text}
    """

    user_message = "Describe the purpose of a 'hello world' program in one line."
    formatted_prompt = f"""
    <|begin_of_text|><|start_header_id|>user<|end_header_id|>
    {prompt}
    <|eot_id|>
    <|start_header_id|>assistant<|end_header_id|>
    """

    # Define the request payload
    payload = {
        "prompt": formatted_prompt,
        "max_gen_len": 1024,
        "temperature": 0.0
    }

    # Invoke the model
    response = brt.invoke_model(
        modelId=model_id,
        contentType='application/json',
        accept='application/json',
        body=json.dumps(payload)
    )

    # Parse the response
    response_body = json.loads(response['body'].read())
    generated_text = response_body.get('generation', '')

    x = extract_json_from_string(generated_text)

    return jsonify(x)


@app.route("/protected", methods=["GET"])
@user_info
def protected_endpoint(user_id, user_name, email, groups):
    return jsonify({
        "message": "Access granted",
        "user_id": user_id,
        "user_name": user_name,
        "email": email,
        "groups": groups
    })


@app.route("/boards", methods=["POST"])
@user_info
@parse_json
def create_board(user, name, description):
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
    board_id = f"Board-{str(uuid.uuid4())}"

    created_date = datetime.now(timezone.utc).isoformat()

    board = {
        "EntityType": "Board",
        "ID": board_id,
        "Name": name,
        "Description": description,
        "CreatedDate": created_date,
        "Owner": user["user_id"]
    }

    board = Board(board)
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
        r = dynamo.query_gsi(gsi_name="OwnerType", k1="Owner",
                             v1=user["user_id"], k2="EntityType", v2="Board")
        return jsonify(r)
    except RuntimeError as e:
        return jsonify({"error": str(e)})


@app.after_request
def add_header(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

# Entry point for AWS Lambda


def lambda_handler(event, context):
    return awsgi.response(app, event, context)


# Define the table name
TABLE_NAME = "Organiser"

dynamo = DynamoDBHelper(TABLE_NAME, "EntityType", "ID")

if __name__ == "__main__":
    app.run(debug=True)
