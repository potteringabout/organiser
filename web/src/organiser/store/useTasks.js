import { useStore } from './useStore'
import { deleteTask as deleteTaskRemote, fetchTask, upsertTask as upsertTaskRemote } from '../services/taskService'
import { upsertNote as upsertNoteRemote } from '../services/noteService'

export const useTasks = () => {
  const upsertTaskLocal = useStore(state => state.upsertTaskLocal)
  const upsertNoteLocal = useStore(state => state.upsertNoteLocal)
  const deleteTaskLocal = useStore(state => state.deleteTaskLocal)
  const tasks = useStore(state => state.tasks)
  const notes = useStore(state => state.notes)

  const upsertTask = async (task) => {
    const t = await upsertTaskRemote(task)
    return upsertTaskLocal(t.task)
  }

  const upsertNote = async (note) => {
    if (note.id) {
      upsertNoteLocal(note)
      await upsertNoteRemote(note)
    } else {
      const result = await upsertNoteRemote(note)
      return upsertNoteLocal(result.note)
    }
  }

  const deleteTask = async (taskId) => {
    deleteTaskLocal(taskId)
    try {
      await deleteTaskRemote(taskId)
    } catch (err) {
      console.error('Failed to delete task from server', err)
    }
  }

  const getTask = async (taskId) => {
    try {
      const task = await fetchTask(taskId)
      upsertNoteLocal(task.notes)
      upsertTaskLocal(task.subtasks)
      return task
    } catch (err) {
      console.error('Failed to fetch task from server', err)
    }
  }

  // 📦 Derived state helpers
  const getSubtasks = (parentId) => tasks.filter(t => t.parent_id === parentId)
  const getTaskNotes = (taskId) => notes.filter(n => n.task_id === taskId)

  return {
    tasks,
    upsertTask,
    deleteTask,
    getTask,
    upsertNote,
    getSubtasks,
    getTaskNotes,
  }
}