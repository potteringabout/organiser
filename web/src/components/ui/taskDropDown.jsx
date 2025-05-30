import { useState } from 'react'
import { useTasks } from '@/organiser/store/useTasks'
import { Plus, CalendarPlus } from 'lucide-react'

export function TaskDropdown({ boardId, onSelect, displayOnly, selectedTaskId }) {
  const { tasks, upsertTask } = useTasks(boardId)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [isDropdownVisible, setIsDropdownVisible] = useState(false)

  if (displayOnly && !isDropdownVisible) {
    const selectedTask = tasks.find(m => m.id === selectedTaskId)
    return (
      <div
        className="text-sm font-medium cursor-pointer text-blue-700 hover:underline"
        onClick={() => setIsDropdownVisible(true)}
      >
        {selectedTask ? `📅 ${selectedTask.title}` : 'None'}
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
            📅 {m.title} ({m.date})
          </option>
        ))}
      </select>
  }

      <button
        className="flex items-center text-blue-600 hover:underline text-sm mb-1"
        onClick={() => setShowInput(true)}
      >
        <Plus size={12} className="mr-1" /> Create new task
      </button>

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