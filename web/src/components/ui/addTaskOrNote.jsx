/* eslint-disable react/prop-types */
import {
  ListTodo,
  MessageSquare
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { MarkdownEditable } from "@/components/ui/markDownDisplay";
import { useTasks } from "@/organiser/store/useTasks";
import { useTask } from "@/organiser/store/useTask";
import { useNotes } from "@/organiser/store/useNotes";

export default function AddTaskOrNote({ task = null }) {
  const { subtasks, tasknotes, loadChildren, upsertNote, upsertTask } = useTask(task.id);

  const location = useLocation();
  const [sharedInputText, setSharedInputText] = useState("");

  return (
    
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
  );
}
