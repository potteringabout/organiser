import { getIdToken } from '../../Auth';

const API_ENDPOINT = 'https://organiser-dev01.potteringabout.net/api';

export async function apiRequest(endpoint, options = {}) {
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${getIdToken()}`,
    'Content-Type': 'application/json'
  };

  const response = await fetch(API_ENDPOINT + endpoint, { ...options, headers });

  if (!response.ok) {
    const errorDetails = await response.json().catch(() => response.statusText);
    throw new Error(
      `Request failed with status ${response.status}: ${JSON.stringify(errorDetails)}`
    );
  }
  return response.json();
}