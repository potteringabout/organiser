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
    dynamodb = boto3.resource("dynamodb", region_name="eu-west-2")  # Replace with your region
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

  def query_gsi(self, gsi_name, k1, v1, k2, v2):
    response = self.table.query(
      IndexName=gsi_name,  # Name of the GSI
      KeyConditionExpression=Key(k1).eq(v1) & Key(k2).eq(v2)
    )
    return response.get("Items")

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