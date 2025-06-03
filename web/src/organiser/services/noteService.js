import { apiRequest } from './baseService'

export async function upsertNote(note) {
  if (note.id) {
    return apiRequest(`/notes/${note.id}`, {method: "PUT", body: JSON.stringify(note)});
  } else {
    return apiRequest("/notes", {method: "POST", body: JSON.stringify(note)});
  }
}

export async function deleteNote(noteId) {
  return apiRequest(`/notes/${noteId}`, {method: "DELETE"});
}

export const fetchNote = async (noteId) => {
  return apiRequest(`/notes/${noteId}`);
}

export const fetchBoardNotes = async (boardId, days) => {
  let url = `/boards/${boardId}/notes`;
  if (days !== undefined) {
    url += `?days=${days}`;
  }
  return apiRequest(url);
}