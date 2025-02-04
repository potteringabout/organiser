#!/usr/bin/env python3 
import uuid
from datetime import datetime, timezone
from functools import wraps
import boto3
from dynamo import DynamoDBHelper
from organisertypes import Board


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
    "EntityType" : "Board",
    "ID": board_id,
    "Name": name,
    "Description": description,
    "CreatedDate": created_date,
    "Owner": user["user_id"]
  }

  board = Board(board)
  try:
    r = dynamo.upsert(board.to_dict())
    return  r
  except RuntimeError as e:
    return {"error": str(e)}
  
def delete_board(board_id):
  
  try:
    r = dynamo.delete("Board", board_id)
    return r
  except RuntimeError as e:
    return {"error": str(e)}


def get_board(board_id):

  try:
    r = dynamo.get("Board", board_id)
    return r
  except RuntimeError as e:
    return {"error": str(e)}
  
def get_boards():

  try:
    r = dynamo.query_gsi(gsi_name="OwnerType", k1="Owner", v1="e642b2e4-a0b1-7061-35d0-58916d67f684", k2="EntityType", v2="Board")
    return r
  except RuntimeError as e:
    return {"error": str(e)}
  
TABLE_NAME = "Organiser"

dynamo = DynamoDBHelper(TABLE_NAME, "EntityType", "ID")

if __name__ == "__main__":
  print(get_boards())