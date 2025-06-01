import { useState } from 'react'
import { useMeetings } from '@/organiser/store/useMeetings'
import { Link } from 'react-router-dom'
import { ChevronDown, X, Check } from 'lucide-react'

export function MeetingDropdown({ boardId, onSelect, displayOnly, selectedMeetingId }) {
  const { meetings, upsertMeeting } = useMeetings(boardId)
  const [inputValue, setInputValue] = useState('')
  const [isDropdownVisible, setIsDropdownVisible] = useState(!displayOnly)

  const selectedMeeting = meetings.find(m => m.id === selectedMeetingId)

  const handleSelectOrCreate = async () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return

    const existing = meetings.find(m => m.title.toLowerCase() === trimmed.toLowerCase())
    if (existing) {
      onSelect(existing)
    } else {
      const newMeeting = await upsertMeeting({
        title: trimmed,
        board_id: boardId,
        date: new Date().toISOString().split('T')[0]
      })
      onSelect(newMeeting)
      
    }
    setInputValue('')
    setIsDropdownVisible(false)
  }

  if (displayOnly && !isDropdownVisible) {
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
        <button onClick={() => setIsDropdownVisible(true)} className="ml-1">
          <ChevronDown size={16} className="cursor-pointer" />
        </button>
      </div>
    )
  }

  return (
    <div className="border p-2 rounded w-full">
      <label className="block text-sm font-semibold mb-1">Select or create a meeting</label>
      <input
        list="meeting-options"
        className="w-full p-2 border rounded mb-2"
        placeholder="Search or type to create..."
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') handleSelectOrCreate()
        }}
      />
      <datalist id="meeting-options">
        {meetings.map(m => (
          <option key={m.id} value={m.title} />
        ))}
      </datalist>

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