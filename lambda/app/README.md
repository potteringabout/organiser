Check out the following innout to BedRock.

Hi.  I'm going to write a few sentences.  It is a task defintion, and the other sentences will give updates on the task.  Can you 1. Give a concise  title to the task. 2. Summarise the updates into no more than a line or so, and 3. State if the task is todo, in progress, blocked or done. 4. Include all updates in the response, correcting any spelling or grammar.  5.  Where the task is being done by someone else, or blocked by someone else, please include that in the response. The output should be entirely in JSON format and conform to the following schema.



{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "task": {
      "type": "string",
      "description": "The description of the task being tracked."
    },
    "summary": {
      "type": "string",
      "description": "A brief summary of the task.",
      "minLength": 1
    },
    "updates": {
      "type": "array",
      "description": "A list of updates related to the task, in chronological order.",
      "items": {
        "type": "string"
      }
    },
    "status": {
      "type": "string",
      "description": "The current status of the task.",
      "enum": ["pending", "in progress", "done"]
    },
    "blocked_by": {
      "type": "array",
      "description": "A list of task dependencies that block this task from progressing.",
      "items": {
        "type": "string"
      }
    },
    "assignee": {
      "type": "string",
      "description": "The name or identifier of the person responsible for the task."
    },
    "due_date": {
      "type": "string",
      "format": "date",
      "description": "The due date for the task in YYYY-MM-DD format."
    },
    "completed_date": {
      "type": "string",
      "format": "date",
      "description": "The date the task was marked as completed in YYYY-MM-DD format."
    }
  },
  "required": ["task", "updates", "status"],
  "additionalProperties": false
}







Raise firewall request to allow the application to talk to the database.

Firewall request sent to infoSec for approval.

The request is waiting for Bob to approve.  Bob is on holiday.

Dave approved the request.  I've actioned the request.  

Confirming with the app team if it;s worked
App team have confirmed it has worked