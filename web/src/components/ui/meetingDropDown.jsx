import { useState } from 'react'
import { useMeetings } from '@/organiser/store/useMeetings'
import { Link } from 'react-router-dom'
import { Plus, ChevronDown, X } from 'lucide-react'


export function MeetingDropdown({ boardId, onSelect, displayOnly, selectedMeetingId }) {
  const { meetings, upsertMeeting } = useMeetings(boardId)
  const [newMeetingTitle, setNewMeetingTitle] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [isDropdownVisible, setIsDropdownVisible] = useState(false)

  if (displayOnly && !isDropdownVisible) {
    const selectedMeeting = meetings.find(m => m.id === selectedMeetingId)
    return (
      <div className="flex items-center gap-1 text-sm font-medium">
        {selectedMeeting ? (
          <Link
              to={`/organiser/meeting/${selectedMeeting.id}`}
              title={selectedMeeting.title}
              className="text-gray-600 hover:text-gray-800 transition"
            >
            {selectedMeeting.title}
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
    if (newMeetingTitle.trim()) {
      const newMeeting = {
        title: newMeetingTitle,
        board_id: boardId,
        date: new Date().toISOString().split('T')[0]
      }
      const meeting = await upsertMeeting(newMeeting)
      setNewMeetingTitle('')
      setShowInput(false)
      console.log(meeting)
      onSelect(meeting.id)
      setIsDropdownVisible(false)
    }
  }

  return (
    <div className="border p-2 rounded w-full">
      <label className="block text-sm font-semibold mb-1">Select or create a meeting</label>
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
        defaultValue={selectedMeetingId || ""}
      >
        <option value="" disabled>Select a meeting</option>
        {meetings.map(m => (
          <option key={m.id} value={m.id}>
            📅 {m.title} ({m.date})
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
          title="Create new meeting"
        >
          <Plus size={16} />
        </button>
      </div>

      {showInput && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="flex-1 border p-1 rounded"
            value={newMeetingTitle}
            onChange={(e) => setNewMeetingTitle(e.target.value)}
            placeholder="New meeting title"
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