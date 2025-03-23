import { create } from "zustand";
//import * as client from "@/organiser/store/client";

import * as client from "@/organiser/store/mockClient";

/*
🧠 Purpose	✅ Recommended Name	📘 Notes
State variable	tasks	Plural if it’s a list
Setter (replace)	setTasks	Replaces the whole list
Adder	addTask	Adds a single item
Updater	updateTask	Updates a task by ID
Remover	removeTask	Removes by ID
Derived getter	getTaskById	Returns a specific task
Filter/view	getVisibleTasks	e.g. filters out snoozed  
Boolean check	isTaskSyncing	For syncing status, etc

Style	When to use
set({ tasks })	✅ When you don’t need access to previous state
set((state) => ({ ... }))	✅ When you do need the current state to compute the next one

*/


const useOrganiserStore = create((set, get) => ({
  developerMode: true,

  darkMode: false,
  selectedItem: "Home",
  menu: "Boards",

  setDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  setSelectedItem: (item) => set(() => ({ selectedItem: item })),
  setMenu: (menu) => set(() => ({ menu: menu })),

  board:{},
  boards: [],
  //setBoard: (board) => set(() => ({ board: board })),
  loadBoards: async () => {
    boards = await client.getBoards();
    set({ boards: boards });
  },
  getBoardById: (id) => get().boards.find((b) => b.ID === id),
  setBoard: (board) => set(() => ({ board: board })),

  tasks: [],
  setTasks: (tasks) => set(() => ({ tasks: tasks })),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  removeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    })),
  getTaskById: (id) => get().tasks.find((t) => t.id === id),
  getTasksByBoardId: async (id) => {
    const tasks = await client.getTasks(id);
    set({tasks: tasks});
  },

  loadTasks: async (boardId) => {
    getTasks(boardId)
      .then((data) => {
        console.log("Data is ", data);
        data = data.map((task) => ({
          ...task,
          details: task.details ? JSON.parse(task.details) : [],
        }));

        set({ tasks: data });
      })
      .catch((error) => console.error("Error:", error.message));
   
  },

  // Update a task immediately in Zustand, and then persist in background
  updateTask: async (taskId, updates) => {
    // Optimistic update in Zustand
    const previousTasks = get().tasks;
    set({
      tasks: previousTasks.map((t) =>
        t.ID === taskId ? { ...t, ...updates } : t
      ),
    });

    /*try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!res.ok) throw new Error('Failed to update task')
    } catch (err) {
      // Optional rollback
      set({ tasks: previousTasks })
      console.error('Update failed, rolled back:', err)
    }*/
  },
  addTask: async (task) => {
    // Add it to Zustand immediately
    set((state) => ({ tasks: [...state.tasks, task] }));

    /*try {
      const res = await fetch(`/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      })

      if (!res.ok) throw new Error('Failed to add task')
    } catch (err) {
      console.error('Failed to persist task:', err)
      // Optionally remove the task or mark as needing retry
    }*/
  },
  boardTasks: {}, // keyed by board ID

  setBoardTasks: (boardId, tasks) =>
    set((state) => ({
      boardTasks: {
        ...state.boardTasks,
        [boardId]: tasks
      }
    })),
  
  getBoardTasks: (boardId) => get().boardTasks[boardId] || [],

  notes: [],
  setNotes: (notes) => set(() => ({ notes: notes })),
  addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
  removeNote: (id) =>
    set((state) => ({
      notes: state.notes.filter((t) => t.id !== id),
    })),
  getNoteById: (id) => get().notes.find((t) => t.id === id),
  loadFakeData: () => {
    set({
      tasks: [
        {
          CreatedDate: "2025-02-10T07:48:29.397640+00:00",
          EntityType: "Task",
          ID: "Board-0e32cdfa-ac6a-473f-b59a-ef44aa0f1e17-Task-0be167ab-6ee5-497d-aac1-f772a2591608",
          LastUpdate: "2025-03-18T21:38:57.189984+00:00",
          Owner: "a6a202b4-a031-70b9-1c2c-9e726f149560",
          dependentOn: "Bob",
          title: "This is the title",
          details:
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
          title: "This is the title",
          details: [{"text": "Fix the bug", "date": "2025-02-10"},
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
          details: [{"text": "Fix the bug", "date": "2025-02-10"}],
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
          details: [{"text": "Fix the bug", "date": "2025-02-10"}],
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
          details: [{"text": "Fix the bug", "date": "2025-02-10"}],
          dueDate: "2025-03-06",
          forWho: "Charlie",
          refs: ["https://jira.com/task123"],
          status: "blocked",
        },
        {
          CreatedDate: "2025-02-09T22:55:38.055281+00:00",
          EntityType: "Task",
          ID: "Board-0e32cdfa-ac6a-473f-b59a-ef44aa0f1e17-Task-c5bac5b9-dadc-4d69-9f73-0c4c5a985e74",
          LastUpdate: "2025-02-09T22:55:38.055281+00:00",
          Owner: "a6a202b4-a031-70b9-1c2c-9e726f149560",
          dependentOn: "Bob",
          details: [{"text": "Fix the bug", "date": "2025-02-10"}],
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
      ],
    });
  },

  resetStore: () => {
    set({ tasks: [], notes: [] });
  },
}));

export default useOrganiserStore;
