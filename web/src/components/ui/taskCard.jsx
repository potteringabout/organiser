import {
  Clock,
  User,
  AlarmClock,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import StatusDropdown from "./statusDropdown";
import { format, parseISO, isBefore } from "date-fns";
import { useState, useEffect, useRef } from "react";
import { MarkdownEditable } from "@/components/ui/markDownDisplay";
import SnoozeButton from "@/components/ui/snooze";
import { useTasks } from "@/organiser/store/useTasks";
import { useTask } from "@/organiser/store/useTask";
import { Plus } from "lucide-react";

export default function TaskCard({ task }) {
  const { updateTask } = useTasks();
  const [expandedTask, setExpandedTask] = useState(false);
  const { tasknotes, subtasks, loadChildren } = useTask(task.id);

  const [newSubtaskText, setNewSubtaskText] = useState("");
  const [newNoteText, setNewNoteText] = useState("");

  function addSubtask() {
    if (!newSubtaskText.trim()) return;
    updateTask({
      id: crypto.randomUUID(),
      board_id: task.board_id,
      parent_id: task.id,
      title: newSubtaskText.trim(),
      status: "todo",
    });
    setNewSubtaskText("");
  }

  function addNote() {
    if (!newNoteText.trim()) return;
    // assuming addNote takes a note object
    // e.g., { task_id, content, user_id }
    useTask(task.id).addNote({
      task_id: task.id,
      board_id: task.board_id,
      content: newNoteText.trim(),
    });
    setNewNoteText("");
  }

  const isSnoozed =
    task.snoozed_until &&
    isBefore(new Date(), parseISO(task.snoozed_until));

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
        {/* Title */}
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

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {task.snoozed_until && (
            <span className="flex items-center gap-1 text-xs text-blue-600">
              <AlarmClock size={12} /> Snoozed until{" "}
              {format(parseISO(task.snoozed_until), "dd MMM")}
            </span>
          )}

          {task.due_date && (
            <span className="flex items-center gap-1 text-xs">
              <Clock size={12} /> Due{" "}
              {format(parseISO(task.due_date), "dd MMM")}
            </span>
          )}

          <StatusDropdown
            currentStatus={task.status}
            onChange={(newStatus) => updateTask({ id: task.id, status: newStatus })}
          />

          <SnoozeButton
            initialDate={
              task.snoozed_until ? new Date(task.snoozed_until) : undefined
            }
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

          {/* Add Note Input */}
          <div className="mt-4">
            <MarkdownEditable
              updateId={`${task.id}-note`}
              value={newNoteText}
              onSave={(val) => {
                setNewNoteText(val);
                addNote();
              }}
              placeholder="Add a comment..."
            />
          </div>

          {/* Add Subtask Input */}
          <div className="flex items-center gap-2 mt-2">
            <input
              className="flex-1 rounded border px-2 py-1 text-sm"
              type="text"
              placeholder="Add sub-task..."
              value={newSubtaskText}
              onChange={(e) => setNewSubtaskText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSubtask()}
            />
            <button
              className="text-sm text-blue-600 hover:underline"
              onClick={addSubtask}
            >
              <Plus size={16} />
            </button>
          </div>
          {/* Subtasks */}
          {subtasks?.length > 0 &&
            subtasks.map((sub) => (
              <div
                key={sub.id}
                className="text-sm p-2 rounded mt-2 flex justify-between items-start gap-4 bg-gray-50"
              >
                <div className="prose prose-sm max-w-none flex-1">
                  <MarkdownEditable
                    updateId={sub.id}
                    value={sub.title}
                    onSave={(newText) =>
                      updateTask({ id: sub.id, title: newText })
                    }
                  />
                </div>
                <div className="text-xs text-gray-500 whitespace-nowrap space-y-1">
                  {sub.status && <div>Status: {sub.status}</div>}
                  {sub.assigned_to && <div>Assigned to: {sub.assigned_to}</div>}
                </div>
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
          {task.updates?.length > 0 && (
            <div className="mt-3 text-xs text-gray-400 italic">
              {task.updates.length} update{task.updates.length !== 1 && "s"}
            </div>
          )}

        </>
      )}
    </div>
  );
}
