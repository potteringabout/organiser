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
import { useTasks } from "@/organiser/store/useTasks";
import { useTask } from "@/organiser/store/useTask";

export default function TaskCard({ task, depth = 0 }) {
  const { updateTask } = useTasks();
  const [expandedTask, setExpandedTask] = useState(false);
  const { subtasks, tasknotes, loadChildren, upsertNote, upsertTask } = useTask(task.id);

  const [inputMode, setInputMode] = useState("note"); // "note" or "subtask"
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
          {task.description && (
            <div className="text-sm p-2 rounded mt-2">
              <div className="prose prose-sm max-w-none">
                <MarkdownEditable
                  updateId={`${task.id}-description`}
                  value={task.description}
                  onSave={(newText) =>
                    updateTask({ id: task.id, description: newText })
                  }
                />
              </div>
            </div>
          )}

          {/* Input Mode Toggle Buttons */}
          <div className="flex gap-2 mt-4 mb-1">
            <button
              onClick={() => setInputMode("note")}
              className={`p-2 rounded-full border ${inputMode === "note"
                  ? "bg-blue-500 text-white border-blue-500"
                  : "text-gray-500 border-gray-300 hover:bg-gray-100"
                }`}
              title="Add a note"
            >
              <MessageSquare size={16} />
            </button>
            <button
              onClick={() => setInputMode("subtask")}
              className={`p-2 rounded-full border ${inputMode === "subtask"
                  ? "bg-blue-500 text-white border-blue-500"
                  : "text-gray-500 border-gray-300 hover:bg-gray-100"
                }`}
              title="Add a sub-task"
            >
              <ListTodo size={16} />
            </button>
          </div>

          {/* Shared Input */}
          <MarkdownEditable
            updateId={`${task.id}-shared-input`}
            value={sharedInputText}
            onSave={(val) => {
              const trimmed = val.trim();
              if (!trimmed) return;

              if (inputMode === "note") {
                upsertNote({
                  task_id: task.id,
                  board_id: task.board_id,
                  content: trimmed,
                });
              } else {
                upsertTask({
                  board_id: task.board_id,
                  parent_id: task.id,
                  title: trimmed,
                  status: "todo",
                });
              }

              setSharedInputText("");
            }}
            onChange={setSharedInputText}
            placeholder={
              inputMode === "note"
                ? "Add a comment..."
                : "Add a sub-task..."
            }
          />

          {/* Subtasks */}
          {subtasks?.length > 0 &&
            subtasks.map((sub) => (
              <div key={sub.id} className="ml-4 pl-2 border-l border-gray-300 mt-2">
                <TaskCard task={sub} depth={depth + 1} />
              </div>
            ))}

          {/* Meta Info */}
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
            {task.assigned_to && (
              <span className="flex items-center gap-1">
                <User size={14} /> Waiting on {task.assigned_to}
              </span>
            )}
          </div>

          {/* Updates Summary */}
          {tasknotes?.length > 0 && 
            tasknotes.map((note) => (
            <div key={note.id} className="mt-3 text-xs italic">
              {note.content}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
