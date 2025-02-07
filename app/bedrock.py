import boto3
import json
from enum import Enum
from datetime import datetime
import re

# Initialize Bedrock client
bedrock = boto3.client("bedrock-runtime", region_name="eu-west-2")
today = datetime.today()


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
    json_pattern = r"(\{.*?\}|\[.*?\])"

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


class Models(Enum):
    MISTRAL = "mistral.mixtral-8x7b-instruct-v0:1"
    META = "meta.llama3-70b-instruct-v1:0"


class Bedrock:

    context = f"""Today is {today}. Synchronize your internal clock with the current time.
    When asked for or inferring a date based on day, eg. next Tuesday, check your response to validate that the date given is correct and is a Tuesday.  If it's not, correct the date.
    Time should be in the format YYYY-MM-DDHH:MM:SS.
    You are a helpful AI assistant helping organise my tasks and diary.
    The text you receive will be one of
    1. a diary note
    2. a task to be undertaken - if so extract the action and if possible extract any due date
    3. A question - if so, please answer the question
    4. None of the above - if so, please respond with an empty list.
    The text might contain any combination of the above.
    Your response should be in JSON formation. It should be a list of dictionary objects. 
    The dictionary object should have a type (task, note, or question)
    An task, should have a text attribute containing the task, and a dueDate only if one can be inferred.
    An note should have a text attribute with the diary entry.
    A question should have an answer attribute.
    Please correct any spelling mistakes in the text.
    Please correct any input to make the language as concise and professional as possible."""

    def __init__(self, modelid, **kwargs):
        self.place_holder = "@@text@@"
        if modelid not in [m for m in Models]:
            raise ValueError(f"Model {modelid} not found.")
        self.model_id = modelid.value
        self.body = {**kwargs}

    def invoke(self, text):
        self.prompt = self.prompt.replace(self.place_holder, text)

        self.body["prompt"] = self.prompt

        response = bedrock.invoke_model(
            modelId=self.model_id,
            body=json.dumps(self.body),
            contentType="application/json",
            accept="application/json",
        )
        return response


class Mistral(Bedrock):

    def __init__(self):
        super().__init__(
            Models.MISTRAL, max_tokens=1024, temperature=0, top_p=0, top_k=50
        )
        self.prompt = f"""<s>[INST]
      {self.context}
      The text is : {self.place_holder}
      [/INST]"""

    def invoke(self, text):
        r = super().invoke(text)
        response_body = json.loads(r.get("body").read())["outputs"]
        t = response_body[0].get("text", "")

        response = extract_json_from_string(t)
        return response


class Meta(Bedrock):
    def __init__(self):
        super().__init__(Models.META, temperature=0, top_p=0)

        self.prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
      Today is {today}. {self.context}
      <|eot_id|><|start_header_id|>user<|end_header_id|>
      {self.place_holder}<|eot_id|><|start_header_id|>assistant<|end_header_id|>"""

    def invoke(self, text):
        r = super().invoke(text)
        response_body = json.loads(r.get("body").read())
        response = extract_json_from_string(response_body.get("generation", ""))
        return response


if __name__ == "__main__":
    m = Mistral()
    r = m.invoke("Finished my homework.")
    print(r)
