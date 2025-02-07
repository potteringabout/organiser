#!/usr/bin/env python3
import uuid
from datetime import datetime, timezone
from functools import wraps
import boto3
from dynamo import DynamoDBHelper
from organisertypes import Board, Note, Task, BoardItem

#user = {"user_id": "e642b2e4-a0b1-7061-35d0-58916d67f684"}

TABLE_NAME = "Organiser"
dynamo = DynamoDBHelper(TABLE_NAME, "EntityType", "ID")
    
def create_note(user, board_id, text):
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
    note_id = f"Note-{str(uuid.uuid4())}"

    created_date = datetime.now(timezone.utc).isoformat()

    item = {
        "EntityType": "Note",
        "ID": note_id,
        "CreatedDate": created_date,
        "Owner": user["user_id"],
        "Text": text,
    }

    note = Note(item)

    link = {
        "EntityType": "BoardItem",
        "ID": f"{board_id}-{note_id}",
        "CreatedDate": created_date,
        "Owner": user["user_id"],
    }

    link = BoardItem(link)

    try:
        r = dynamo.batch_update([note.to_dict(), link.to_dict()])
        return r
    except RuntimeError as e:
        return {"error": str(e)}

    
def delete_note(board_id, note_id):
    try:
        dynamo.batch_delete(
            [
                {"EntityType": "BoardItem", "ID": f"{board_id}-{note_id}"},
                {"EntityType": "Note", "ID": note_id},
            ]
        )
        return {"success": True}
    except RuntimeError as e:
        return {"error": str(e)}


def get_note(board_id, note_id):
    try:
        r = dynamo.get("BoardItem", f"{board_id}-{note_id}")
        return r
    except RuntimeError as e:
        return {"error": str(e)}
    
def get_notes(board_id):

    try:
        r = dynamo.query_gsi(
            gsi_name="OwnerItemID",
            k1="Owner",
            v1=user["user_id"],
            k2="ID",
            v2=f"{board_id}-",
            startswith=True,
        )

        keys = []
        for item in r:
            note_id = "Note-" + item["ID"].split("Note-", 1)[1]
            keys.append({"EntityType": "Note", "ID": note_id})

        r = dynamo.batch_get(keys)
        return r
    except RuntimeError as e:
        return {"error": str(e)}



if __name__ == "__main__":

    # create_note(user, "Board-5705f4ce-75d0-42fc-895f-31b5e3446ee9", "Another note")
    print(get_notes("Board-5705f4ce-75d0-42fc-895f-31b5e3446ee9"))
    # print(get_boards())
