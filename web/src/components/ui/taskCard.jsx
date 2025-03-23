import {
  Clock,
  User,
  CheckCircle2,
  Pencil,
  AlarmClock,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import StatusDropdown from "./statusDropdown";
import { format, parseISO, isBefore } from "date-fns";
import { useState } from "react";
import useOrganiserStore from "@/organiser/store/organiserStore";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function TaskCard({ task }) {
  const [expanded, setExpanded] = useState(false);

  const updateTask = useOrganiserStore((s) => s.updateTask);

  const isSnoozed =
    task.snoozedUntil && isBefore(new Date(), parseISO(task.snoozedUntil));

  const [newUpdate, setNewUpdate] = useState("");

  function handleAddUpdate() {
    if (!newUpdate.trim()) return;

    const update = {
      id: crypto.randomUUID(),
      text: newUpdate.trim(),
      timestamp: new Date().toISOString(),
    };

    console.log("Adding update:", update);

    updateTask(task.ID, {
      updates: [...(task.updates || []), update],
    });

    setNewUpdate(""); // Clear input
  }

  const statusColor =
    {
      todo: "bg-gray-300 text-gray-800",
      in_progress: "bg-yellow-50 text-yellow-900",
      done: "bg-green-300 text-green-800",
      blocked: "bg-red-300 text-red-800",
      snoozed: "bg-blue-200 text-blue-800",
    }[task.status] || "bg-gray-200 text-gray-700";

  return (
    <div
      className={`bg-white rounded-2xl shadow p-2 mb-2 border hover:shadow-md transition ${statusColor}`}>
      {/* Header Row */}
      <div className="flex justify-between items-center">
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-xl font-bold mb-2">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-lg font-semibold mb-1">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-base font-medium">{children}</h3>
              ),
            }}>
            {task.title}
          </ReactMarkdown>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-600 hover:text-gray-800 transition"
          title={expanded ? "Collapse" : "Expand"}>
          {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Details (conditionally rendered) */}
      {expanded && (
        <>
          {task.updates.map((u) => (
            <div
              key={u.id}
              className="text-sm bg-gray-50 p-2 rounded mt-2">
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-xl font-bold mb-2">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-lg font-semibold mb-1">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-base font-medium">{children}</h3>
                    ),
                  }}>
                  {u.text}
                </ReactMarkdown>
              </div>
              <div className="text-xs text-gray-500 mt-1 flex gap-4">
                {u.status && <span>Status: {u.status}</span>}
                {u.assignee && <span>Assigned to: {u.assignee}</span>}
              </div>
            </div>
          ))}

          <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
            {task.dueDate && (
              <span className="flex items-center gap-1">
                <Clock size={14} /> Due{" "}
                {format(parseISO(task.dueDate), "dd MMM")}
              </span>
            )}
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
          <div className="mt-2 flex gap-2 items-center">
            <textarea
              rows={3}
              placeholder="Add an update (Markdown supported)"
              value={newUpdate}
              onChange={(e) => setNewUpdate(e.target.value)}
              onKeyDown={(e) => {
                if (e.metaKey && e.key === "Enter" && newUpdate.trim()) {
                  handleAddUpdate();
                }
              }}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm font-mono"
            />
            <div className="text-xs text-gray-400 italic mt-1">
              Press ⌘+Enter to submit (Markdown supported)
            </div>
            <button
              onClick={handleAddUpdate}
              disabled={!newUpdate.trim()}
              className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50">
              Add
            </button>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="mt-2 flex justify-end gap-2 items-center text-sm">
        <StatusDropdown
          currentStatus={task.status}
          onChange={(newStatus) => {
            console.log("New status:", newStatus);
            updateTask(task.ID, { status: newStatus });
          }}
        />
        <button
          onClick={() => {
            // open edit modal
          }}
          className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
          <Pencil size={16} />
        </button>
      </div>
    </div>
  );
}
