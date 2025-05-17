/* eslint-disable react/prop-types */
import {
  Clock,
  User,
  AlarmClock,
  ChevronDown,
  ChevronRight,
  ListTodo,
  MessageSquare
} from "lucide-react";
import StatusDropdown from "./statusDropdown";
import { format, parseISO, isBefore } from "date-fns";
import { useState } from "react";
import { MarkdownEditable } from "@/components/ui/markDownDisplay";
import SnoozeButton from "@/components/ui/snooze";
import DropdownMenu from "@/components/ui/ellipseDropDown";
import { useTasks } from "@/organiser/store/useTasks";
import { useTask } from "@/organiser/store/useTask";
import { useNotes } from "@/organiser/store/useNotes";

export default function TaskCard({ task, depth = 0 }) {
  const { updateTask, deleteTask } = useTasks();
  const { deleteNote } = useNotes();
  const [expandedTask, setExpandedTask] = useState(false);
  const { subtasks, tasknotes, loadChildren, upsertNote, upsertTask } = useTask(task.id);

  const [sharedInputText, setSharedInputText] = useState("");

  const isSnoozed =
    task.snoozed_until && isBefore(new Date(), parseISO(task.snoozed_until));

  const statusColor =
    {
      todo: "bg-gray-300 text-gray-800",
      in_progress: "bg-yellow-50 text-yellow-900",
      done: "bg-green-50 text-green-800",
      blocked: "bg-red-100 text-red-800",
      cancelled: "bg-red-50 text-red-700",
      ignored: "bg-gray-100 text-gray-400",
      snoozed: "bg-blue-50 text-blue-800",
    }[task.status] || "bg-gray-200 text-gray-700";

  return (
    <div
      className={`rounded-2xl shadow p-2 mb-2 border hover:shadow-md transition ${statusColor}`}
    >
      {/* Header Row */}
      <div className="flex justify-between items-center gap-2">
        <div className="flex-grow overflow-hidden">
          <div className="prose prose-sm max-w-none">
            <MarkdownEditable
              updateId={task.id}
              value={task.title}
              showToolbar={false}
              onSave={(newText) => updateTask({ id: task.id, title: newText })}
            />
          </div>
        </div>



        <div className="flex items-center gap-2 shrink-0">
          <DropdownMenu onDelete={() => {
            // Optional: confirm first
            if (window.confirm("Are you sure you want to delete this task?")) {
              deleteTask(task.id); // Add this hook if not already available
              //deleteTask(task.id); // Add this hook if not already available
              console.log("Deleted task", task.id);
            }
          }} />

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
            onChange={(newStatus) => updateTask({ id: task.id, status: newStatus })}
          />

          <SnoozeButton
            initialDate={task.snoozed_until ? new Date(task.snoozed_until) : undefined}
            onSnooze={(date) =>
              updateTask({ id: task.id, snoozed_until: date.toISOString() })
            }
          />

          <button
            onClick={() => {
              if (!expandedTask) loadChildren();
              setExpandedTask((prev) => !prev);
            }}
            className="text-gray-600 hover:text-gray-800 transition"
            title={expandedTask ? "Collapse" : "Expand"}
          >
            {expandedTask ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {expandedTask && (
        <>
          {/* Shared Input */}
          <MarkdownEditable
            updateId="new-task-input"
            value={sharedInputText}
            onSave={() => { }} // fallback no-op
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

                }
              },
            ]}
            placeholder="Add a comment or sub-task..."
          />

          {/* Updates Summary */}
          {tasknotes?.length > 0 &&
            tasknotes.map((note) => (
               <div key={note.id} className="mt-3 text-xs italic flex justify-between items-start gap-2">

                <MarkdownEditable
                  updateId={`${note.id}-note`}
                  value={note.content}
                  onSave={(newText) =>
                    upsertNote({ id: note.id, content: newText })
                  }
                />

                <DropdownMenu
                  onDelete={() => {
                    if (window.confirm("Delete this note?")) {
                      deleteNote(note.id); 
                    }
                  }}
                />

              </div>
            ))}




          {/* Subtasks */}
          {subtasks?.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-600 mb-2">Subtasks</h4>
              {subtasks.map((sub) => (
                <div key={sub.id} className="ml-4 pl-2 border-l border-gray-300 mt-2">
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
