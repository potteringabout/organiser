import { create } from 'zustand'

export const useStore = create((set) => ({
  boards: [],
  tasks: [],
  notes: [],

  addBoardLocal: (board) => set(state => ({
    boards: [...state.boards, board]
  })),
  

  updateBoardLocal: (updateBoard) =>
    set(state => ({
      boards: state.boards.map(board =>
        board.id === updateBoard.id ? { ...board, ...updateBoard } : board
      )
    })),

  deleteBoardLocal: (boardId) =>
    set(state => ({
      boards: state.boards.filter(board => board.id !== boardId),
      tasks: state.tasks.filter(task => task.boardId !== boardId),
      notes: state.notes.filter(note => note.boardId !== boardId)
    })),

  addTaskLocal: (task, parentBoardId = null, parentTaskId = null) => {
    set(state => {
      const newTasks = [...state.tasks, task]
      console.log("Adding task:", task);

      if (parentBoardId) {
        const boards = state.boards.map(board =>
          board.id === parentBoardId
            ? { ...board, taskIds: [...(board.taskIds || []), task.id] }
            : board
        )
        return { tasks: newTasks, boards }
      }

      if (parentTaskId) {
        const updatedParents = state.tasks.map(parent =>
          parent.id === parentTaskId
            ? { ...parent, childTaskIds: [...(parent.childTaskIds || []), task.id] }
            : parent
        )

        return {
          tasks: [...updatedParents, task], // ✅ include both the updated parent and the new task
          boards: state.boards
        }
      }

      return { tasks: newTasks }
    })
  },

  updateTaskLocal: (updatedTask) => {

    console.log("Updating task:", updatedTask);
      
    set(state => ({
      tasks: state.tasks.map(task =>
        task.id === updatedTask.id ? { ...task, ...updatedTask } : task
      )
    }))},

  mergeTasksLocal: (newTasks) =>
    set(state => {
      const existingById = Object.fromEntries(state.tasks.map(task => [task.id, task]))
      for (const task of newTasks) {
        existingById[task.id] = task
      }
      console.log("Merged tasks:", existingById);
      return { tasks: Object.values(existingById) }
    }),

    mergeNotesLocal: (newNotes) =>
      set(state => {
        const existingById = Object.fromEntries(state.notes.map(note => [note.id, note]))
        for (const note of newNotes) {
          existingById[note.id] = note
        }
        return { notes: Object.values(existingById) }
      }),
  

  deleteTaskLocal: (taskId) =>
    set(state => ({
      tasks: state.tasks.filter(task => task.id !== taskId),
      boards: state.boards.map(board => ({
        ...board,
        taskIds: board.taskIds?.filter(id => id !== taskId) || []
      })),
      // Optional: also remove from parentTask.childTaskIds if needed
    })),

  addNoteLocal: (note, parentBoardId = null, parentTaskId = null) => {
    set(state => {
      const newNotes = [...state.notes, note]

      if (parentBoardId) {
        const boards = state.boards.map(board =>
          board.id === parentBoardId
            ? { ...board, noteIds: [...(board.taskIds || []), note.id] }
            : board
        )
        return { tasks: newNotes, boards }
      }

      if (parentTaskId) {
        const updatedParents = state.tasks.map(parent =>
          parent.id === parentTaskId
            ? { ...parent, childNotesIds: [...(parent.childNoteIds || []), note.id] }
            : parent
        )

        return {
          notes: [...updatedParents, note], // ✅ include both the updated parent and the new task
          boards: state.boards
        }
      }

      return { tasks: newNotes }
    })
  },

  setData: (data) => set(() => data)
}))