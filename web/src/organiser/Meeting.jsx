import { useStore } from "./store/useStore";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import MeetingCard from "../components/ui/meetingCard";
import { MarkdownEditable } from "@/components/ui/markDownDisplay";
import { useTasks } from "@/organiser/store/useTasks";
import { useNotes } from "@/organiser/store/useNotes";
import { MessageSquare, ListTodo } from "lucide-react";

function Meeting() {
  const { meetingId } = useParams();
  const meetings = useStore(state => state.meetings);
  const { upsertTask } = useTasks();
  const {upsertNote } = useNotes();
  
  const [sharedInputText, setSharedInputText] = useState("");

  const meeting = useMemo(() => {
    console.log('useMemo for Meeting:', meetingId);
    return meetings.find(meeting => String(meeting.id) === String(meetingId));
  }, [meetingId, meetings]);

  if (!meeting) return <div>Loading meeting...</div>;

  return (
    <div className="space-y-6">
      <div className="text-gray-800">
              <MarkdownEditable
                updateId="new-task-input"
                value={sharedInputText}
                onSave={() => { }}
                alternateSaves={[
                  {
                    icon: <div className="p-2 rounded-full border bg-blue-500 text-white border-blue-500 hover:bg-blue-700"><MessageSquare size={16} /></div>,
                    label: "Save as Note",
                    onClick: (text) => {
                      const trimmed = text.trim();
                      if (!trimmed) return;
                      upsertNote({ board_id: meeting.board_id, meeting_id:meeting.id, meetingId, content: trimmed });
                    }
                  },
                  {
                    icon: <div className="p-2 rounded-full border bg-blue-500 text-white border-blue-500 hover:bg-blue-700"><ListTodo size={16} /></div>,
                    label: "Save as Task",
                    onClick: (text) => {
                      const trimmed = text.trim();
                      if (!trimmed) return;
                      upsertTask({ board_id: meeting.board_id, meeting_id:meeting.id, title: trimmed, status: "todo" });
                    }
                  },
                ]}
                placeholder="Add a comment or task..."
              />
            </div>
      <MeetingCard meeting={meeting} />
    </div>
  );
}

export default Meeting;