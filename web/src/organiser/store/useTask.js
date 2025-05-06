/* eslint-disable react-hooks/exhaustive-deps */
import { useStore } from './useStore'
import { fetchTask } from '../services/taskService'
import { useMemo } from 'react'

export const useTask = (taskId) => {
  const mergeNotesLocal = useStore(state => state.mergeNotesLocal)
  const mergeTasksLocal = useStore(state => state.mergeTasksLocal)
  const tasks = useStore(state => state.tasks)
  const notes = useStore(state => state.notes)

  // Initialize and memoize boardTasks
  const tasknotes = useMemo(() => {
    const b = notes.filter(note => note.parent_id == taskId)
    return b
  }, [notes, taskId])

  const tasktasks = useMemo(() => {
    const b = tasks.filter(task => task.parent_id == taskId)
    return b
  }, [tasks, taskId])

  const loadChildren = async () => {
    try {
      const task = await fetchTask(taskId)
      mergeTasksLocal(task.subtasks)
      mergeNotesLocal(task.notes)
    } catch (err) {
      console.error('Failed to fetch tasks for board', err)
    }
  }
  /*
  useEffect(() => {
    const load = async () => {
      //const hasTasksForBoard = tasks.some(task => task.board_id == boardId);
      //if (!hasTasksForBoard) {
      try {
        const task = await fetchTask(taskId)
        mergeTasksLocal(task.subtasks)
        mergeNotesLocal(task.notes)
      } catch (err) {
        console.error('Failed to fetch tasks for board', err)
      }
      //}
    }
    if (active) {
      load()
    }
  }, [taskId, active])
  */
  return { tasknotes, tasktasks, loadChildren }
}