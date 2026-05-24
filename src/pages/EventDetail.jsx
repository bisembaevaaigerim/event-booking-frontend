import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'

function StarRating({ value, onChange, readonly = false }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange?.(star)}
          className={`text-2xl transition-transform ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} ${
            star <= value ? 'text-yellow-400' : 'text-gray-300'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function ReviewSection({ eventId, currentUserId }) {
  const [reviews, setReviews]   = useState([])
  const [avgRating, setAvgRating] = useState(0)
  const [rating, setRating]     = useState(5)
  const [comment, setComment]   = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]       = useState('')

  const loadReviews = () =>
    client.get(`/events/${eventId}/reviews`).then(r => {
      setReviews(r.data.reviews || [])
      setAvgRating(r.data.average_rating || 0)
    })

  useEffect(() => { loadReviews() }, [eventId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await client.post('/reviews', { event_id: Number(eventId), rating, comment })
      setComment('')
      setRating(5)
      loadReviews()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this review?')) return
    await client.delete(`/reviews/${id}`)
    loadReviews()
  }

  return (
    <div className="card mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Reviews</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <StarRating value={Math.round(avgRating)} readonly />
            <span className="text-sm text-gray-500">
              {avgRating.toFixed(1)} / 5 ({reviews.length})
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border rounded-xl p-4 mb-6 bg-gray-50 space-y-3">
        <p className="text-sm font-medium text-gray-700">Leave a review</p>
        <StarRating value={rating} onChange={setRating} />
        <textarea
          className="input resize-none"
          rows={3}
          placeholder="Share your experience (optional)..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        <button type="submit" disabled={submitting} className="btn-primary text-sm">
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>

      {reviews.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">No reviews yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="flex gap-3 pb-4 border-b last:border-0">
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600 shrink-0">
                {r.user_id}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <StarRating value={r.rating} readonly />
                  {r.user_id === currentUserId && (
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      Delete
                    </button>
                  )}
                </div>
                {r.comment && (
                  <p className="text-sm text-gray-600 mt-1">{r.comment}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(r.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function EventDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [event, setEvent]     = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    client.get(`/events/${id}`)
      .then(r => setEvent(r.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  const handleBook = async () => {
    setError('')
    setBooking(true)
    try {
      await client.post('/bookings', { user_id: user.id, event_id: Number(id), quantity })
      setSuccess(true)
      setEvent(ev => ({ ...ev, tickets: ev.tickets - quantity }))
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed')
    } finally {
      setBooking(false)
    }
  }

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-400">Loading...</div>
  )
  if (!event) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <button onClick={() => navigate(-1)} className="text-indigo-600 hover:underline text-sm mb-6 flex items-center gap-1">
        ← Back to events
      </button>

      <div className="card mb-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.name}</h1>
        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-6">
          <div className="flex items-center gap-2">{event.location}</div>
          <div className="flex items-center gap-2">{event.date}</div>
          <div className="flex items-center gap-2">{event.tickets} tickets available</div>
        </div>

        <div className="border-t pt-5">
          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="font-semibold text-green-800">Booking confirmed!</p>
              <button onClick={() => navigate('/my-bookings')} className="btn-primary mt-3 text-sm">
                View My Bookings
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-800">Book Tickets</h2>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
              )}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Quantity</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-bold text-lg flex items-center justify-center">−</button>
                  <span className="w-8 text-center font-semibold text-lg">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(event.tickets, q + 1))}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-bold text-lg flex items-center justify-center">+</button>
                </div>
              </div>
              <button onClick={handleBook} disabled={booking || event.tickets === 0} className="btn-primary w-full">
                {booking ? 'Booking...' : event.tickets === 0 ? 'Sold Out' : `Book ${quantity} Ticket${quantity > 1 ? 's' : ''}`}
              </button>
            </div>
          )}
        </div>
      </div>

      <ReviewSection eventId={id} currentUserId={user?.id} />
    </div>
  )
}
