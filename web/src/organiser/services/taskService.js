import { apiRequest } from './baseService'

export async function upsertTask(task) {
  if (task.id) {
    return apiRequest(`/tasks/${task.id}`, {method: "PUT", body: JSON.stringify(task)});
  } else {
    return apiRequest("/tasks", {method: "POST", body: JSON.stringify(task)});
  }
}

export async function deleteTask(taskId) {
  return apiRequest(`/tasks/${taskId}`, {method: "DELETE"});
}

export const fetchTask = async (taskId) => {
  return apiRequest(`/tasks/${taskId}`);
}

export const fetchBoardTasks = async (boardId) => {
  return apiRequest(`/boards/${boardId}/tasks`);
}