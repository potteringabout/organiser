// /services/taskService.js

import { apiRequest } from './baseService'

export async function createTask(task) {
  return apiRequest("/tasks", {method: "POST", body: JSON.stringify(task)});
}

export async function deleteTask(taskId) {
  return apiRequest(`/tasks/${taskId}`, {method: "DELETE"});
}


export const fetchTask = async (taskId) => {
  const response = await fetch(`/api/tasks/${taskId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch task')
  }
  return await response.json()
}
