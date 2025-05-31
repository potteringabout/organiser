import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTasks } from '@/organiser/store/useTasks'
import { Plus, ChevronDown, X } from 'lucide-react'

export function TaskDropdown({ boardId, onSelect, displayOnly, selectedTaskId }) {
  const { tasks, upsertTask } = useTasks(boardId)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [isDropdownVisible, setIsDropdownVisible] = useState(false)

  if (displayOnly && !isDropdownVisible) {
    const selectedTask = tasks.find(m => m.id === Number(selectedTaskId))
    return (
      <div className="flex items-center gap-1 text-sm font-medium">
        {selectedTask ? (
          <Link
              to={`/organiser/task/${selectedTask.id}`}
              title={selectedTask.title}
              className="text-gray-600 hover:text-gray-800 transition"
            >
            {selectedTask.title}
          </Link>

        ) : (
          <span className="text-blue-700">None</span>
        )}
        <ChevronDown
          size={16}
          className="cursor-pointer"
          onClick={() => setIsDropdownVisible(true)}
        />
      </div>
    )
  }

  const handleCreate = async () => {
    if (newTaskTitle.trim()) {
      const newTask = {
        title: newTaskTitle,
        board_id: boardId,
        date: new Date().toISOString().split('T')[0]
      }
      const task = await upsertTask(newTask)
      setNewTaskTitle('')
      setShowInput(false)
      console.log(task)
      onSelect(task.id)
      setIsDropdownVisible(false)
    }
  }

  return (
    <div className="border p-2 rounded w-full">
      <label className="block text-sm font-semibold mb-1">Select or create a Task</label>
      {!showInput && 
      <select
        className="w-full p-2 border rounded mb-2"
        onChange={e => {
          const val = e.target.value
          if (val !== '') {
            onSelect(val)
            setIsDropdownVisible(false)
          }
        }}
        defaultValue=""
      >
        <option value="" disabled>Select a Task</option>
        {tasks.map(m => (
          <option key={m.id} value={m.id}>
            📅 {m.title}
          </option>
        ))}
      </select>
  }

      <div className="flex justify-end gap-2 mt-2">
        <button
          onClick={() => setIsDropdownVisible(false)}
          className="p-2 rounded-full border text-red-500 border-red-300 hover:bg-red-100"
          title="Cancel"
        >
          <X size={16} />
        </button>

        <button
          onClick={() => setShowInput(true)}
          className="p-2 rounded-full border text-blue-500 border-blue-300 hover:bg-blue-100"
          title="Create new task"
        >
          <Plus size={16} />
        </button>
      </div>

      {showInput && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="flex-1 border p-1 rounded"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="New task title"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate()
            }}
          />
          <button
            className="bg-blue-500 text-white px-2 py-1 rounded"
            onClick={handleCreate}
          >
            Create
          </button>
        </div>
      )}
    </div>
  )
}