import { useStore } from './useStore'
import { createTask as createTaskRemote, deleteTask as deleteTaskRemote } from '../services/taskService'

export const useTasks = () => {
  const addTaskLocal = useStore(state => state.addTaskLocal)
  const deleteTaskLocal = useStore(state => state.deleteTaskLocal)
  const tasks = useStore(state => state.tasks)

  const createTask = async (task, parentBoardId = null, parentTaskId = null) => {
    addTaskLocal(task, parentBoardId, parentTaskId) // ✅ Use it!
  
    try {
      await createTaskRemote(task)
    } catch (err) {
      console.error('Failed to save task:', err)
      // Optional error handling
    }
  }

  const deleteTask = async (taskId) => {
    deleteTaskLocal(taskId)
    try {
      await deleteTaskRemote(taskId)
    } catch (err) {
      console.error('Failed to delete task from server', err)
      // Optionally: re-add taskLocal if retrying
    }
  }

  return { tasks, createTask, deleteTask }
}