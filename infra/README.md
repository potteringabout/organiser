#

## Dev configuration 

Set up SSO

```
$ aws configure sso
SSO session name (Recommended): potteringabout-dev
SSO start URL [None]: https://potteringaboutsso.awsapps.com/start/
SSO region [None]: eu-west-2
SSO registration scopes [sso:account:access]:
```

Culminating in creating a profile `Dev-AdministratorAccess`


The logic is this.  
An organiser is made up of Notes and Tasks.  

Note
Could be a simple update, or a more detailed description or explanation of something.  A note will be given a creation time and an owner.  It can also be tagged so that notes with common topic or theme can be displayed together.

Task
A task is to to do item.  It can be assigned a due date.  It can also be defined as recurring.  A task will be given a creation time and an owner.  It can also be tagged so that tasks with common topic or theme can be displayed together.

Tag
A tag is a label that can be added to a task or note. A tag should have a descrption.  It will be given a creation time and an owner.

Board
A board is a collection of tasks, notes and tags.  A board will be given a name and an owner.

## Data model

The DynamoDB table `Organiser` is used to store all organiser data. It has the following attributes:

| Attribute | Type | Description |
| --- | --- | --- |
| Type | String | The type of the item (e.g., "Task", "Note", "Tag", "Board") |
| Owner | String | The owner of the item (e.g., "Tony Potter") |
| ID | String | The unique ID of the item (e.g., "Task-123") |
| Data | String | The data of the item (e.g., JSON) |


## DynamoDB indexes

The following indexes are defined on the `Organiser` table:

| Index | Partition key | Sort key | Projection type | Description |
| --- | --- | --- | --- | --- |
| OwnerIndex | Owner | ALL | OwnerIndex | All items owned by a specific owner |
| OwnerType | Owner | Type | ALL | All items of a specific type owned by a specific owner | 


## DynamoDB data

### Task

A task is a to-do item that can be tagged and assigned to a specific owner. It has the following attributes:

| Attribute | Type | Description |
| --- | --- | --- |
| Type | String | The type of the item (e.g., "Task") |
| Owner | String | The owner of the item (e.g., "Tony Potter") |
| ID | String | The unique ID of the item (e.g., "Task-123") |
| Data | String | The data of the item (e.g., JSON) |
| CreatedDate | String | The date and time the item was created (e.g., "2023-01-01T12:00:00Z") |
| DueDate | String | The date and time the item is due (e.g., "2023-01-01T12:00:00Z") |

### Note

A note is a short text note that can be tagged and assigned to a specific owner. It has the following attributes:

| Attribute | Type | Description |
| --- | --- | --- |
| Type | String | The type of the item (e.g., "Note") |
| Owner | String | The owner of the item (e.g., "Tony Potter") |
| ID | String | The unique ID of the item (e.g., "Note-123") |
| Data | String | The data of the item (e.g., JSON) |
| CreatedDate | String | The date and time the item was created (e.g., "2023-01-01T12:00:00Z") |

### Tag

A tag is a label that can be added to a task or note. It has the following attributes:

| Attribute | Type | Description |
| --- | --- | --- |
| Type | String | The type of the item (e.g., "Tag") |
| Owner | String | The owner of the item (e.g., "Tony Potter") |
| ID | String | The unique ID of the item (e.g., "Tag-123") |
| Data | String | The data of the item (e.g., JSON) |
| CreatedDate | String | The date and time the item was created (e.g., "2023-01-01T12:00:00Z") |

### Board

A board is a collection of tasks or notes that can be shared with other users. It has the following attributes:

| Attribute | Type | Description |
| --- | --- | --- |
| Type | String | The type of the item (e.g., "Board") |
| Owner | String | The owner of the item (e.g., "Tony Potter") |
| ID | String | The unique ID of the item (e.g., "Board-123") |
| Data | String | The data of the item (e.g., JSON) |
| CreatedDate | String | The date and time the item was created (e.g., "2023-01-01T12:00:00Z") |  

where `Data` is a JSON object with the following structure: it would be a list of task or note keys identified by their `ID` attribute and owning the `Owner` attribute. eg. 

```json
[{"owner": "Tony Potter", "id": "Task-123"}, {"owner": "Tony Potter", "id": "Task-456"}]
```


## SSH into the RDS instance



```
aws ssm start-session --target i-0e302efe73972e3a0 --document-name AWS-StartPortForwardingSessionToRemoteHost --parameters '{"host":["organiser-dev01-postgres.cmwcmuejjant.eu-west-2.rds.amazonaws.com"],"portNumber":["5432"],"localPortNumber":["5432"]}'
```