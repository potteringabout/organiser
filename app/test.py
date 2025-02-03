import boto3
import json
from datetime import date
# Initialize the Bedrock client
client = boto3.client('bedrock', region_name='eu-west-2')


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
            return datetime.fromisoformat(obj.replace("Z", "+00:00"))  # Handle UTC Z format
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

# Create an Amazon Bedrock Runtime client.
brt = boto3.client("bedrock-runtime", region_name='eu-west-2')


# Set the model ID, e.g., Amazon Titan Text G1 - Express.
#model_id = "amazon.titan-text-express-v1"
model_id = "meta.llama3-70b-instruct-v1:0"

today = date.today()

text = "Feed the cat. It was sunnie today. Learn how to play the piano.  I like cake.  Talk to Bob on Wednsday."
# Define the prompt for the model.
prompt = f"""
Today is {today} The following text contains a mixture of Actions and Updates.  
Extract the sentences that are actions, and those which are updates. 
I'd like the response in JSON formation. It should be a list of dictionaries.  The dictionary objects should have a type (action or update), the text, and a dueDate.  If there is no due date, then the dueDate should not be included.
If a due date can be inferred for the action, include that as an attribute of the action converted to YYYY-MM-DD. 
Please also correct any spelling mistakes in the text.
The text is :  {text}
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
    "max_gen_len": 512,
    "temperature": 0.5
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

x =extract_json_from_string(generated_text)

print("Generated Text:", generated_text)

# Format the request payload using the model's native structure.
'''native_request = {
    "inputText": prompt,
    "textGenerationConfig": {
        "maxTokenCount": 512,
        "temperature": 0.5,
        "topP": 0.9
    },
}'''

'''
native_request = {
    "prompt": prompt,
    "temperature": 0.8,
    "top_p": 0.9
}

# Convert the native request to JSON.
request = json.dumps(native_request)

try:
    # Invoke the model with the request.
    response = brt.invoke_model(modelId=model_id, body=request)

except (ClientError, Exception) as e:
    print(f"ERROR: Can't invoke '{model_id}'. Reason: {e}")
    exit(1)

# Decode the response body.
model_response = json.loads(response["body"].read())

print(model_response)
# Extract and print the response text.
#response_text = model_response["results"][0]["outputText"]
#print(response_text)
'''

'''
def list_foundation_models(bedrock_client):
    """
    Gets a list of available Amazon Bedrock foundation models.

    :return: The list of available bedrock foundation models.
    """

    try:
        response = bedrock_client.list_foundation_models()
        models = response["modelSummaries"]
        print(f"Got {len(models)} foundation models.")
        return models

    except ClientError:
        raise
    
fm_models = list_foundation_models(client)
for model in fm_models:
  print(f"Model: {model["modelName"]}")
  print(json.dumps(model, indent=2))
  print("---------------------------\n")
'''


