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

export const fetchBoardNotes = async (boardId, opts) => {
  // Backward compatibility: if caller passes a number/string, treat as days
  let params = {};
  if (typeof opts === 'number' || typeof opts === 'string') {
    params.days = opts;
  } else if (opts && typeof opts === 'object') {
    params = opts;
  }

  // Build query string. Precedence: if from/to present, ignore days.
  const search = new URLSearchParams();
  if (params.from) search.set('from', params.from);
  if (params.to) search.set('to', params.to);
  if (!params.from && !params.to && params.days !== undefined && params.days !== null && params.days !== '') {
    search.set('days', params.days);
  }

  const qs = search.toString();
  const url = `/boards/${boardId}/notes${qs ? `?${qs}` : ''}`;
  return apiRequest(url);
}