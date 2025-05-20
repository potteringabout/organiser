import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useTasks } from "@/organiser/store/useTasks"
import { Plus } from "lucide-react"

export default function NewTaskForm() {
  const { boardId } = useParams();
  const [title, setTitle] = useState("")
  const [dueDate, setDueDate] = useState("")
  const { upsertTask } = useTasks()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (title.trim()) {
      upsertTask({ title, due_date: dueDate || null, board_id: boardId })
      setTitle("")
      setDueDate("")
      navigate(-1) // or navigate("/organiser/board/[boardId]") if needed
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-4 border rounded-xl">
      <label className="font-semibold">New Task</label>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title"
        className="p-2 border rounded"
      />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="p-2 border rounded"
      />
      <button
        type="submit"
        className="flex items-center gap-2 self-start px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
      >
        <Plus size={16} /> Add Task
      </button>
    </form>
  )
}