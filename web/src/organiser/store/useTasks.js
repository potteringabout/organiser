import { useStore } from './useStore'
import { createTask as createTaskRemote, deleteTask as deleteTaskRemote, fetchTask, updateTask as updateTaskRemote } from '../services/taskService'

export const useTasks = () => {
  const upsertTaskLocal = useStore(state => state.upsertTaskLocal)
  const upsertNoteLocal = useStore(state => state.upsertNoteLocal)
  
  const deleteTaskLocal = useStore(state => state.deleteTaskLocal)
  const tasks = useStore(state => state.tasks)

  const createTask = async (task) => {
    upsertTaskLocal(task) // ✅ Use it!
  
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

  const getTask = async(taskId) => {
    try {
      const task = await fetchTask(taskId)
      upsertNoteLocal(task.notes)
      upsertTaskLocal(task.subtasks)
      return task
    } catch (err) {
      console.error('Failed to fetch task from server', err)
      // Optionally: re-add taskLocal if retrying
    }
  }

  const updateTask = async (task) => {
    try {
      upsertTaskLocal(task)
      await updateTaskRemote(task)
    } catch (err) {
      console.error('Failed to update task', err)
    }
  } 

  return { tasks, getTask, createTask, deleteTask, updateTask }
}