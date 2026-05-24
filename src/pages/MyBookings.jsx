import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'

function BookingCard({ booking, onDelete }) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Cancel this booking?')) return
    setDeleting(true)
    try {
      await client.delete(`/bookings/${booking.id}`)
      onDelete(booking.id)
    } catch {
      alert('Failed to cancel booking')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="card flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div>
          <p className="font-semibold text-gray-900">Event #{booking.event_id}</p>
          <p className="text-sm text-gray-500">
            {booking.quantity} ticket{booking.quantity > 1 ? 's' : ''} •{' '}
            Booked on {new Date(booking.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors disabled:opacity-50"
      >
        {deleting ? 'Cancelling...' : 'Cancel'}
      </button>
    </div>
  )
}

export default function MyBookings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      client.get('/bookings/my'),
      client.get('/notifications').catch(() => ({ data: [] })),
    ])
      .then(([bRes, nRes]) => {
        setBookings(bRes.data || [])
        setNotifications(nRes.data || [])
      })
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = (id) => {
    setBookings(bs => bs.filter(b => b.id !== id))
  }

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-400">
      Loading your bookings...
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">My Bookings</h1>
        <p className="text-gray-500">Welcome back, <strong>{user?.username}</strong></p>
      </div>

      {notifications.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            Notifications
            <span className="bg-indigo-600 text-white text-xs rounded-full px-2 py-0.5">
              {notifications.filter(n => !n.read).length}
            </span>
          </h2>
          <div className="space-y-2">
            {notifications.map(n => (
              <div
                key={n.id}
                className={`rounded-lg px-4 py-3 text-sm border ${
                  n.read
                    ? 'bg-gray-50 border-gray-200 text-gray-500'
                    : 'bg-indigo-50 border-indigo-200 text-indigo-800'
                }`}
              >
                {n.message}
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold mb-3">Your Bookings ({bookings.length})</h2>
      {bookings.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">No bookings yet</p>
          <button onClick={() => navigate('/')} className="btn-primary mt-4 text-sm">
            Browse Events
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map(b => (
            <BookingCard key={b.id} booking={b} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
