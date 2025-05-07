/* eslint-disable react-hooks/exhaustive-deps */
import { useStore } from './useStore'
import { fetchTask } from '../services/taskService'
import { useMemo } from 'react'

export const useTask = (taskId) => {
  const upsertNoteLocal = useStore(state => state.upsertNoteLocal)
  const upsertTaskLocal = useStore(state => state.upsertTaskLocal)
  const tasks = useStore(state => state.tasks)
  const notes = useStore(state => state.notes)

  // Initialize and memoize boardTasks
  const tasknotes = useMemo(() => {
    const b = notes.filter(note => note.parent_id == taskId)
    return b
  }, [notes, taskId])

  const subtasks = useMemo(() => {
    const b = tasks.filter(task => task.parent_id == taskId)
    return b
  }, [tasks, taskId])

  const loadChildren = async () => {
    try {
      const task = await fetchTask(taskId)
      upsertTaskLocal(task.subtasks)
      upsertNoteLocal(task.notes)
    } catch (err) {
      console.error('Failed to fetch tasks for board', err)
    }
  }
  
  return { tasknotes, subtasks, loadChildren }
}