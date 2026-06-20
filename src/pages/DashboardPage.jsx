import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getRecommendedRides, getBookingStats } from '../services/dataService'
import { getGreeting, getFirstName, formatTime, formatPrice } from '../utils/helpers'
import './pages.css'

export default function DashboardPage() {
  const { profile } = useAuth()
  const [rides, setRides] = useState([])
  const [stats, setStats] = useState({ ridesBooked: 0, amountSpent: 0 })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([getRecommendedRides(), getBookingStats()])
      .then(([r, s]) => { setRides(r); setStats(s) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="v3-dashboard page-enter">

      {/* ═══ HERO SECTION ═══ */}
      <div className="v3-hero">
        
        {/* Top Layer: Search + Profile */}
        <div className="v3-hero-top-layer">
          <div style={{ width: '120px' }}></div> {/* Spacer to keep search centered */}
          
          <div className="v3-hero-center">
            <div className="v3-search" onClick={() => navigate('/search')}>
              <span className="material-icons v3-search-icon">search</span>
              <span className="v3-search-text">Search rides...</span>
              <button className="v3-search-filter">
                <span className="material-icons">tune</span>
              </button>
            </div>
          </div>

          <div className="v3-hero-right">
            <button className="v3-notify-btn" onClick={() => navigate('/alerts')}>
              <span className="material-icons">notifications_none</span>
              <span className="v3-notify-badge">2</span>
            </button>
            <div className="v3-hero-avatar" onClick={() => navigate('/profile')}>
              <img
                src={profile?.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'U')}&background=7C3AED&color=fff&size=40`}
                alt=""
              />
              <span className="material-icons" style={{fontSize:20, color:'#9CA3AF'}}>expand_more</span>
            </div>
          </div>
        </div>

        {/* Content Layer: Greeting */}
        <div className="v3-hero-left" style={{ position: 'absolute', top: '120px', left: '32px' }}>
          <h1 className="v3-hero-greeting">
            {getGreeting()}, {getFirstName(profile?.full_name)}! 👋
          </h1>
          <p className="v3-hero-sub">Let's get you on the road</p>
        </div>

        {/* Hero Illustration */}
        <div className="v3-hero-illustration">
          <svg viewBox="0 0 1000 260" preserveAspectRatio="xMaxYMax slice" fill="none" xmlns="http://www.w3.org/2000/svg" className="v3-hero-svg">
            {/* City skyline background soft layers */}
            <path d="M500 260 L500 160 L520 160 L520 140 L550 140 L550 110 L580 110 L580 180 L610 180 L610 120 L640 120 L640 160 L680 160 L680 130 L720 130 L720 170 L750 170 L750 140 L780 140 L780 190 L820 190 L820 150 L860 150 L860 180 L900 180 L900 160 L930 160 L930 200 L970 200 L970 180 L1000 180 L1000 260 Z" fill="rgba(203, 213, 225, 0.2)" />
            <path d="M550 260 L550 180 L570 180 L570 150 L600 150 L600 130 L630 130 L630 190 L660 190 L660 140 L690 140 L690 180 L730 180 L730 160 L770 160 L770 200 L800 200 L800 170 L830 170 L830 220 L870 220 L870 190 L910 190 L910 210 L940 210 L940 180 L980 180 L980 210 L1000 210 L1000 260 Z" fill="rgba(148, 163, 184, 0.15)" />
            
            {/* Soft Mountains */}
            <path d="M400 260 Q 550 150 700 260 Z" fill="rgba(191, 219, 254, 0.3)" />
            <path d="M600 260 Q 800 120 1000 260 Z" fill="rgba(221, 214, 254, 0.4)" />
            
            {/* Clouds */}
            <path d="M420 80 Q 430 70 440 80 Q 450 70 460 80 Q 470 90 460 100 L420 100 Q 410 90 420 80 Z" fill="rgba(255, 255, 255, 0.6)" />
            <path d="M720 50 Q 735 35 750 50 Q 765 35 780 50 Q 795 65 780 80 L720 80 Q 705 65 720 50 Z" fill="rgba(255, 255, 255, 0.4)" />
            <path d="M880 110 Q 890 100 900 110 Q 910 100 920 110 Q 930 120 920 130 L880 130 Q 870 120 880 110 Z" fill="rgba(255, 255, 255, 0.5)" />

            {/* Sun */}
            <circle cx="580" cy="70" r="18" fill="#FBBF24" />
            <circle cx="580" cy="70" r="30" fill="rgba(251, 191, 36, 0.2)" />
            <circle cx="580" cy="70" r="45" fill="rgba(251, 191, 36, 0.1)" />

            {/* Route line */}
            <path d="M520 180 Q 600 140 680 160 T 840 100" stroke="url(#routeGrad)" strokeWidth="3" strokeDasharray="8 6" fill="none" className="v3-route-line"/>
            
            {/* Location pins */}
            <circle cx="520" cy="180" r="6" fill="#7C3AED" stroke="#FFF" strokeWidth="2" />
            
            <g transform="translate(826, 60)">
              <path d="M14 0 C6.268 0 0 6.268 0 14 C0 24.5 14 40 14 40 C14 40 28 24.5 28 14 C28 6.268 21.732 0 14 0 Z" fill="#EF4444"/>
              <circle cx="14" cy="14" r="5" fill="#FFF"/>
            </g>

            {/* Car (Large White EV) */}
            <g className="v3-car" transform="translate(680, 150) scale(1.3)">
              {/* Drop Shadow */}
              <ellipse cx="60" cy="35" rx="55" ry="8" fill="rgba(0,0,0,0.15)"/>
              
              {/* Car Body */}
              <path d="M10 25 L25 10 L75 10 L100 25 L105 35 L5 35 Z" fill="#FFFFFF"/>
              <path d="M5 35 L105 35 L100 45 L10 45 Z" fill="#F1F5F9"/>
              
              {/* Windows */}
              <path d="M30 12 L70 12 L85 24 L20 24 Z" fill="#1E293B"/>
              
              {/* Details */}
              <rect x="95" y="28" width="6" height="4" rx="1" fill="#FCD34D"/>
              <rect x="10" y="28" width="8" height="4" rx="1" fill="#EF4444"/>
              <path d="M35 12 L35 24" stroke="#334155" strokeWidth="2"/>
              <path d="M65 12 L65 24" stroke="#334155" strokeWidth="2"/>
              
              {/* Wheels */}
              <circle cx="25" cy="40" r="10" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2"/>
              <circle cx="85" cy="40" r="10" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2"/>
              <circle cx="25" cy="40" r="4" fill="#64748B"/>
              <circle cx="85" cy="40" r="4" fill="#64748B"/>
            </g>

            <defs>
              <linearGradient id="routeGrad" x1="520" y1="180" x2="840" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FBBF24"/>
                <stop offset="1" stopColor="#3B82F6"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* ═══ STATS + QUICK OVERVIEW ROW ═══ */}
      <div className="v3-stats-row">
        <div className="v3-stat-cards">
          <StatCard
            icon="confirmation_number"
            label="Rides Booked"
            value={stats.ridesBooked || 3}
            sub="Total rides"
            tint="purple"
          />
          <StatCard
            icon="star"
            label="Rating"
            value={profile?.rating > 0 ? Number(profile.rating).toFixed(1) : '—'}
            sub="Your rating"
            tint="amber"
          />
          <StatCard
            icon="account_balance_wallet"
            label="Total Spent"
            value={formatPrice(stats.amountSpent || 6600)}
            sub="Across all rides"
            tint="green"
          />
        </div>

        {/* Quick Overview Panel */}
        <div className="v3-quick-overview">
          <div className="v3-qo-header">
            <h3>Quick Overview</h3>
            <button className="v3-qo-menu"><span className="material-icons">more_vert</span></button>
          </div>
          <div className="v3-qo-body">
            <QORow icon="confirmation_number" label="Rides Booked" value={String(stats.ridesBooked || 3)} color="#A78BFA" />
            <QORow icon="account_balance_wallet" label="Total Spent" value={formatPrice(stats.amountSpent || 6600)} color="#34D399" />
            <QORow icon="event_upcoming" label="Upcoming" value="0" color="#FB923C" />
          </div>
        </div>
      </div>

      {/* ═══ ACTION CARDS ═══ */}
      <div className="v3-actions">
        <Link to="/create-ride" className="v3-action-card v3-action-purple">
          <div className="v3-action-illust">
            <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
              <rect x="15" y="30" width="60" height="24" rx="8" fill="rgba(255,255,255,1)" />
              <rect x="25" y="15" width="40" height="15" rx="6" fill="rgba(255,255,255,0.8)" />
              <circle cx="30" cy="55" r="8" fill="rgba(124,58,237,0.8)" stroke="white" strokeWidth="2" />
              <circle cx="60" cy="55" r="8" fill="rgba(124,58,237,0.8)" stroke="white" strokeWidth="2" />
              <path d="M80 45 Q 95 20 110 35" stroke="rgba(255,255,255,0.4)" strokeWidth="3" strokeDasharray="5 5" />
            </svg>
          </div>
          <div className="v3-action-text">
            <h3>Post a Ride</h3>
            <p>Share your ride and earn</p>
          </div>
          <div className="v3-action-arrow">
            <span className="material-icons">arrow_forward</span>
          </div>
        </Link>

        <Link to="/search" className="v3-action-card v3-action-blue">
          <div className="v3-action-illust">
            <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
              <rect x="10" y="10" width="100" height="60" rx="12" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
              <path d="M20 60 Q 50 20 80 50 T 100 30" stroke="rgba(255,255,255,0.5)" strokeWidth="3" fill="none" strokeDasharray="6 6" />
              <circle cx="50" cy="35" r="10" fill="rgba(239,68,68,0.8)" />
              <circle cx="50" cy="35" r="4" fill="white" />
              <circle cx="80" cy="50" r="8" fill="rgba(16,185,129,0.8)" />
              <circle cx="80" cy="50" r="3" fill="white" />
            </svg>
          </div>
          <div className="v3-action-text">
            <h3>Find a Ride</h3>
            <p>Search available rides near you</p>
          </div>
          <div className="v3-action-arrow">
            <span className="material-icons">arrow_forward</span>
          </div>
        </Link>
      </div>

      {/* ═══ BOTTOM ROW: RIDES + ACTIVITY ═══ */}
      <div className="v3-bottom-row">

        {/* Available Rides */}
        <div className="v3-rides-section">
          <div className="v3-section-header">
            <div className="v3-section-title">
              <div className="v3-title-badge"><span className="material-icons">directions_car</span></div>
              <h2>Available Rides</h2>
            </div>
            <Link to="/search" className="v3-view-all">View All</Link>
          </div>

          {loading ? (
            <div className="v3-loading-state">
              <div className="v3-shimmer" /><div className="v3-shimmer" /><div className="v3-shimmer" />
            </div>
          ) : rides.length === 0 ? (
            <div className="v3-empty-state">
              <div className="v3-empty-illustration">
                <img src="/assets/no_rides.png" alt="No rides available" className="v3-empty-image" />
              </div>
              <h3>No rides available</h3>
              <p>Be the first to post a ride!</p>
              <Link to="/create-ride" className="v3-cta-pill">
                Post a Ride Now
              </Link>
            </div>
          ) : (
            <div className="ride-list">
              {rides.slice(0, 5).map(r => (
                <RideCard key={r.id} ride={r} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="v3-activity-panel">
          <h3>Recent Activity</h3>
          <div className="v3-activity-list">
            {/* TODO: wire to real data */}
            <ActivityItem
              icon="add_circle"
              color="#8B5CF6"
              title="You haven't posted any rides yet"
              sub="Start by posting a ride"
            />
            <ActivityItem
              icon="notifications"
              color="#F59E0B"
              title="No new notifications"
              sub="You're all caught up"
            />
            <ActivityItem
              icon="directions_car"
              color="#3B82F6"
              title="No upcoming rides"
              sub="Find or post a ride"
              isLast={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Sub-components ── */

function StatCard({ icon, label, value, sub, tint }) {
  const colors = {
    purple: { bg: 'rgba(109,74,255,0.1)', icon: '#6D4AFF', spark: '#6D4AFF' },
    amber:  { bg: 'rgba(251,191,36,0.1)', icon: '#FBBF24', spark: '#FBBF24' },
    green:  { bg: 'rgba(16,185,129,0.1)', icon: '#10B981', spark: '#10B981' },
  }
  const c = colors[tint] || colors.purple

  return (
    <div className="v3-stat-card">
      <div className="v3-stat-content">
        <div className="v3-stat-icon" style={{ background: c.bg, color: c.icon }}>
          <span className="material-icons">{icon}</span>
        </div>
        <div className="v3-stat-info">
          <div className="v3-stat-label">{label}</div>
          <div className="v3-stat-value">{value}</div>
          <div className="v3-stat-sub">{sub}</div>
        </div>
      </div>
      <svg className="v3-sparkline" preserveAspectRatio="none" viewBox="0 0 100 40" fill="none">
        <path d="M0 30 Q 25 10 50 20 T 100 15 L100 40 L0 40 Z" fill={`url(#fill-${tint})`} opacity="0.3" />
        <path d="M0 30 Q 25 10 50 20 T 100 15" stroke={c.spark} strokeWidth="2" strokeLinecap="round" />
        <defs>
          <linearGradient id={`fill-${tint}`} x1="0" y1="0" x2="0" y2="40" gradientUnits="userSpaceOnUse">
             <stop stopColor={c.spark} stopOpacity="1"/>
             <stop offset="1" stopColor={c.spark} stopOpacity="0"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

function QORow({ icon, label, value, color }) {
  return (
    <div className="v3-qo-row">
      <div className="v3-qo-icon" style={{ color }}><span className="material-icons">{icon}</span></div>
      <div className="v3-qo-info">
        <span className="v3-qo-label">{label}</span>
        <span className="v3-qo-value">{value}</span>
      </div>
      <svg width="80" height="24" viewBox="0 0 80 24" fill="none" className="v3-qo-spark">
        <path d="M0 18 Q 20 6 40 14 T 80 8" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  )
}

function ActivityItem({ icon, color, title, sub, isLast }) {
  return (
    <div className="v3-activity-item">
      {!isLast && <div className="v3-activity-line"></div>}
      <div className="v3-activity-icon" style={{ background: color }}>
        <span className="material-icons" style={{ color: '#FFF', fontSize: 20 }}>{icon}</span>
      </div>
      <div className="v3-activity-text">
        <h4>{title}</h4>
        <p>{sub}</p>
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
            <span className="material-icons" style={{ color: 'var(--text-muted)', fontSize: 20 }}>person</span>
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
            <span className="material-icons" style={{ fontSize: 11 }}>star</span>
            {Number(d.rating).toFixed(1)}
          </div>
        )}
        {ride.is_women_only && (
          <span className="badge badge-pink" style={{ marginLeft: d.rating > 0 ? 4 : 'auto' }}>♀ Women Only</span>
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
        <div className="rcard-meta" style={{ marginTop: 10 }}>
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
          <span className="material-icons" style={{ fontSize: 14 }}>chevron_right</span>
        </span>
      </div>
    </Link>
  )
}
