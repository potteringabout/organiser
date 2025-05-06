import { useStore } from './useStore'
import { getBoards } from '../services/boardService'

export const useBoards = () => {
  const boards = useStore(state => state.boards)
  const addBoard = useStore(state => state.addBoard)
  const setBoards = useStore.setState

  const fetchBoards = async () => {
    try {
      console.log("Fetching boards !!!!");
      const data = await getBoards()
      setBoards(() => ({ boards: data }))
    } catch (err) {
      console.error('Failed to fetch boards:', err)
    }
  }

  return { boards, addBoard, fetchBoards }
}

export const useBoardTasks = (boardId) => {
  return useStore(state => {
    const board = state.boards.find(b => b.id === boardId)
    if (!board) return []
    return state.tasks.filter(task => board.taskIds.includes(task.id))
  })
}

export const useBoardNotes = (boardId) => {
  return useStore(state => {
    const board = state.boards.find(b => b.id === boardId)
    if (!board) return []
    return state.notes.filter(note => note.parentBoardId === boardId)
  })
}