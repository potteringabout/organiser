import { useState } from 'react'
import { Plus } from 'lucide-react'

export default function NewNote({ onCreate }) {
  const [content, setContent] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (content.trim()) {
      onCreate({ content })
      setContent('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-4 border rounded-xl">
      <label className="font-semibold">New Note</label>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="p-2 border rounded resize-none"
        placeholder="Write your note here..."
        rows={4}
      />
      <button
        type="submit"
        className="flex items-center gap-2 self-start px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        <Plus size={16} /> Add Note
      </button>
    </form>
  )
}