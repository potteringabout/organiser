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

      <div className="flex flex-col md:flex-row gap-4">
        {/* Notes Column */}
        <div className="md:w-1/2 space-y-4">
          <div>Notes</div>
          {notesLoading ? (
            <div className="flex justify-center items-center p-4">
              <div className="h-5 w-5 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : Object.entries(
            [...getNotesForBoard(boardId)]
              .sort((a, b) => new Date(b.last_modified) - new Date(a.last_modified))
              .reduce((acc, note) => {
                const dateKey = new Date(note.last_modified).toLocaleDateString("en-GB", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });
                acc[dateKey] = acc[dateKey] || [];
                acc[dateKey].push(note);
                return acc;
              }, {})
          ).map(([date, notes]) => (
            <div key={date} className="space-y-2">
              <div className="font-bold text-gray-900 dark:text-gray-200">{date}</div>
              {notes.map((note) => (
                <div key={note.id} className="mt-3 flex justify-between items-start gap-2 text-gray-400 border p-2 rounded">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-900 dark:text-gray-200 flex items-center gap-1 ">
                        <span>Meeting:</span>
                        <MeetingDropdown
                          boardId={boardId}
                          displayOnly={true}
                          selectedMeetingId={note.meeting_id}
                          onSelect={(meeting) => {
                            if (meeting) {
                              upsertNote({
                                ...note,
                                meeting_id: Number(meeting.id),
                              });
                            }
                          }}
                        />
                      </div>
                      <div className="text-sm text-gray-900 dark:text-gray-200 flex items-center gap-1">
                        <span>Task:</span>
                        <TaskDropdown
                          boardId={boardId}
                          displayOnly={true}
                          selectedTaskId={note.task_id}
                          onSelect={(task) => {
                            console.log(task)
                            if (task) {
                              upsertNote({
                                ...note,
                                task_id: Number(task.id),
                              });
                            }
                          }}
                        />
                      </div>
                    </div>
                    <MarkdownEditable
                      updateId={`${note.id}`}
                      value={note.content}
                      onSave={(newText) =>
                        upsertNote({ id: note.id, content: newText })
                      }
                    />
                  </div>
                  <DropdownMenu items={[
                    {
                      label: "Delete",
                      icon: Trash2,
                      onClick: () => {
                        if (window.confirm("Are you sure you want to delete this task?")) {
                          deleteNote(note.id);
                          console.log("Deleted note", note.id);
                        }
                      },
                      style: "danger",
                    },
                  ]} />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Tasks Column */}
        <div className="md:w-1/2 space-y-4">
          <div>Tasks</div>
          {statusOrder.map((status) => {
            const tasks = groupedTasks[status] || [];
            const isLoading = !groupedTasks.hasOwnProperty(status);

            tasks.sort((a, b) => new Date(b.last_modified) - new Date(a.last_modified));

            return (
              <div key={status}>
                <h2 className="flex items-center gap-2">
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