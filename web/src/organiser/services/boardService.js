import { apiRequest } from './baseService'

export async function createBoard(name, description) {
  return apiRequest("/boards", {method: "POST", body: JSON.stringify({name, description})});
}

export async function deleteBoard(boardId) {
  return apiRequest(`/boards/${boardId}`, {method: "DELETE"});
}

export async function getBoard(boardId) {
  return apiRequest(`/boards/${boardId}`);
}

export async function getBoards() {
  return apiRequest("/boards");
}