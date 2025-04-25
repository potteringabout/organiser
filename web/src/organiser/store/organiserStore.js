import { create } from "zustand";
import * as client from "@/organiser/store/client";

const useOrganiserStore = create((set, get) => ({
  // UI Preferences
  developerMode: true,
  darkMode: localStorage.getItem("darkMode") === "true",
  setDarkMode: (value) => {
    localStorage.setItem("darkMode", value);
    set({ darkMode: value });
  },

  selectedItem: "Home",
  setSelectedItem: (item) => set(() => ({ selectedItem: item })),

  menu: "Boards",
  setMenu: (menu) => set(() => ({ menu: menu })),

  // Boards
  board: {},
  boards: [],
  setBoard: (board) => set(() => ({ board: board })),
  loadBoards: async () => {
    const boards = await client.getBoards();
    set({ boards: boards });
  },
  getBoardById: (id) => get().boards.find((b) => b.ID === id),

  // Tasks
  tasks: [],
  setTasks: (tasks) => set(() => ({ tasks: tasks })),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  removeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    })),
  updateTask: async (taskId, updates) => {
    const previousTasks = get().tasks;
    set({ tasks: previousTasks.map((t) => (t.ID === taskId ? { ...t, ...updates } : t)) });

    // Fetch logic (commented out)  
    // Handle persistence logic here
  },

  /*loadTasks: async (boardId) => {
    const data = await client.getTasks(boardId);
    const tasks = data.map(task => ({
      ...task,
      details: task.details ? JSON.parse(task.details) : [],
    }));
    set({ tasks });
  },*/
  getTaskById: (id) => get().tasks.find((t) => t.id === id),

  // Board-specific Tasks
  boardTasks: {},

  setBoardTasks: (boardId, tasks) =>
    set((state) => ({
      boardTasks: {
        ...state.boardTasks,
        [boardId]: tasks,
      },
    })),


  getBoardTasks: async (boardId) => {
    const existingTasks = get().boardTasks[boardId];
    if (existingTasks && existingTasks.length > 0) {
      return existingTasks;  // ✅ already cached
    }

    // 🔥 Otherwise, fetch from your backend (replace this with your real fetch call)
    //const response = await fetch(`/api/boards/${boardId}/tasks`);
    //const data = await response.json();
    const tasks = await client.getTasks(boardId);

    // 🧠 Save tasks into Zustand state
    set((state) => ({
      boardTasks: {
        ...state.boardTasks,
        [boardId]: tasks,  // assume your API returns { tasks: [...] }
      },
    }));

    return tasks;
  },
  // Notes
  notes: [],
  setNotes: (notes) => set(() => ({ notes: notes })),
  addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
  removeNote: (id) =>
    set((state) => ({
      notes: state.notes.filter((t) => t.id !== id),
    })),
  getNoteById: (id) => get().notes.find((t) => t.id === id),

  // Utility
  resetStore: () => {
    set({ tasks: [], notes: [] });
  },
}));

export default useOrganiserStore;


