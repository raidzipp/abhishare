import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getRecommendedRides, getBookingStats } from '../services/dataService'
import { getGreeting, getFirstName, formatTime, formatPrice } from '../utils/helpers'
import './pages.css'

export default function DashboardPage() {
  const { profile } = useAuth()
  const [rides, setRides] = useState([])
  const [stats, setStats] = useState({ ridesBooked: 0, amountSpent: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getRecommendedRides(), getBookingStats()])
      .then(([r, s]) => { setRides(r); setStats(s) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-enter">
      {/* Hero */}
      <div className="dash-hero animate-in">
        <div className="circle-deco-1" />
        <div className="circle-deco-2" />
        <div className="dash-greeting">{getGreeting()}, {getFirstName(profile?.full_name)}!</div>
        <div className="dash-sub">Ready for your next ride?</div>
        <div className="dash-stats">
          <div className="dash-stat">
            <span className="dash-stat-num">{stats.ridesBooked}</span>
            <span className="dash-stat-label">Rides</span>
          </div>
          <div className="dash-stat">
            <span className="dash-stat-num">{profile?.rating > 0 ? Number(profile.rating).toFixed(1) : '—'}</span>
            <span className="dash-stat-label">Rating</span>
          </div>
          <div className="dash-stat">
            <span className="dash-stat-num">{formatPrice(stats.amountSpent)}</span>
            <span className="dash-stat-label">Spent</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dash-actions animate-in animate-in-delay-1">
        <Link to="/create-ride" className="dash-action">
          <div className="dash-action-icon"><span className="material-icons">add_circle</span></div>
          <div className="dash-action-text">
            <h3>Post a Ride</h3>
            <p>Share your ride and earn</p>
          </div>
        </Link>
        <Link to="/search" className="dash-action">
          <div className="dash-action-icon"><span className="material-icons">search</span></div>
          <div className="dash-action-text">
            <h3>Find a Ride</h3>
            <p>Search available rides</p>
          </div>
        </Link>
      </div>

      {/* Recommended Rides */}
      <div className="animate-in animate-in-delay-2">
        <h2 className="section-title">
          {rides.length > 0 ? `🚗 Available Rides (${rides.length})` : '🚗 Available Rides'}
        </h2>

        {loading ? (
          <div style={{textAlign:'center', padding:40, color:'var(--text-muted)'}}>
            <div className="spinner spinner-brand" style={{width:28,height:28,margin:'0 auto 12px'}} />
            Loading rides…
          </div>
        ) : rides.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-emoji">🔍</div>
            <h3>No rides available</h3>
            <p>Be the first to post a ride!</p>
            <Link to="/create-ride" className="btn btn-brand" style={{display:'inline-flex'}}>Post a Ride</Link>
          </div>
        ) : (
          <div className="ride-list">
            {rides.slice(0, 10).map(r => (
              <RideCard key={r.id} ride={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function RideCard({ ride }) {
  const d = ride.driver || {}
  const dt = ride.departure_time

  return (
    <Link to={`/ride/${ride.id}`} className="rcard">
      <div className="rcard-top">
        <div className="rcard-avatar">
          {d.profile_photo_url ? (
            <img src={d.profile_photo_url} alt="" />
          ) : (
            <span className="material-icons" style={{color:'var(--text-muted)', fontSize:24}}>person</span>
          )}
        </div>
        <div>
          <div className="rcard-driver-name">{d.full_name || 'Driver'}</div>
          <div className="rcard-driver-meta">
            {ride.vehicle_model || 'Car'} · {ride.total_seats}-Seater
          </div>
        </div>
        {d.rating > 0 && (
          <div className="rcard-rating">
            <span className="material-icons" style={{fontSize:12}}>star</span>
            {Number(d.rating).toFixed(1)}
          </div>
        )}
        {ride.is_women_only && (
          <span className="badge badge-pink" style={{marginLeft:d.rating > 0 ? 4 : 'auto'}}>♀ Women Only</span>
        )}
      </div>

      <div className="rcard-route">
        <div className="rcard-route-line">
          <div className="rcard-dots">
            <div className="rcard-dot rcard-dot-g" />
            <div className="rcard-dot-line" />
            <div className="rcard-dot rcard-dot-r" />
          </div>
          <div className="rcard-cities">
            <div className="rcard-city">{ride.source}</div>
            <div className="rcard-city">{ride.destination}</div>
          </div>
        </div>
        <div className="rcard-meta" style={{marginTop:12}}>
          <span className="rcard-meta-item">
            <span className="material-icons">calendar_today</span>
            {formatTime(dt)}
          </span>
          <span className="rcard-meta-item">
            <span className="material-icons">event_seat</span>
            {ride.available_seats} left
          </span>
        </div>
      </div>

      <div className="rcard-bottom">
        <div>
          <span className="rcard-price">{formatPrice(ride.price_per_seat)}</span>
          <span className="rcard-price-label"> / seat</span>
        </div>
        <span className="rcard-view-btn">
          View Details
          <span className="material-icons" style={{fontSize:14}}>chevron_right</span>
        </span>
      </div>
    </Link>
  )
}
