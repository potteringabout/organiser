import {
  Clock,
  User,
  AlarmClock,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import StatusDropdown from "./statusDropdown";
import { format, parseISO, isBefore } from "date-fns";
import { useState } from "react";
import useOrganiserStore from "@/organiser/store/organiserStore";
import { MarkdownEditable } from "@/components/ui/markDownDisplay";
import SnoozeButton from "@/components/ui/snooze";

export default function TaskCard({ task }) {
  const [expanded, setExpanded] = useState(false);

  const updateTask = useOrganiserStore((s) => s.updateTask);

  const isSnoozed =
    task.snoozedUntil && isBefore(new Date(), parseISO(task.snoozedUntil));

  const [newUpdate, setNewUpdate] = useState("");

  function updateUpdate(id, newText) {
    console.log("Updating update:", id, newText);
    updateTask(task.ID, {
      updates: task.updates.map((u) =>
        u.id === id ? { ...u, text: newText } : u
      ),
    });
  }

  /*function addUpdate() {
    console.log("Adding new update:", newUpdate);
    if (!newUpdate.trim()) return;

    const update = {
      id: crypto.randomUUID(),
      text: newUpdate.trim(),
      createdAt: new Date().toISOString(),
    };

    console.log("Adding update:", update);

    updateTask(task.ID, {
      updates: [...(task.updates || []), update],
    });
  }*/

  function addUpdate(x) {
    console.log("Adding new update:", x);
    if (!x.trim()) return;

    const update = {
      id: crypto.randomUUID(),
      text: x.trim(),
      createdAt: new Date().toISOString(),
    };

    console.log("Adding update:", update);

    updateTask(task.ID, {
      updates: [...(task.updates || []), update],
    });
    //newUpdate = ""; // Clear input

    setNewUpdate(""); // Clear input
  }

  const statusColor =
    {
      todo: "bg-gray-300 text-gray-800",
      in_progress: "bg-yellow-50 text-yellow-900",
      done: "bg-green-50 text-green-800",
      blocked: "bg-red-100 text-red-800",
      snoozed: "bg-blue-50 text-blue-800",
    }[task.status] || "bg-gray-200 text-gray-700";

  return (
    <div
      className={`rounded-2xl shadow p-2 mb-2 border hover:shadow-md transition ${statusColor}`}>
      {/* Header Row */}
      <div className="flex justify-between items-center gap-2">
        {/* Title (Markdown) — takes up available space */}
        <div className="flex-grow overflow-hidden">
          <div className="prose prose-sm max-w-none">
            <MarkdownEditable
              updateId={task.ID}
              value={task.title}
              showToolbar={false}
              onSave={(newText) => {
                updateTask(task.ID, { title: newText });
              }}
            />
          </div>
        </div>

        {/* Actions — shrink to content */}
        <div className="flex items-center gap-2 shrink-0">
          {task.isSnoozed && (
            <span className="flex items-center gap-1 text-xs">
              {task.snoozedUntil}
            </span>
          )}

          {task.dueDate && (
            <span className="flex items-center gap-1 text-xs">
              <Clock size={12} /> Due {format(parseISO(task.dueDate), "dd MMM")}
            </span>
          )}

          <StatusDropdown
            currentStatus={task.status}
            onChange={(newStatus) => {
              console.log("New status:", newStatus);
              updateTask(task.ID, { status: newStatus });
            }}
          />
          <SnoozeButton
            initialDate={
              task.snoozedUntil ? new Date(task.snoozedUntil) : undefined
            }
            onSnooze={(date) => {
              updateTask(task.ID, { snoozedUntil: date.toISOString() });
            }}
          />
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-600 hover:text-gray-800 transition"
            title={expanded ? "Collapse" : "Expand"}>
            {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
      </div>

      {/* Details (conditionally rendered) */}
      {expanded && (
        <>
          {task.description && (
            <div className="text-sm p-2 rounded mt-2">
              <div className="prose prose-sm max-w-none">
                <MarkdownEditable
                  updateId={`{${task.ID}description`}
                  value={task.description}
                  onSave={(newText) => {
                    updateTask(task.ID, { description: newText });
                  }}
                />
              </div>
            </div>
          )}
          {task.updates.map((u) => (
            <div
              key={u.id}
              className="text-sm p-2 rounded mt-2 flex justify-between items-start gap-4">
              <div className="prose prose-sm max-w-none flex-1">
                <MarkdownEditable
                  key={u.id}
                  updateId={u.id}
                  value={u.text}
                  onSave={(newText) => {
                    updateUpdate(u.id, newText);
                  }}
                />
              </div>
              <div className="text-xs text-gray-500 whitespace-nowrap space-y-1">
                {u.status && <span>Status: {u.status}</span>}
                {u.assignee && <span>Assigned to: {u.assignee}</span>}
                {u.createdAt && <span>Created: {format(parseISO(u.createdAt), "dd MMM YYY")}</span>}
              </div>
            </div>
          ))}

          <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
            {task.waitingOn && (
              <span className="flex items-center gap-1">
                <User size={14} /> Waiting on {task.waitingOn}
              </span>
            )}
            {isSnoozed && (
              <span className="flex items-center gap-1 text-blue-600">
                <AlarmClock size={14} /> Snoozed until{" "}
                {format(parseISO(task.snoozedUntil), "dd MMM")}
              </span>
            )}
          </div>

          {task.updates?.length > 0 && (
            <div className="mt-3 text-xs text-gray-400 italic">
              {task.updates.length} update{task.updates.length !== 1 && "s"}
            </div>
          )}

          {/* 💬 Add new update field */}
          <div className="w-full">
            <MarkdownEditable
              updateId={`${task.ID}-new`}
              value={newUpdate}
              onSave={(newText) => {
                addUpdate(newText);
                setNewUpdate("");
              }}
            />
          </div>
        </>
      )}

      {/* Footer */}
      <div className="mt-2 flex justify-end gap-2 items-center text-sm"></div>
    </div>
  );
}
