/* eslint-disable react-hooks/exhaustive-deps */
import { useStore } from './useStore'
import { createTask, fetchTask, deleteTask as deleteTaskRemote } from '../services/taskService'
import { upsertNote as upsertNoteRemote } from '../services/noteService'
import { useMemo } from 'react'

export const useTask = (taskId) => {
  const upsertNoteLocal = useStore(state => state.upsertNoteLocal)
  const upsertTaskLocal = useStore(state => state.upsertTaskLocal)
  const deleteTaskLocal = useStore(state => state.deleteTaskLocal)
  
  const tasks = useStore(state => state.tasks)
  const notes = useStore(state => state.notes)

  // Initialize and memoize boardTasks
  const tasknotes = useMemo(() => {
    const b = notes.filter(note => note.task_id == taskId)
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

  const upsertNote = async (note) => {
    if (note.id) {
      const x = upsertNoteLocal(note)
      console.log("notes ...", x)
      const n = await upsertNoteRemote(note)
      console.log("upsertNote", n)
    }
    else {
      // If the note is new, we need to create it first to get an id.
      const n = await upsertNoteRemote(note)
      console.log("upsertNote", n)
      const x = upsertNoteLocal(n.note)
      console.log("notes ...", x)
    }

  }

  const upsertTask = async (task) => {
    const t = await createTask(task)
    const x = upsertTaskLocal(t.task)
    console.log("tasks ...", x)
  }

  const deleteTask = async (taskId) => {
    await deleteTaskRemote(taskId)
    deleteTaskLocal(taskId)
  }

  return { tasknotes, subtasks, loadChildren, upsertNote, upsertTask, deleteTask }
}