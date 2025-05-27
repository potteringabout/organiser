import { useStore } from './useStore'
import { useEffect } from 'react'
import {
  upsertMeeting as upsertMeetingRemote,
  deleteMeeting as deleteMeetingRemote,
  fetchBoardMeetings
} from '../services/meetingService'

export const useMeetings = (boardId = null) => {
  const upsertMeetingLocal = useStore(state => state.upsertMeetingLocal)
  const deleteMeetingLocal = useStore(state => state.deleteMeetingeLocal)
  const meetings = useStore(state => state.meetings)

  useEffect(() => {
      console.log('useEffect')
      const load = async () => {
        const hasMeetingsForBoard = meetings.some(meeting => meeting.board_id == boardId  );
        if (!hasMeetingsForBoard) {
          try {
            const remoteMeetings = await fetchBoardMeetings(boardId)
            upsertMeetingLocal(remoteMeetings)
            console.log('Loaded meetings for board', remoteMeetings)
          } catch (err) {
            console.error('Failed to fetch meetings for board', err)
          }
        }
      }
      if ( boardId ){
        load()
      }
    }, [boardId])
  

  const upsertMeeting = async (meeting) => {
    if (meeting.id) {
      upsertMeetingLocal(meeting)
      const result = await upsertMeetingRemote(meeting)
      console.log("Upserted meeting x", result.meeting)
      return result.meeting
    } else {
      const result = await upsertMeetingRemote(meeting)
      upsertMeetingLocal(result.meeting)
      console.log("Upserted meeting", result.meeting)
      return result.meeting
    }
  }

  const deleteMeeting = async (meetingId) => {
    deleteMeetingLocal(meetingId)
    try {
      await deleteMeetingRemote(meetingId)
    } catch (err) {
      console.error('Failed to delete meeting from server', err)
    }
  }

  const getMeetingsForTask = (taskId) => meetings.filter(n => n.task_id === Number(taskId))
  const getMeetingsForBoard = (boardId) => meetings.filter(n => n.board_id === Number(boardId))
  const getMeetingsWithNoParentForBoard = (boardId) => meetings.filter(n => n.board_id === Number(boardId) && !n.task_id)

  return {
    meetings,
    upsertMeeting,
    deleteMeeting,
    getMeetingsForTask,
    getMeetingsForBoard,
    getMeetingsWithNoParentForBoard
  }
}