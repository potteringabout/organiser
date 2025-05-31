import { useStore } from "./store/useStore";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import MeetingCard from "../components/ui/meetingCard";

function Meeting() {
  const { meetingId } = useParams();
  const meetings = useStore(state => state.meetings);

  const meeting = useMemo(() => {
    console.log('useMemo for Meeting:', meetingId);
    return meetings.find(meeting => String(meeting.id) === String(meetingId));
  }, [meetingId, meetings]);

  if (!meeting) return <div>Loading meeting...</div>;

  return (
    <div className="space-y-6">
      <MeetingCard meeting={meeting} />
    </div>
  );
}

export default Meeting;