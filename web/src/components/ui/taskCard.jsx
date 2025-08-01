/* eslint-disable react/prop-types */
import {
  Clock,
  User,
  AlarmClock,
  ChevronDown,
  ChevronRight,
  ListTodo,
  MessageSquare,
  ExternalLink,
  Trash2
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import StatusDropdown from "./statusDropdown";
import { format, parseISO, isBefore } from "date-fns";
import { useState } from "react";
import { MarkdownEditable } from "@/components/ui/markDownDisplay";
import SnoozeButton from "@/components/ui/snooze";
import DropdownMenu from "@/components/ui/ellipseDropDown";
import { useTasks } from "@/organiser/store/useTasks";
import { useNotes } from "@/organiser/store/useNotes";

export default function TaskCard({ task, expanded = false, depth = 0 }) {
  const { deleteTask, upsertTask, getTask, getSubtasks } = useTasks();
  const { deleteNote, upsertNote, getNotesForTask, getNotesForBoard } = useNotes();
  const [expandedTask, setExpandedTask] = useState(expanded);
  const [snoozed, setSnoozed] = useState( task.snoozed_until && isBefore(new Date(), parseISO(task.snoozed_until)) ? true : false);

  const location = useLocation();
  const isOnTaskPage = location.pathname === `/organiser/task/${task.id}`;

  const [sharedInputText, setSharedInputText] = useState("");

  const [isEditingTask, setIsEditingTask] = useState(false);


  const formattedLastModifiedDate = format(new Date(task.last_modified), "dd MMM yyyy");

  const statusColor = {
    todo: "bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-100",
    in_progress: "bg-yellow-50 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100",
    done: "bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-100",
    blocked: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    cancelled: "bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-200",
    ignored: "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500",
  }[task.status] || "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300";

  if (snoozed) {
    return
  }
  return (
    <div
      className={`rounded-2xl shadow p-2 mb-2 border hover:shadow-md transition ${statusColor}`}
    >
      {/* Header Row */}
      <div className="flex w-full gap-2">
        <div className="w-3/4 overflow-hidden">
          <div className="prose prose-sm max-w-none">
            <MarkdownEditable
              updateId={task.id}
              value={task.title}
              showToolbar={false}
              onSave={(newText) => upsertTask({ id: task.id, title: newText })}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <DropdownMenu
            items={[
              {
                label: "Delete",
                icon: Trash2,
                onClick: () => {
                  if (window.confirm("Are you sure you want to delete this task?")) {
                    deleteTask(task.id);
                    console.log("Deleted task", task.id);
                  }
                },
                style: "danger",
              },
            ]}
          />

          {task.snoozed_until && (
            <span className="flex items-center gap-1 text-xs text-blue-600">
              <AlarmClock size={12} /> Snoozed until{" "}
              {format(parseISO(task.snoozed_until), "dd MMM")}
            </span>
          )}

          {task.due_date && (
            <span className="flex items-center gap-1 text-xs">
              <Clock size={12} /> Due {format(parseISO(task.due_date), "dd MMM")}
            </span>
          )}

          <StatusDropdown
            currentStatus={task.status}
            onChange={(newStatus) => upsertTask({ id: task.id, status: newStatus })}
          />

          <SnoozeButton
            initialDate={task.snoozed_until ? new Date(task.snoozed_until) : undefined}
            onSnooze={(date) => {
              upsertTask({ id: task.id, snoozed_until: date.toISOString() })
                
              if ( isBefore(new Date(), date) ){
                setSnoozed(true);
                console.log("setting snoozed to true")
              }
              else
                setSnoozed(false);
            }
          }
          />

          <button
            onClick={() => {
              if (!expandedTask) getTask(task.id);
              setExpandedTask((prev) => !prev);
            }}
            className="text-gray-600 hover:text-gray-800 transition"
            title={expandedTask ? "Collapse" : "Expand"}
          >
            {expandedTask ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>

          {/* Open in Page */}
          {!isOnTaskPage && (
            <Link
              to={`/organiser/task/${task.id}`}
              title="Open task page"
              className="text-gray-600 hover:text-gray-800 transition"
            >
              <ExternalLink size={20} />
            </Link>
          )}
        </div>

      </div>
      <div className="flex w-full gap-2">
        <div className={`w-full isEditingTask ? "my-4" : "w-2/3"`}>
          <div className="flex justify-between items-start gap-4">
            <div className="prose prose-sm max-w-none flex-1">
              <MarkdownEditable
                updateId="new-task-input"
                value={sharedInputText}
                onSave={() => { }}
                onEditStateChange={setIsEditingTask}
                alternateSaves={[
                  {
                    icon: <div className="p-2 rounded-full border bg-blue-500 text-white border-blue-500 hover:bg-blue-700"><MessageSquare size={16} /></div>,
                    label: "Save as Note",
                    onClick: (text) => {
                      const trimmed = text.trim();
                      if (!trimmed) return;
                      upsertNote({
                        task_id: task.id,
                        board_id: task.board_id,
                        content: trimmed,
                      });
                      setExpandedTask(true);
                    }
                  },
                  {
                    icon: <div className="p-2 rounded-full border bg-blue-500 text-white border-blue-500 hover:bg-blue-700"><ListTodo size={16} /></div>,
                    label: "Save as Task",
                    onClick: (text) => {
                      const trimmed = text.trim();
                      if (!trimmed) return;
                      upsertTask({
                        board_id: task.board_id,
                        parent_id: task.id,
                        title: trimmed,
                        status: "todo",
                      });
                      setExpandedTask(true);
                    }
                  },
                ]}
                placeholder="Add a comment or sub-task..."
              />
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap self-center">{formattedLastModifiedDate}</span>
          </div>
        </div>





      </div>
      {/* Shared Input */}

      {/* Expanded Content */}
      {expandedTask && (
        <>


          {/* Updates Summary */}
          {getNotesForTask(task.id)?.length > 0 ? (
            getNotesForTask(task.id).map((note) => (
              <div key={note.id} className="mt-3 text-xs italic flex justify-between items-start gap-2">

                <MarkdownEditable
                  updateId={`${note.id}-note`}
                  value={note.content}
                  onSave={(newText) =>
                    upsertNote({ id: note.id, content: newText })
                  }
                />

                <DropdownMenu
                  items={[
                    {
                      label: "Delete",
                      icon: Trash2,
                      onClick: () => {
                        if (window.confirm("Delete this note?")) {
                          deleteNote(note.id);
                        }
                      },
                      style: "danger",
                    },
                  ]}
                />

              </div>
            )))
            : (
              <div className="text-xs italic text-gray-400 mt-2">
                No comments or updates yet.
              </div>
            )
          }




          {/* Subtasks */}
          {getSubtasks(task.id)?.length > 0 && (
            <div className="mt-2">
              <h4 className="text-sm font-semibold text-gray-600 mb-2">Subtasks</h4>
              {getSubtasks(task.id).map((sub) => (
                <div key={sub.id} className="ml-4 pl-2 border-gray-300 mt-2">
                  <TaskCard task={sub} depth={depth + 1} />
                </div>
              ))}
            </div>
          )}

          {/* Meta Info */}
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
            {task.assigned_to && (
              <span className="flex items-center gap-1">
                <User size={14} /> Waiting on {task.assigned_to}
              </span>
            )}
          </div>

        </>
      )}


    </div>
  );
}
