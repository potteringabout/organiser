import { useState } from "react";
import { useBoards } from "@/organiser/store/useBoards";
import { Plus } from "lucide-react";

export default function NewBoardForm() {
  const { createBoard } = useBoards();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  function handleCreate() {
    if (!title.trim()) return;
    createBoard({
      title: title.trim(),
      description: description.trim()
    });
    setTitle("");
    setDescription("");
  }

  return (
    <div className="border rounded-2xl p-4 shadow-sm mb-4 bg-gray-50">
      <div className="mb-2">
        <input
          type="text"
          className="w-full border px-2 py-1 rounded text-sm"
          placeholder="Board title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="mb-2">
        <textarea
          className="w-full border px-2 py-1 rounded text-sm"
          placeholder="Optional description"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <button
        className="flex items-center gap-1 text-blue-600 text-sm hover:underline"
        onClick={handleCreate}>
        <Plus size={14} /> Create Board
      </button>
    </div>
  );
}