import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'

const emptyForm = { name: '', location: '', date: '', tickets: '' }

export default function AdminPanel() {
  const { user } = useAuth()
  const navigate  = useNavigate()

  const [events,   setEvents]   = useState([])
  const [form,     setForm]     = useState(emptyForm)
  const [editing,  setEditing]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')

  useEffect(() => {
    if (user?.role !== 'admin') navigate('/')
  }, [user, navigate])

  const load = () =>
    client.get('/events', { params: { limit: 100 } })
      .then(r => setEvents(r.data.data || []))
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload = { ...form, tickets: Number(form.tickets) }
      if (editing) {
        await client.put(`/events/${editing}`, payload)
      } else {
        await client.post('/events', payload)
      }
      setForm(emptyForm)
      setEditing(null)
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save event')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (event) => {
    setEditing(event.id)
    setForm({
      name:     event.name,
      location: event.location,
      date:     event.date,
      tickets:  String(event.tickets),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return
    await client.delete(`/events/${id}`)
    load()
  }

  const handleCancel = () => {
    setEditing(null)
    setForm(emptyForm)
    setError('')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-500 mt-1">Manage events</p>
        </div>
        <span className="bg-indigo-100 text-indigo-700 text-sm font-semibold px-3 py-1 rounded-full">
          Admin
        </span>
      </div>

      <div className="card mb-8">
        <h2 className="text-lg font-semibold mb-4">
          {editing ? 'Edit Event' : 'Create Event'}
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
            <input
              className="input"
              placeholder="Tech Conference 2025"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              className="input"
              placeholder="Almaty"
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              className="input"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tickets</label>
            <input
              type="number"
              className="input"
              placeholder="100"
              min="1"
              value={form.tickets}
              onChange={e => setForm({ ...form, tickets: e.target.value })}
              required
            />
          </div>

          <div className="sm:col-span-2 flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : editing ? 'Update Event' : 'Create Event'}
            </button>
            {editing && (
              <button type="button" onClick={handleCancel} className="btn-secondary">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">All Events ({events.length})</h2>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : events.length === 0 ? (
          <p className="text-gray-400 text-sm">No events yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Location</th>
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Tickets</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {events.map(ev => (
                  <tr key={ev.id} className={editing === ev.id ? 'bg-indigo-50' : ''}>
                    <td className="py-3 pr-4 font-medium">{ev.name}</td>
                    <td className="py-3 pr-4 text-gray-500">{ev.location}</td>
                    <td className="py-3 pr-4 text-gray-500">{ev.date}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        ev.tickets > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {ev.tickets}
                      </span>
                    </td>
                    <td className="py-3 flex gap-3">
                      <button
                        onClick={() => handleEdit(ev)}
                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(ev.id)}
                        className="text-red-500 hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
