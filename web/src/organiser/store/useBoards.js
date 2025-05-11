import { useStore } from './useStore'
import { deleteBoard as deleteBoardRemote, getBoards, createBoard as createBoardRemote } from '../services/boardService'
import { showAlert } from "@/components/ui/alert";

export const useBoards = () => {
  const boards = useStore(state => state.boards)
  const addBoard = useStore(state => state.addBoard)
  const deleteBoardLocal = useStore(state => state.deleteBoardLocal)
  
  const setBoards = useStore.setState

  const createBoard = async (board) => {
    try {
      const b = await createBoardRemote(board)
      setBoards(() => ({ boards: [...boards, b] }))
      showAlert("Board created.", "success");
      
    } catch (err) {
      console.error('Failed to create board:', err)
    }   
  }
    
  const fetchBoards = async () => {
    try {
      console.log("Fetching boards !!!!");
      const data = await getBoards()
      setBoards(() => ({ boards: data }))
    } catch (err) {
      console.error('Failed to fetch boards:', err)
    }
  }

  const deleteBoard = async (boardId) => {
    try {
      showAlert("Board deleted.", "warning");
      deleteBoardLocal(boardId)
      await deleteBoardRemote(boardId)
    } catch (err) {
      console.error('Failed to delete board:', err)
    }
  }

  return { boards, addBoard, fetchBoards, deleteBoard, createBoard }
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