"use client";
import { getIdToken } from './auth';

const API_ENDPOINT = 'https://afuoaqahz7.execute-api.eu-west-2.amazonaws.com/dev';

function apiRequest(endpoint, options = {}) {
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${getIdToken()}`,
    'Content-Type': 'application/json'
  };

  return fetch(endpoint, { ...options, headers })
    .then(async (response) => {
      if (!response.ok) {
        let errorDetails;
        try {
          errorDetails = await response.json();
        } catch {
          errorDetails = response.statusText;
        }
        throw new Error(
          `Request failed with status ${response.status}: ${JSON.stringify(errorDetails)}`
        );
      }
      return response.json(); // Returns the actual data
    })
    .catch((error) => {
      console.error("API request error:", error);
      throw error; // Ensures caller must handle errors
    });
}


export async function createBoard(name, description) {
  try {
    const data = apiRequest(`${API_ENDPOINT}/boards`, {method: "POST", body: JSON.stringify({name, description})});
    console.log("Data is " + data);
    return data;
  }
  catch (error) {
    throw new Error('Failed to fetch data:', error);
  }
}

export async function deleteBoard(boardId) {
  try {
    const data = apiRequest(`${API_ENDPOINT}/boards/${boardId}`, {method: "DELETE"});
    console.log("Data is " + data);
    return data;
  }
  catch (error) {
    throw new Error('Failed to fetch data:', error);
  }
}

export async function getBoard(boardId) {
  try {
    const data = apiRequest(`${API_ENDPOINT}/boards/${boardId}`);
    console.log("Data is " + data);
    return data;
  }
  catch (error) {
    throw new Error('Failed to fetch data:', error);
  }
}

export async function getBoards() {
  try {
    const data = apiRequest(`${API_ENDPOINT}/boards`);
    console.log(data);
    return data;
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
}