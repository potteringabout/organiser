const data = {
  tasks: [
    {
      CreatedDate: "2025-02-10T07:48:29.397640+00:00",
      EntityType: "Task",
      ID: "Board-0e32cdfa-ac6a-473f-b59a-ef44aa0f1e17-Task-0be167ab-6ee5-497d-aac1-f772a2591608",
      LastUpdate: "2025-03-18T21:38:57.189984+00:00",
      Owner: "a6a202b4-a031-70b9-1c2c-9e726f149560",
      dependentOn: "Bob",
      title: "Complete timesheet",
      updates:
        [{"text": "Update 1", "date": "2025-02-10"}, {"text": "Update 2", "date": "2025-02-11"}],
      dueDate: "2025-02-10",
      forWho: "Alice",
      refs: ["https://jira.com/task123"],
      status: "in_progress",
    },
    {
      CreatedDate: "2025-02-10T07:29:31.884085+00:00",
      EntityType: "Task",
      ID: "Board-0e32cdfa-ac6a-473f-b59a-ef44aa0f1e17-Task-3c56da15-1037-4d9f-910d-6676ffb627d6",
      LastUpdate: "2025-02-10T07:29:31.884085+00:00",
      Owner: "a6a202b4-a031-70b9-1c2c-9e726f149560",
      dependentOn: "Bob",
      title: "Draw up design for X",
      updates: [{"text": "Fix the bug", "date": "2025-02-10"},
        {"text": "Fix the bug again", "date": "2025-02-10"}
      ],
      dueDate: "",
      forWho: "",
      refs: [],
      status: "blocked",
    },
    {
      CreatedDate: "2025-02-11T23:12:33.808019+00:00",
      EntityType: "Task",
      ID: "Board-0e32cdfa-ac6a-473f-b59a-ef44aa0f1e17-Task-3d7aa2cb-d85b-4f06-833a-3bab1c9db579",
      LastUpdate: "2025-02-11T23:12:33.808019+00:00",
      Owner: "a6a202b4-a031-70b9-1c2c-9e726f149560",
      dependentOn: "Bob",
      title: "Draw up design for Y",
      updates: [{"text": "Fix the bug", "date": "2025-02-10"}],
      dueDate: "2025-02-13",
      forWho: "Alice",
      refs: ["https://jira.com/task123"],
      status: "in_progress",
    },
    {
      CreatedDate: "2025-02-11T23:15:20.265755+00:00",
      EntityType: "Task",
      ID: "Board-0e32cdfa-ac6a-473f-b59a-ef44aa0f1e17-Task-430f811e-22dd-4789-9c76-494503815f4c",
      LastUpdate: "2025-02-11T23:15:20.265755+00:00",
      Owner: "a6a202b4-a031-70b9-1c2c-9e726f149560",
      dependentOn: "",
      title: "Fix routing for project Z",
      updates: [{"text": "Fix the bug", "date": "2025-02-10"}],
      dueDate: "2025-02-27",
      forWho: "David",
      refs: [],
      status: "todo",
    },
    {
      CreatedDate: "2025-02-11T23:30:13.617740+00:00",
      EntityType: "Task",
      ID: "Board-0e32cdfa-ac6a-473f-b59a-ef44aa0f1e17-Task-6fdab804-ec41-402f-a588-204b2e3d121c",
      LastUpdate: "2025-02-11T23:30:13.617740+00:00",
      Owner: "a6a202b4-a031-70b9-1c2c-9e726f149560",
      dependentOn: "Bob",
      title: "mandatory training",
      updates: [{"text": "Fix the bug", "date": "2025-02-10"}],
      dueDate: "2025-03-06",
      forWho: "Charlie",
      refs: ["https://jira.com/task123"],
      status: "blocked",
    },
    {
      CreatedDate: "2025-02-09T22:55:38.055281+00:00",
      EntityType: "Task",
      ID: "Board-35689a70-486b-4c51-9964-d8a707021e9f-Task-c5bac5b9-dadc-4d69-9f73-0c4c5a985e74",
      LastUpdate: "2025-02-09T22:55:38.055281+00:00",
      Owner: "a6a202b4-a031-70b9-1c2c-9e726f149560",
      dependentOn: "Bob",
      title: "Raise change ticket for thingy",
      updates: [{"text": "Fix the bug", "date": "2025-02-10"}],
      dueDate: "2025-02-10",
      forWho: "Alice",
      refs: ["https://jira.com/task123"],
      status: "in_progress",
    },
  ],
  notes: [
    {
      id: "n1",
      title: "Catch up with Alice",
      content: "Ask about the launch.",
    },
  ],
  boards: [
    {
      CreatedDate: "2025-02-09T22:44:33.284878+00:00",
      Description: "My work stuff",
      EntityType: "Board",
      ID: "Board-0e32cdfa-ac6a-473f-b59a-ef44aa0f1e17",
      Name: "Work",
      Owner: "a6a202b4-a031-70b9-1c2c-9e726f149560",
    },
    {
      CreatedDate: "2025-02-11T22:05:17.901531+00:00",
      Description: "Work Organiser",
      EntityType: "Board",
      ID: "Board-86ae541b-ec32-4188-866d-75e8e1f51c76",
      LastUpdate: "2025-02-11T22:05:17.901531+00:00",
      Owner: "a6a202b4-a031-70b9-1c2c-9e726f149560",
      name: "Work2",
    },
    {
      CreatedDate: "2025-02-10T09:03:32.235591+00:00",
      Description: "Personal stuff",
      EntityType: "Board",
      ID: "Board-35689a70-486b-4c51-9964-d8a707021e9f",
      Name: "Personal",
      Owner: "a6a202b4-a031-70b9-1c2c-9e726f149560",
    },
  ]
}

export async function getTasks(boardId) {
  console.log("Getting tasks for board " + boardId);
  return data.tasks.filter((t) => t.ID.startsWith(boardId));
  return data.tasks;
}

export async function upsertItem(boardId, item) {
  console.log("Upserting item " + item);
}

export async function createBoard(name, description) {
  console.log("Creating board " + name);
}

export async function deleteBoard(boardId) {
  console.log("Deleting board " + boardId);
}

export async function getBoard(boardId) {
  console.log("Getting board " + boardId);
  return data.boards.find((b) => b.ID === boardId);
}

export async function getBoards() {
  console.log("Getting boards");
  return data.boards;
}


export async function addUpdate(update) {
 console.log("Adding update " + update);
}