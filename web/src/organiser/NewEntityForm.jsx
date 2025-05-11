import { useState } from 'react'
import { Plus } from 'lucide-react'

export default function NewEntityForm({ onCreate }) {
  const [name, setName] = useState('')
  const [type, setType] = useState('person')
  const [email, setEmail] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!name.trim()) return

    onCreate({
      name: name.trim(),
      type,
      email: email.trim() || undefined,
      description: description.trim() || undefined
    })

    setName('')
    setType('person')
    setEmail('')
    setDescription('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4 border rounded-xl">
      <h2 className="text-lg font-semibold">New Entity</h2>

      <label className="flex flex-col">
        <span className="text-sm text-gray-600">Name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 border rounded"
          placeholder="e.g. Alice Carter or Design Team"
          required
        />
      </label>

      <label className="flex flex-col">
        <span className="text-sm text-gray-600">Type</span>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="person">Person</option>
          <option value="team">Team</option>
        </select>
      </label>

      <label className="flex flex-col">
        <span className="text-sm text-gray-600">Email (optional)</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 border rounded"
          placeholder="email@example.com"
        />
      </label>

      <label className="flex flex-col">
        <span className="text-sm text-gray-600">Description (optional)</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="p-2 border rounded resize-none"
          rows={2}
          placeholder="Team role or extra info"
        />
      </label>

      <button
        type="submit"
        className="flex items-center gap-2 self-start px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        <Plus size={16} /> Add Entity
      </button>
    </form>
  )
}