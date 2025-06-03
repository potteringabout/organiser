import { useStore } from './useStore'
import { useEffect } from 'react'
import {
  upsertNote as upsertNoteRemote,
  deleteNote as deleteNoteRemote,
  fetchBoardNotes
} from '../services/noteService'

export const useNotes = (boardId = null) => {
  const upsertNoteLocal = useStore(state => state.upsertNoteLocal)
  const deleteNoteLocal = useStore(state => state.deleteNoteLocal)
  const notes = useStore(state => state.notes)

  useEffect(() => {
      console.log('useEffect')
      const load = async () => {
        const hasNotesForBoard = notes.some(note => note.board_id == boardId  );
        if (!hasNotesForBoard) {
          try {
            const remoteNotes = await fetchBoardNotes(boardId, 3)
            upsertNoteLocal(remoteNotes)
            console.log('Loaded notes for board', remoteNotes)
          } catch (err) {
            console.error('Failed to fetch notes for board', err)
          }
        }
      }
      if ( boardId ){
        load()
      } 
    }, [boardId])
  

  const upsertNote = async (note) => {
    if (note.id) {
      upsertNoteLocal(note)
      const result = await upsertNoteRemote(note)
      console.log("Upserted note x", result.note)
    } else {
      const result = await upsertNoteRemote(note)
      upsertNoteLocal(result.note)
      console.log("Upserted note", result.note)
    }
  }

  const deleteNote = async (noteId) => {
    deleteNoteLocal(noteId)
    try {
      await deleteNoteRemote(noteId)
    } catch (err) {
      console.error('Failed to delete note from server', err)
    }
  }

  const getNotesForTask = (taskId) => notes.filter(n => n.task_id === Number(taskId))
  const getNotesForBoard = (boardId) => notes.filter(n => n.board_id === Number(boardId))
  const getNotesWithNoParentForBoard = (boardId) => notes.filter(n => n.board_id === Number(boardId) && !n.task_id)

  return {
    notes,
    upsertNote,
    deleteNote,
    getNotesForTask,
    getNotesForBoard,
    getNotesWithNoParentForBoard
  }
}