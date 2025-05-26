import { apiRequest } from './baseService'

export async function upsertMeeting(meeting) {
  if (meeting.id) {
    return apiRequest(`/meetings/${meeting.id}`, {method: "PUT", body: JSON.stringify(meeting)});
  } else {
    return apiRequest("/meetings", {method: "POST", body: JSON.stringify(meeting)});
  }
}

export async function deleteMeeting(meetingId) {
  return apiRequest(`/meetings/${meetingId}`, {method: "DELETE"});
}

export const fetchMeeting = async (meetingId) => {
  return apiRequest(`/meetings/${meetingId}`);
}

export const fetchBoardMeetings = async (boardId) => {
  return apiRequest(`/boards/${boardId}/meetings`);
}