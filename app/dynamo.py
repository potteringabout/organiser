import boto3
from botocore.exceptions import ClientError
from boto3.dynamodb.types import TypeSerializer, TypeDeserializer
from boto3.dynamodb.conditions import Key

class DynamoDBHelper:
  def __init__(self, table_name, partition_key_name, sort_key_name=None):
    """
    Initialize the helper with table name and key names.

    Args:
      table_name (str): The name of the DynamoDB table.
      partition_key_name (str): The name of the partition key.
      sort_key_name (str, optional): The name of the sort key (if applicable).
    """
    dynamodb = boto3.resource("dynamodb", region_name="eu-west-2")
    self.table_name = table_name
    self.client = boto3.client("dynamodb", region_name="eu-west-2")
    self.table = dynamodb.Table(table_name)
    self.partition_key_name = partition_key_name
    self.sort_key_name = sort_key_name

  def get(self, partition_key, sort_key=None):
    """Retrieve an item by its primary and optional sort key."""
    key = {self.partition_key_name: partition_key}
    if self.sort_key_name and sort_key:
      key[self.sort_key_name] = sort_key

    try:
      response = self.table.get_item(Key=key)
      return response.get("Item")
    except ClientError as e:
      raise RuntimeError(f"Failed to get item: {e.response['Error']['Message']}")

  def query_gsi(self, gsi_name, k1, v1, k2, v2=None, startswith=False):
    """
    Query a GSI with an optional 'startswith' condition for the second key.

    Args:
        gsi_name (str): Name of the GSI.
        k1 (str): Primary key of the GSI.
        v1 (str): Value for k1 (must be an exact match).
        k2 (str): Sort key of the GSI.
        v2 (str, optional): Value for k2. Defaults to None.
        startswith (bool, optional): If True, performs a 'begins_with' instead of 'eq' for k2.

    Returns:
        list: List of matching items.
    """
    key_condition = Key(k1).eq(v1)  # Mandatory condition

    # Apply condition for k2 only if a value is provided
    if v2 is not None:
      if startswith:
        key_condition &= Key(k2).begins_with(v2)
      else:
        key_condition &= Key(k2).eq(v2)

    response = self.table.query(
      IndexName=gsi_name,
      KeyConditionExpression=key_condition
    )
    return response.get("Items", [])

  def upsert(self, item):
    """Create or overwrite an item in the table."""
    try:
      self.table.put_item(Item=item)
      return item
    except ClientError as e:
      raise RuntimeError(f"Failed to create item: {e.response['Error']['Message']}")

  def delete(self, partition_key, sort_key=None):
    """
    Delete an item from the table.

    Args:
      partition_key (str): The Partition Key of the item to delete.
      sort_key (str, optional): The Sort Key of the item to delete.

    Returns:
      dict: Response from DynamoDB.
    """
    key = {self.partition_key_name: partition_key}
    if self.sort_key_name and sort_key:
      key[self.sort_key_name] = sort_key

    try:
      response = self.table.delete_item(Key=key)
      return response
    except ClientError as e:
      raise RuntimeError(f"Failed to delete item: {e.response['Error']['Message']}")
    
  def batch_get(self, keys):
    """
    Retrieve multiple items from DynamoDB in a batch request.

    Args:
        keys (list): List of key dictionaries to retrieve.
                     Each key dictionary should contain the partition key ('Type') 
                     and sort key ('ID').

    Returns:
        list: List of retrieved items.
    """
    try:
      request_keys = [{k: {"S": str(v)} for k, v in key.items()} for key in keys]

      response = self.client.batch_get_item(
        RequestItems={self.table_name: {"Keys": request_keys}}
      )

      return response.get("Responses", {}).get(self.table_name, [])

    except ClientError as e:
      raise RuntimeError(f"Failed to retrieve items: {e.response['Error']['Message']}")
    # Example usage:
    # db_handler = DynamoDBHandler("YourTableName")
    # keys_to_get = [{"Type": "User", "ID": "123"}, {"Type": "Order", "ID": "456"}]
    # items = db_handler.batch_get(keys_to_get)
    # print(items)
    
  def batch_update(self, items):
    """
    Update multiple items in DynamoDB in a single request.

    Args:
        items (list): List of items (dicts) to update.

    Returns:
        bool: True if successful, raises an exception otherwise.
    """
    try:
      with self.table.batch_writer() as batch:
        for item in items:
          batch.put_item(Item=item)
      return True
    except ClientError as e:
      raise RuntimeError(f"Failed to update items: {e.response['Error']['Message']}")
    
  def batch_delete(self, keys):
    """
    Delete multiple items in DynamoDB in a single request.

    Args:
        keys (list): List of key dictionaries to delete. 
                     Each key dictionary should contain the partition key ('Type') 
                     and sort key ('ID').

    Returns:
        bool: True if successful, raises an exception otherwise.
    """
    try:
      with self.table.batch_writer() as batch:
        for key in keys:
          batch.delete_item(Key=key)
      return True
    except ClientError as e:
      raise RuntimeError(f"Failed to delete items: {e.response['Error']['Message']}")
  
def json_to_dynamodb(json_object):
  """
  Convert a JSON object to DynamoDB attribute-value format.

  Args:
      json_object (dict): The JSON object to convert.

  Returns:
      dict: DynamoDB attribute-value format.
  """
  serializer = TypeSerializer()
  return {key: serializer.serialize(value) for key, value in json_object.items()}

def dynamodb_to_json(dynamodb_object):
  """
  Convert a DynamoDB attribute-value map to JSON object.

  Args:
      dynamodb_object (dict): The DynamoDB attribute-value map.

  Returns:
      dict: JSON object.
  """
  deserializer = TypeDeserializer()
  return {key: deserializer.deserialize(value) for key, value in dynamodb_object.items()}