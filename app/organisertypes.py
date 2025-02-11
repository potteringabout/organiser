from enum import Enum
from dynamoutils import dynamodb_to_json, json_to_dynamodb


class FormatType(Enum):
    JSON = "json"
    DYNAMODB = "dynamodb"


class OrganiserItem:
    base_required_fields = {"ID", "EntityType", "Owner", "CreatedDate"}

    def __init__(self, object: dict, format: FormatType = FormatType.JSON, extra_required_fields=None):
        self.required_fields = self.base_required_fields | (extra_required_fields or set())

        if format == FormatType.DYNAMODB:
            object = dynamodb_to_json(object)

        self.validate_object(object)  # Parent validation

        # Use direct attribute assignment to bypass __setattr__
        super().__setattr__("_data", object)
        super().__setattr__("format", format)

    def __getattr__(self, name):
        """
        Dynamically get an attribute.
        """
        if name in self._data:
            return self._data[name]
        raise AttributeError(
            f"'{type(self).__name__}' object has no attribute '{name}'")

    def __setattr__(self, name, value):
        """
        Dynamically set an attribute.
        """
        if name in ("_data", "format", "required_fields"):  # Allow normal attribute setting
            super().__setattr__(name, value)
        elif name in self._data:  # Set within _data dict
            self._data[name] = value
        else:
            raise AttributeError(
                f"'{type(self).__name__}' object has no attribute '{name}'")

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

    def validate_object(self, object):
        missing = self.required_fields - object.keys()
        if missing:
            raise ValueError(f"Missing required fields: {missing}")


class Board(OrganiserItem):
    required_fields = {"Description"}

    def __init__(self, object: dict, format: FormatType = FormatType.JSON):
        super().__init__(object, format, extra_required_fields=self.required_fields)


class Task(OrganiserItem):
    required_fields = {"details", "status"}

    def __init__(self, object: dict, format: FormatType = FormatType.JSON):
        super().__init__(object, format, extra_required_fields=self.required_fields)


class Note(OrganiserItem):
    required_fields = {"details"}

    def __init__(self, object: dict, format: FormatType = FormatType.JSON):
        super().__init__(object, format, extra_required_fields=self.required_fields)
