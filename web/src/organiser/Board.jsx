import { useBoardTasks } from "./store/useBoardTasks";
import TaskCard from "@/components/ui/taskCard";
import { useState, useEffect } from "react";
import { CheckCircle, Hourglass, Circle, Ban } from "lucide-react";
import { useParams } from "react-router-dom";
import { MarkdownEditable } from "@/components/ui/markDownDisplay";
import { MeetingDropdown } from "@/components/ui/meetingDropDown";
import { TaskDropdown } from "@/components/ui/taskDropDown";

import DropdownMenu from "@/components/ui/ellipseDropDown";
import { useTasks } from "@/organiser/store/useTasks";
import { useNotes } from "@/organiser/store/useNotes";
import { useMeetings } from "@/organiser/store/useMeetings";
import {
  ListTodo,
  MessageSquare,
  Trash2
} from "lucide-react";


// eslint-disable-next-line react/prop-types
function Board() {
  const { boardId } = useParams();
  const { groupedTasks } = useBoardTasks(boardId);
  const [sharedInputText, setSharedInputText] = useState("");
  const { tasks, upsertTask } = useTasks();
  const { upsertNote, getNotesForBoard, getNotesWithNoParentForBoard, deleteNote } = useNotes(boardId);
  const { meetings } = useMeetings(boardId);
  const [notesLoading, setNotesLoading] = useState(true);
  // Dropdown state for note actions
  const [activeMeetingNoteId, setActiveMeetingNoteId] = useState(null);
  const [activeTaskNoteId, setActiveTaskNoteId] = useState(null);

  useEffect(() => {
    setNotesLoading(true);
    const timeout = setTimeout(() => {
      setNotesLoading(false);
    }, 500); // simulate loading delay
    return () => clearTimeout(timeout);
  }, [boardId]);

  const statusOrder = ["todo", "in_progress", "done", "blocked"];
  const statuses = {
    todo: "To Do",
    in_progress: "In Progress",
    done: "Done",
    blocked: "Blocked",
  }

  if (!boardId) {
    return <div>Select or create a board</div>;
  }

  //if (loading) return <div>Loading...</div>;
  //if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      {/* Shared Input */}
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
                upsertNote({ board_id: boardId, content: trimmed });
              }
            },
            {
              icon: <div className="p-2 rounded-full border bg-blue-500 text-white border-blue-500 hover:bg-blue-700"><ListTodo size={16} /></div>,
              label: "Save as Task",
              onClick: (text) => {
                const trimmed = text.trim();
                if (!trimmed) return;
                upsertTask({ board_id: boardId, title: trimmed, status: "todo" });
              }
            },
          ]}
          placeholder="Add a comment or task..."
        />
      </div>

      <div className="flex flex-row gap-4 overflow-x-auto pb-4">
        {statusOrder.map((status) => {
          const tasks = groupedTasks[status] || [];
          const isLoading = !groupedTasks.hasOwnProperty(status);

          tasks.sort((a, b) => new Date(b.last_modified) - new Date(a.last_modified));

          return (
            <div key={status} className="min-w-[250px] w-1/4 bg-gray-50 rounded-lg p-3 shadow">
              <h2 className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
                {getStatusIcon(status)} {statuses[status]}
              </h2>
              {isLoading ? (
                <div className="flex justify-center items-center p-4">
                  <div className="h-5 w-5 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-sm text-gray-500 italic">No tasks found.</div>
              ) : (
                tasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getStatusIcon(status) {
  switch (status) {
    case "todo":
      return <Circle size={16} />;
    case "in_progress":
      return <Hourglass size={16} />;
    case "done":
      return <CheckCircle size={16} />;
    case "blocked":
      return <Ban size={16} />;
    default:
      return null;
  }
}

export default Board;