import { getIdToken } from '../../Auth';

const API_ENDPOINT = 'https://organiser-dev01.potteringabout.net/api/dev';

async function apiRequest(endpoint, options = {}) {
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${getIdToken()}`,
    'Content-Type': 'application/json'
  };

  const response = await fetch(endpoint, { ...options, headers });

  if (!response.ok) {
    const errorDetails = await response.json().catch(() => response.statusText);
    throw new Error(
      `Request failed with status ${response.status}: ${JSON.stringify(errorDetails)}`
    );
  }
  return response.json();
}

export async function getTasks(boardId) {
  var tasks = await apiRequest(`${API_ENDPOINT}/boards/${boardId}/tasks`);

  return tasks.map((task) => ({
    ...task,
    details: task.details ? JSON.parse(task.details) : [],
  }));
}

/*export async function getTasks(boardId, taskId) {
  return apiRequest(`${API_ENDPOINT}/boards/${boardId}/tasks/${taskId}`);
}*/

export async function upsertItem(boardId, item) {
  return apiRequest(`${API_ENDPOINT}/boards/${boardId}/items`, {method: "POST", body: JSON.stringify(item)});
}

export async function createBoard(name, description) {
  return apiRequest(`${API_ENDPOINT}/boards`, {method: "POST", body: JSON.stringify({name, description})});
}

export async function deleteBoard(boardId) {
  return apiRequest(`${API_ENDPOINT}/boards/${boardId}`, {method: "DELETE"});
}

export async function getBoard(boardId) {
  return apiRequest(`${API_ENDPOINT}/boards/${boardId}`);
}

export async function getBoards() {
  return apiRequest(`${API_ENDPOINT}/boards`);
}


export async function addUpdate(update) {
  return apiRequest(`${API_ENDPOINT}/upload`, {method: "POST", body: JSON.stringify({text: update})});
}