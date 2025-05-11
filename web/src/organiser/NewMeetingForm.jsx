import { useState } from 'react'
import { Plus } from 'lucide-react'

const recurrenceOptions = ['none', 'daily', 'weekly', 'monthly']

export default function NewMeetingForm({ onCreate, people }) {
  const [title, setTitle] = useState('')
  const [datetime, setDatetime] = useState('')
  const [recurrence, setRecurrence] = useState('none')
  const [attendees, setAttendees] = useState([])

  const toggleAttendee = (person) => {
    setAttendees(prev =>
      prev.includes(person)
        ? prev.filter(a => a !== person)
        : [...prev, person]
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (title.trim() && datetime) {
      onCreate({ title, datetime, recurrence, attendees })
      setTitle('')
      setDatetime('')
      setRecurrence('none')
      setAttendees([])
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-4 border rounded-xl">
      <label className="font-semibold">New Meeting</label>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Meeting title"
        className="p-2 border rounded"
      />
      <input
        type="datetime-local"
        value={datetime}
        onChange={(e) => setDatetime(e.target.value)}
        className="p-2 border rounded"
      />
      <select
        value={recurrence}
        onChange={(e) => setRecurrence(e.target.value)}
        className="p-2 border rounded"
      >
        {recurrenceOptions.map(r => (
          <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
        ))}
      </select>
      <div className="flex flex-wrap gap-2 mt-2">
        {people.map(person => (
          <button
            key={person}
            type="button"
            onClick={() => toggleAttendee(person)}
            className={`px-2 py-1 border rounded ${attendees.includes(person) ? 'bg-blue-500 text-white' : 'bg-white'}`}
          >
            {person}
          </button>
        ))}
      </div>
      <button
        type="submit"
        className="flex items-center gap-2 self-start px-3 py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 mt-2"
      >
        <Plus size={16} /> Schedule Meeting
      </button>
    </form>
  )
}