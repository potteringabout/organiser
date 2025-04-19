#!/usr/bin/env python3
import uuid
import json
from datetime import datetime, timezone
from dynamoutils import DynamoDBHelper
from organisertypes import Board, Note, Task

user = {"user_id": "a6a202b4-a031-70b9-1c2c-9e726f149560"}

# TODO: Need to put some validation in here so that the user can;t get or delete object that don't belong to them

def upsert_board(user, board_id, ob):
    """
    Create a note with associated tags and tasks in DynamoDB.

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
    if "ID" not in ob or ob["ID"] == "":
        ob["ID"] = f"Board-{str(uuid.uuid4())}"
        ob["CreatedDate"] = now
    
    ob["Owner"] = user["user_id"]
    ob["LastUpdate"] = now
    
    board = Board(ob)

    try:
        r = dynamo.upsert(board.to_dict())
        return r
    except RuntimeError as e:
        return {"error": str(e)}


def upsert_note(user, board_id, ob):
    """
    Create a note with associated tags and tasks in DynamoDB.

    Args:
        board_name (str): The name of the board.
        board_description (str): The description of the board.
        tags (list): List of tags to associate with the board.
        tasks (list): List of tasks to associate with the board.
        notes (list): List of notes to associate with the board.

    Returns:
        str: The unique ID of the created board.
    """
    if isinstance(ob, str):
        ob = json.loads(ob)

    print(f"Posting note: {ob}")
    now = datetime.now(timezone.utc).isoformat()
    if "ID" not in ob or ob["ID"] == "":
        ob["ID"] = f"{board_id}-Note-{str(uuid.uuid4())}"
        ob["CreatedDate"] = now
    
    ob["Owner"] = user["user_id"]
    ob["LastUpdate"] = now
    
    print(f"Note: {ob}")
    note = Note(ob)

    try:
        r = dynamo.upsert(note.to_dict())
        return r
    except RuntimeError as e:
        return {"error": str(e)}


def upsert_task(user, board_id, ob):
    """
    Create a note with associated tags and tasks in DynamoDB.

    Args:
        board_name (str): The name of the board.
        board_description (str): The description of the board.
        tags (list): List of tags to associate with the board.
        tasks (list): List of tasks to associate with the board.
        notes (list): List of notes to associate with the board.

    Returns:
        str: The unique ID of the created board.
    """
    if isinstance(ob, str):
        ob = json.loads(ob)

    print(f"Posting task: {ob}")
    now = datetime.now(timezone.utc).isoformat()
    if "ID" not in ob or ob["ID"] == "":
        ob["ID"] = f"{board_id}-Task-{str(uuid.uuid4())}"
        ob["CreatedDate"] = now
    
    ob["Owner"] = user["user_id"]
    ob["LastUpdate"] = now
    print(f"Task: {ob}")
    task = Task(ob)

    try:
        r = dynamo.upsert(task.to_dict())
        return r
    except RuntimeError as e:
        return {"error": str(e)}


def delete_note(user, id):
    try:
        dynamo.delete("Note", id)
        return {"success": True}
    except RuntimeError as e:
        return {"error": str(e)}

def delete_task(user, id):
    try:
        dynamo.delete("Task", id)
        return {"success": True}
    except RuntimeError as e:
        return {"error": str(e)}

def get_note(user, id):
    try:
        r = dynamo.get("Note", id)
        return r
    except RuntimeError as e:
        return {"error": str(e)}

def get_task(user, id):
    try:
        r = dynamo.get("Task", id)
        return r
    except RuntimeError as e:
        return {"error": str(e)}

def get_items(user, board_id):

    try:
        r = dynamo.query_gsi(
            gsi_name="OwnerItemID",
            k1="Owner",
            v1=user["user_id"],
            k2="ID",
            v2=f"{board_id}-",
            startswith=True,
        )

        return r
    except RuntimeError as e:
        return {"error": str(e)}


TABLE_NAME = "Organiser"

dynamo = DynamoDBHelper(TABLE_NAME, "EntityType", "ID")

if __name__ == "__main__":

    # create_note(user, "Board-5705f4ce-75d0-42fc-895f-31b5e3446ee9", "Another note")
    print(get_items(user, "Board-0e32cdfa-ac6a-473f-b59a-ef44aa0f1e17"))
    # print(get_boards())
