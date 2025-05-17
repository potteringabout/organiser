import { useStore } from './useStore'
import { deleteNote as deleteNoteRemote } from '../services/noteService'

export const useNotes = () => {
  const upsertNoteLocal = useStore(state => state.upsertNoteLocal)
  
  const deleteNoteLocal = useStore(state => state.deleteNoteLocal)
  const notes = useStore(state => state.notes)


  const deleteNote = async (noteId) => {
    deleteNoteLocal(noteId)
    try {
      await deleteNoteRemote(noteId)
    } catch (err) {
      console.error('Failed to delete note from server', err)
      // Optionally: re-add taskLocal if retrying
    }
  }

  return { deleteNote }
}