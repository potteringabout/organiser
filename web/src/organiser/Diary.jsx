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
function Diary() {
  const { boardId } = useParams();
  const { groupedTasks } = useBoardTasks(boardId);
  const [sharedInputText, setSharedInputText] = useState("");
  const { tasks, upsertTask } = useTasks();
  // Time window controls for notes — dual-handle slider in "days ago"
  const MAX_LOOKBACK = 180; // configurable max (days), Today = 0 on the RIGHT
  const maxLookback = MAX_LOOKBACK;
  const [startAgo, setStartAgo] = useState(3); // left handle: older (days ago)
  const [endAgo, setEndAgo] = useState(0);     // right handle: newer (0 = today)

  // Keep handles ordered: startAgo >= endAgo (both are "days ago")
  const handleStartChange = (pos) => {
    const proposed = maxLookback - Math.max(0, Math.min(maxLookback, Number(pos)));
    setStartAgo(Math.max(proposed, endAgo));
  };
  const handleEndChange = (pos) => {
    const proposed = maxLookback - Math.max(0, Math.min(maxLookback, Number(pos)));
    setEndAgo(Math.min(proposed, startAgo));
  };

  // Helper: convert N days ago to YYYY-MM-DD (local)
  const daysAgoToDate = (n) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - n);
    // format as YYYY-MM-DD
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const notesFrom = daysAgoToDate(startAgo);
  const notesTo   = daysAgoToDate(endAgo);
  const windowOpts = { from: notesFrom, to: notesTo };

  const { upsertNote, getNotesForBoard, getNotesWithNoParentForBoard, deleteNote } = useNotes(boardId, windowOpts);
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
      {/* Local styles for dual-range sliders: make track ignore events, thumbs handle them */}
      <style>
        {`
        input.dual-range { pointer-events: none; }
        input.dual-range::-webkit-slider-thumb { pointer-events: auto; }
        input.dual-range::-moz-range-thumb { pointer-events: auto; }
        input.dual-range::-ms-thumb { pointer-events: auto; }
        `}
      </style>
      {/* Notes time window controls — dual handle days-ago slider */}
      <div className="flex flex-col gap-3 p-3 border rounded-md bg-white dark:bg-gray-900 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Window: <span className="font-medium">{startAgo}d ago</span> → <span className="font-medium">{endAgo}d ago</span>
            <span className="ml-2 text-xs text-gray-500">(Today = 0)</span>
          </div>
          <div className="text-xs text-gray-500">{notesFrom} → {notesTo} (inclusive 'to' handled by API)</div>
        </div>

        {/* Dual handle: two overlapping range inputs */}
        <div className="relative flex flex-col gap-2">
          {/* Track */}
          <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700" />
          {/* Right (endAgo) — render first, lower z-index */}
          <input
            type="range"
            min={0}
            max={maxLookback}
            step={1}
            value={maxLookback - endAgo}
            onChange={(e) => handleEndChange(e.target.value)}
            className="dual-range absolute -top-1 w-full appearance-none bg-transparent"
            style={{ zIndex: 1 }}
            aria-label="End of window (days ago)"
          />
          {/* Left (startAgo) — render second, higher z-index so it's draggable above the other */}
          <input
            type="range"
            min={0}
            max={maxLookback}
            step={1}
            value={maxLookback - startAgo}
            onChange={(e) => handleStartChange(e.target.value)}
            className="dual-range absolute -top-1 w-full appearance-none bg-transparent"
            style={{ zIndex: 2 }}
            aria-label="Start of window (days ago)"
          />
          {/* Fallback labels to ensure accessibility */}
          <div className="flex justify-between text-xs text-gray-500 pt-4">
            <span>Past {maxLookback}d</span>
            <span>Today</span>
          </div>
        </div>
      </div>
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

      <div className="space-y-4 w-full">
          {notesLoading ? (
            <div className="flex justify-center items-center p-4">
              <div className="h-5 w-5 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (() => {
            // Group notes and tasks under date headings (YYYY-MM-DD)
            const groupedByDate = {};

            [...getNotesForBoard(boardId)].forEach(note => {
              const date = new Date(note.last_modified).toISOString().split("T")[0];
              if (!groupedByDate[date]) groupedByDate[date] = {};
              const key = note.task_id || "No Task";
              groupedByDate[date][key] = groupedByDate[date][key] || [];
              groupedByDate[date][key].push(note);
            });

            tasks.forEach(task => {
              const taskDate = new Date(task.last_modified).toISOString().split("T")[0];
              if (!groupedByDate[taskDate]) groupedByDate[taskDate] = {};
              if (!groupedByDate[taskDate][task.id]) {
                groupedByDate[taskDate][task.id] = [];
              }
            });

            const fromDate = new Date(notesFrom);
            const toDate = new Date(notesTo);
            // inclusive of 'to' since dates are midnight-local strings
            const sortedDateGroups = Object.entries(groupedByDate)
              .filter(([date]) => {
                const d = new Date(date);
                return d >= fromDate && d <= toDate;
              })
              .sort(([a], [b]) => new Date(b) - new Date(a));

            return sortedDateGroups.map(([date, taskGroups]) => (
              <div key={date} className="space-y-6">
                <div className="font-semibold text-gray-800 dark:text-gray-100">
                  {(() => {
                    const d = new Date(date);
                    const day = d.getDate();
                    const ordinal = (n) => {
                      const s = ["th", "st", "nd", "rd"];
                      const v = n % 100;
                      return s[(v - 20) % 10] || s[v] || s[0];
                    };
                    const formatted = `${d.toLocaleDateString("en-GB", {
                      weekday: "long"
                    })} ${day}${ordinal(day)} ${d.toLocaleDateString("en-GB", {
                      month: "long"
                    })}`;
                    return formatted;
                  })()}
                </div>
                {Object.entries(taskGroups).map(([taskId, notes]) => {
                  const task = tasks.find(t => t.id === Number(taskId)) || null;
                  return (
                    <div key={taskId} className="space-y-2">
                      <div className="text-gray-900 dark:text-gray-200">
                        {task ? (
                          <span className="flex items-center gap-2">
                            {getStatusIcon(task.status)} {task.title}
                          </span>
                        ) : "No Task"}
                      </div>
                      {notes
                          .sort((a, b) => new Date(b.last_modified) - new Date(a.last_modified))
                          .map((note) => (
                        <div key={note.id} className="mt-3 flex justify-between items-start gap-2 text-gray-400 pl-4">
                          <div className="flex-1 space-y-1">
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
                              label: "Change Meeting",
                              icon: MessageSquare,
                              onClick: () => setActiveMeetingNoteId(note.id),
                            },
                            {
                              label: "Change Task",
                              icon: ListTodo,
                              onClick: () => setActiveTaskNoteId(note.id),
                            },
                            {
                              label: "Delete",
                              icon: Trash2,
                              onClick: () => {
                                if (window.confirm("Are you sure you want to delete this task?")) {
                                  deleteNote(note.id);
                                }
                              },
                              style: "danger",
                            },
                          ]} />
                          {/* MeetingDropdown and TaskDropdown for this note */}
                          {activeMeetingNoteId === note.id && (
                            <div className="mt-2">
                              <MeetingDropdown
                                boardId={boardId}
                                selectedMeetingId={note.meeting_id}
                                onSelect={(meeting) => {
                                  if (meeting) {
                                    upsertNote({
                                      ...note,
                                      meeting_id: Number(meeting.id),
                                    });
                                  }
                                  setActiveMeetingNoteId(null);
                                }}
                              />
                            </div>
                          )}
                          {activeTaskNoteId === note.id && (
                            <div className="mt-2">
                              <TaskDropdown
                                boardId={boardId}
                                selectedTaskId={note.task_id}
                                onSelect={(task) => {
                                  if (task) {
                                    upsertNote({
                                      ...note,
                                      task_id: Number(task.id),
                                    });
                                  }
                                  setActiveTaskNoteId(null);
                                }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ));
          })()}
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

export default Diary;