/*resource "aws_dynamodb_table" "organiser" {
  name         = "Organiser"
  billing_mode = "PAY_PER_REQUEST" # On-demand billing
  hash_key     = "EntityType"
  range_key    = "ID"

  attribute {
    name = "EntityType"
    type = "S" # String - one of "Task", "Note", "Tag", "Board"
  }

  attribute {
    name = "Owner"
    type = "S" # String
  }

  attribute {
    name = "ID"
    type = "S" # String
  }

  /*attribute {
    name = "CreatedDate"
    type = "S" # String
  }

  attribute {
    name = "Data"
    type = "S" # String
  }*/
  /*
  global_secondary_index {
    name            = "OwnerIndex"
    hash_key        = "Owner"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "OwnerType"
    hash_key        = "Owner"      # Tag becomes the GSI partition key
    range_key       = "EntityType" # Optional: Use ItemReference for more precise filtering
    projection_type = "ALL"        # Include all attributes in the GSI
  }

  global_secondary_index {
    name            = "OwnerItemID"
    hash_key        = "Owner" # Tag becomes the GSI partition key
    range_key       = "ID"    # Optional: Use ItemReference for more precise filtering
    projection_type = "ALL"   # Include all attributes in the GSI
  }

  tags = {
    Environment = "Development"
    Team        = "Platform"
  }
}*/
