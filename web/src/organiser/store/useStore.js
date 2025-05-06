import { create } from 'zustand'

function upsertImmutable(array, newItem, key = 'id') {
  const index = array.findIndex(item => item[key] === newItem[key])

  if (index > -1) {
    // Update item
    return [
      ...array.slice(0, index),
      { ...array[index], ...newItem },
      ...array.slice(index + 1),
    ]
  } else {
    // Insert new item
    return [...array, newItem]
  }
}

export const useStore = create((set) => ({
  boards: [],
  tasks: [],
  notes: [],

  upsertNoteLocal: (notes) =>
    set((state) => {
      const noteList = Array.isArray(notes) ? notes : [notes]

      const updatedNotes = noteList.reduce(
        (acc, note) => upsertImmutable(acc, note),
        state.notes
      )

      return { notes: updatedNotes }
    }),

  upsertTaskLocal: (tasks) =>
    set((state) => {
      const taskList = Array.isArray(tasks) ? tasks : [tasks]

      const updatedTasks = taskList.reduce(
        (acc, task) => upsertImmutable(acc, task),
        state.tasks
      )

      return { tasks: updatedTasks }
    }),

  upsertBoardLocal: (boards) =>
    set((state) => {
      const boardList = Array.isArray(boards) ? boards : [boards]

      const updatedBoards = boardList.reduce(
        (acc, board) => upsertImmutable(acc, board),
        state.boards
      )

      return { boards: updatedBoards }
    }),

  deleteBoardLocal: (boardId) =>
    set(state => ({
      boards: state.boards.filter(board => board.id !== boardId),
      tasks: state.tasks.filter(task => task.boardId !== boardId),
      notes: state.notes.filter(note => note.boardId !== boardId)
    })),

  deleteTaskLocal: (taskId) =>
    set(state => ({
      tasks: state.tasks.filter(task => task.id !== taskId),
      boards: state.boards.map(board => ({
        ...board,
        taskIds: board.taskIds?.filter(id => id !== taskId) || []
      })),
      // Optional: also remove from parentTask.childTaskIds if needed
    })),


  setData: (data) => set(() => data)
}))