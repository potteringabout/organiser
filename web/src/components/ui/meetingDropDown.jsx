import { useState } from 'react'
import { useMeetings } from '@/organiser/store/useMeetings'
import { Plus, CalendarPlus } from 'lucide-react'

export function MeetingDropdown({ boardId, onSelect, displayOnly, selectedMeetingId }) {
  const { meetings, upsertMeeting } = useMeetings(boardId)
  const [newMeetingTitle, setNewMeetingTitle] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [isDropdownVisible, setIsDropdownVisible] = useState(false)

  if (displayOnly && !isDropdownVisible) {
    const selectedMeeting = meetings.find(m => m.id === selectedMeetingId)
    return (
      <div
        className="text-sm font-medium cursor-pointer text-blue-700 hover:underline"
        onClick={() => setIsDropdownVisible(true)}
      >
        {selectedMeeting ? `📅 ${selectedMeeting.title}` : 'None'}
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

      <button
        className="flex items-center text-blue-600 hover:underline text-sm mb-1"
        onClick={() => setShowInput(true)}
      >
        <Plus size={12} className="mr-1" /> Create new meeting
      </button>

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