import { useStore } from './useStore'
import {
  upsertNote as upsertNoteRemote,
  deleteNote as deleteNoteRemote
} from '../services/noteService'

export const useNotes = () => {
  const upsertNoteLocal = useStore(state => state.upsertNoteLocal)
  const deleteNoteLocal = useStore(state => state.deleteNoteLocal)
  const notes = useStore(state => state.notes)

  const upsertNote = async (note) => {
    if (note.id) {
      upsertNoteLocal(note)
      await upsertNoteRemote(note)
    } else {
      const result = await upsertNoteRemote(note)
      upsertNoteLocal(result.note)
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

  const getNotesForTask = (taskId) => notes.filter(n => n.task_id === taskId)
  const getNotesForBoard = (boardId) => notes.filter(n => n.board_id === boardId)

  return {
    notes,
    upsertNote,
    deleteNote,
    getNotesForTask,
    getNotesForBoard
  }
}