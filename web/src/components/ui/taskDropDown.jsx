/* eslint-disable react/prop-types */
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTasks } from '@/organiser/store/useTasks'
import { ChevronDown, X, Check } from 'lucide-react'

export function TaskDropdown({ boardId, onSelect, displayOnly, selectedTaskId }) {
  const { tasks, upsertTask } = useTasks(boardId)
  const [inputValue, setInputValue] = useState('')
  const [isDropdownVisible, setIsDropdownVisible] = useState(!displayOnly)

  const selectedTask = tasks.find(t => t.id === Number(selectedTaskId))

  const handleSelectOrCreate = async () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return

    const existing = tasks.find(t => t.title.toLowerCase() === trimmed.toLowerCase())
    if (existing) {
      onSelect(existing)
    } else {
      const newTask = await upsertTask({
        title: trimmed,
        board_id: boardId,
        date: new Date().toISOString().split('T')[0]
      })
      console.log("Here I am")
      console.log(newTask)
      onSelect(newTask)
    }
    setInputValue('')
    setIsDropdownVisible(false)
  }

  if (displayOnly && !isDropdownVisible) {
    return (
      <div className="flex items-center gap-1 text-sm font-medium">
        {selectedTask ? (
          <Link
            to={`/organiser/task/${selectedTask.id}`}
            title={selectedTask.title}
            className="text-gray-800 dark:text-gray-200"
          >
            {selectedTask.title}
          </Link>
        ) : (
          <span className="text-blue-700">None</span>
        )}
        <button onClick={() => setIsDropdownVisible(true)} className="ml-1">
          <ChevronDown size={16} className="cursor-pointer" />
        </button>
      </div>
    )
  }

  return (
    <div className="border p-2 rounded w-full">
      <label className="block text-sm font-semibold mb-1">Select or create a Task</label>
      <input
        className="w-full p-2 border rounded mb-2"
        placeholder="Search or type to create..."
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') handleSelectOrCreate()
        }}
      />
      <ul className="border rounded max-h-40 overflow-y-auto">
        {tasks
          .filter(t => t.title.toLowerCase().includes(inputValue.toLowerCase()))
          .map(t => (
            <li
              key={t.id}
              onClick={() => {
                onSelect(t)
                setInputValue('')
                setIsDropdownVisible(false)
              }}
              className={`px-2 py-1 cursor-pointer ${
                selectedTask?.id === t.id
                  ? 'bg-blue-100 dark:bg-blue-800'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {t.title}
            </li>
          ))}
      </ul>

      <div className="flex justify-end gap-2 mt-2">
        <button
          onClick={() => setIsDropdownVisible(false)}
          className="p-2 rounded-full border text-red-500 border-red-300 hover:bg-red-100"
          title="Cancel"
        >
          <X size={16} />
        </button>
        <button
          onClick={handleSelectOrCreate}
          className="p-2 rounded-full border text-green-600 border-green-300 hover:bg-green-100"
          title="Select or Create"
        >
          <Check size={16} />
        </button>
      </div>
    </div>
  )
}