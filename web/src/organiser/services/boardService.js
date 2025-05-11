import { apiRequest } from './baseService'

export async function createBoard(board) {
  return apiRequest("/boards", {method: "POST", body: JSON.stringify(board)});
}

export async function deleteBoard(boardId) {
  return apiRequest(`/boards/${boardId}`, {method: "DELETE"});
}

export async function getBoard(boardId) {
  return apiRequest(`/boards/${boardId}`);
}

export async function getBoards() {
  console.log("getBoards");
  return apiRequest("/boards");
}