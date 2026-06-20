import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMyPostedRides, getMyBookings } from '../services/dataService'
import { formatTime, formatPrice, getRideStatusLabel } from '../utils/helpers'
import './pages.css'

export default function MyRidesPage() {
  const [tab, setTab] = useState('posted')
  const [posted, setPosted] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  async function loadData() {
    setLoading(true)
    const [p, b] = await Promise.all([getMyPostedRides(), getMyBookings()])
    setPosted(p); setBookings(b)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1 className="page-title">My Rides</h1>
      </div>

      <div className="myrides-tabs">
        <button className={`tab-btn ${tab === 'posted' ? 'active' : ''}`} onClick={() => setTab('posted')}>
          <span className="material-icons" style={{ fontSize: 16, marginRight: 4 }}>directions_car</span>
          Posted ({posted.length})
        </button>
        <button className={`tab-btn ${tab === 'bookings' ? 'active' : ''}`} onClick={() => setTab('bookings')}>
          <span className="material-icons" style={{ fontSize: 16, marginRight: 4 }}>confirmation_number</span>
          Bookings ({bookings.length})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
          <div className="spinner spinner-brand" style={{ width: 24, height: 24, margin: '0 auto 10px' }} />
          Loading…
        </div>
      ) : tab === 'posted' ? (
        posted.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-emoji">🚗</div>
            <h3>No rides posted yet</h3>
            <p>Post your first ride and start earning</p>
            <Link to="/create-ride" className="btn btn-brand" style={{ display: 'inline-flex' }}>Post a Ride</Link>
          </div>
        ) : (
          <div className="ride-list">
            {posted.map(r => <PostedCard key={r.id} ride={r} />)}
          </div>
        )
      ) : (
        bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-emoji">🎫</div>
            <h3>No bookings yet</h3>
            <p>Find a ride and book your seat</p>
            <Link to="/search" className="btn btn-brand" style={{ display: 'inline-flex' }}>Search Rides</Link>
          </div>
        ) : (
          <div className="ride-list">
            {bookings.map(b => <BookingCard key={b.id} booking={b} />)}
          </div>
        )
      )}
    </div>
  )
}

function PostedCard({ ride }) {
  const status = getRideStatusLabel(ride)
  const variantClass = `badge-${status.variant}`

  return (
    <Link to={`/ride/${ride.id}`} className="lcard">
      <div className="lcard-top">
        <span className="lcard-route">{ride.source} → {ride.destination}</span>
        <span className={`badge ${variantClass}`}>{status.label}</span>
      </div>
      <div className="lcard-meta">
        <span>
          <span className="material-icons" style={{ fontSize: 13, verticalAlign: -2, marginRight: 4 }}>calendar_today</span>
          {formatTime(ride.departure_time)}
        </span>
        <span>
          <span className="material-icons" style={{ fontSize: 13, verticalAlign: -2, marginRight: 4 }}>event_seat</span>
          {ride.available_seats}/{ride.total_seats} seats
        </span>
        <span>
          <span className="material-icons" style={{ fontSize: 13, verticalAlign: -2, marginRight: 4 }}>currency_rupee</span>
          {formatPrice(ride.price_per_seat)}/seat
        </span>
      </div>
    </Link>
  )
}

function BookingCard({ booking }) {
  const r = booking.ride || {}
  const ps = booking.payment_status || ''
  const isGreen = ps === 'paid' || ps === 'cash'

  return (
    <div className="lcard">
      <div className="lcard-top">
        <span className="lcard-route">{r.source || '…'} → {r.destination || '…'}</span>
        <span className={`badge ${isGreen ? 'badge-green' : 'badge-amber'}`}>
          {ps === 'cash' ? 'CASH' : ps.toUpperCase()}
        </span>
      </div>
      <div className="lcard-meta">
        {r.departure_time && (
          <span>
            <span className="material-icons" style={{ fontSize: 13, verticalAlign: -2, marginRight: 4 }}>calendar_today</span>
            {formatTime(r.departure_time)}
          </span>
        )}
        <span>
          {booking.seats_booked} seat{booking.seats_booked > 1 ? 's' : ''} · {formatPrice(booking.total_paid)}
        </span>
        <span>
          <span className="material-icons" style={{ fontSize: 13, verticalAlign: -2, marginRight: 4 }}>
            {booking.payment_method === 'cash' ? 'money' : 'account_balance'}
          </span>
          {booking.payment_method === 'cash' ? 'Cash' : 'UPI'}
        </span>
      </div>
    </div>
  )
}
