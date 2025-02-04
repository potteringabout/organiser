from enum import Enum
from dynamo import dynamodb_to_json, json_to_dynamodb

class FormatType(Enum):
  JSON = "json"
  DYNAMODB = "dynamodb"

class OrganiserItem:

  def __init__(self, object: str, format: FormatType = FormatType.JSON):
    """
    Initialize the class with attributes from the JSON object.
    """
    if not isinstance(object, dict):
      raise ValueError("Input must be a JSON object (dict).")
    
    if format == FormatType.DYNAMODB:
      object = dynamodb_to_json(object)
    self._data = object

  def __getattr__(self, name):
    """
    Dynamically get an attribute.
    """
    if name in self._data:
      return self._data[name]
    raise AttributeError(f"'{type(self).__name__}' object has no attribute '{name}'")

  def __setattr__(self, name, value):
    """
    Dynamically set an attribute.
    """
    if name == "_data":
      # Allow setting _data during initialization
      super().__setattr__(name, value)
    elif name in self._data:
      self._data[name] = value
    else:
      raise AttributeError(f"'{type(self).__name__}' object has no attribute '{name}'")

  def to_dict(self):
    """
    Return the JSON object as a dictionary.
    """
    return self._data

  def to_dynamodb(self):
    """
    Return the JSON object as a DynamoDB attribute-value map.
    """
    return json_to_dynamodb(self._data)
  
class Board(OrganiserItem):
  def __init__(self, object: str, format: FormatType = FormatType.JSON):
    super().__init__(object, format)

class Task(OrganiserItem):
  def __init__(self, object: str, format: FormatType = FormatType.JSON):
    super().__init__(object, format)

class Note(OrganiserItem):
  def __init__(self, object: str, format: FormatType = FormatType.JSON):
    super().__init__(object, format)

# This servers as a link between a board and a task and a board and a note
class BoardItem(OrganiserItem):
  def __init__(self, object: str, format: FormatType = FormatType.JSON):
    super().__init__(object, format)


