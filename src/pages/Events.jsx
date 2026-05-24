import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'

function EventCard({ event }) {
  const { isAuth } = useAuth()
  const navigate = useNavigate()

  const handleBook = () => {
    if (!isAuth) { navigate('/login'); return }
    navigate(`/events/${event.id}`)
  }

  return (
    <div className="card hover:shadow-md transition-shadow flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          event.tickets > 0
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        }`}>
          {event.tickets > 0 ? `${event.tickets} left` : 'Sold out'}
        </span>
      </div>

      <div className="space-y-1 text-sm text-gray-500">
        <p>{event.location}</p>
        <p>{event.date}</p>
      </div>

      <button
        onClick={handleBook}
        disabled={event.tickets === 0}
        className="btn-primary mt-auto text-sm"
      >
        {event.tickets > 0 ? 'Book Now' : 'Sold Out'}
      </button>
    </div>
  )
}

export default function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      let data
      if (search || location) {
        const res = await client.get('/events/search', { params: { q: search, location } })
        setEvents(res.data || [])
        setTotalPages(1)
      } else {
        const res = await client.get('/events', { params: { page, limit: 9 } })
        setEvents(res.data.data || [])
        setTotalPages(res.data.totalPages || 1)
      }
    } catch {
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [search, location, page])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upcoming Events</h1>
        <p className="text-gray-500">Discover and book events near you</p>
      </div>

      <div className="flex gap-3 mb-8">
        <input
          className="input flex-1"
          placeholder="Search events..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
        />
        <input
          className="input w-48"
          placeholder="Location"
          value={location}
          onChange={(e) => { setLocation(e.target.value); setPage(1) }}
        />
        {(search || location) && (
          <button
            onClick={() => { setSearch(''); setLocation(''); setPage(1) }}
            className="btn-secondary"
          >
            Clear
          </button>
        )}
      </div>

      {loading ? (
          <p className="text-center text-gray-400">Loading...</p>
      ) : events.length === 0 ? (
          <p className="text-center text-gray-400">No events found</p>
      ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
      )}

      {totalPages > 1 && !search && !location && (
        <div className="flex justify-center items-center gap-3 mt-10">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary text-sm py-1.5"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-secondary text-sm py-1.5"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
