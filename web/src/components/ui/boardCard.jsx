import { useState } from "react";
import { MarkdownEditable } from "@/components/ui/markDownDisplay";
import { useBoards } from "@/organiser/store/useBoards";
import { format } from "date-fns";
import { Globe, Lock } from "lucide-react";

export default function BoardCard({ board }) {
  const { updateBoard } = useBoards();
  const [editing, setEditing] = useState(false);

  const visibilityIcon = {
    public: <Globe size={14} />,
    private: <Lock size={14} />,
    shared: <span className="text-xs font-semibold">🔗</span>,
  }[board.visibility];

  return (
    <div className="rounded-2xl border shadow p-4 mb-4 hover:shadow-md transition">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div className="text-lg font-semibold flex gap-2 items-center">
          {visibilityIcon}
          <MarkdownEditable
            updateId={`board-title-${board.id}`}
            value={board.title}
            showToolbar={false}
            onSave={(newText) =>
              updateBoard({ id: board.id, title: newText })
            }
          />
        </div>
        <span className="text-xs text-gray-500">
          Created {format(new Date(board.created_at), "dd MMM yyyy")}
        </span>
      </div>

      {/* Description */}
      <div className="mt-2 prose prose-sm max-w-none text-sm">
        <MarkdownEditable
          updateId={`board-desc-${board.id}`}
          value={board.description || "_No description yet_"}
          onSave={(newText) =>
            updateBoard({ id: board.id, description: newText })
          }
        />
      </div>
    </div>
  );
}
