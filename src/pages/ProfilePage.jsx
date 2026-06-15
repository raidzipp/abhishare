import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getUserCars, getBookingStats, logout } from '../services/dataService'
import { getInitial, calculateAge, formatPrice } from '../utils/helpers'
import { THEMES } from '../utils/constants'
import './pages.css'

export default function ProfilePage() {
  const { profile, user } = useAuth()
  const navigate = useNavigate()
  const [cars, setCars] = useState([])
  const [stats, setStats] = useState({ ridesBooked: 0, amountSpent: 0 })
  const [showThemes, setShowThemes] = useState(false)
  const currentTheme = localStorage.getItem('rz_theme') || 'indigo'

  useEffect(() => {
    getUserCars().then(setCars)
    getBookingStats().then(setStats)
  }, [])

  function handleTheme(key) {
    localStorage.setItem('rz_theme', key)
    document.documentElement.setAttribute('data-theme', key === 'indigo' ? '' : key)
    setShowThemes(false)
  }

  async function handleLogout() {
    try {
      await logout()
    } finally {
      navigate('/')
    }
  }

  const age = calculateAge(profile?.date_of_birth)

  return (
    <div className="page-enter">
      {/* Hero */}
      <div className="profile-hero animate-in">
        <div className="circle-deco-1" style={{ position: 'absolute', width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', top: -40, right: -40 }} />
        <div className="circle-deco-2" style={{ position: 'absolute', width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', bottom: -25, left: -20 }} />

        <div className="profile-avatar-wrap">
          {profile?.profile_photo_url ? (
            <img src={profile.profile_photo_url} alt="" />
          ) : (
            <span style={{ fontSize: 36, fontWeight: 900, color: 'white' }}>{getInitial(profile?.full_name)}</span>
          )}
        </div>
        <div className="profile-name">{profile?.full_name || 'User'}</div>
        <div className="profile-email">{user?.email}</div>
        <div className="profile-badges">
          {profile?.is_verified && <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>✓ Verified</span>}
          {profile?.rating > 0 && (
            <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
              ⭐ {Number(profile.rating).toFixed(1)}
            </span>
          )}
          <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
            🚗 {stats.ridesBooked} Rides
          </span>
        </div>

        <Link to="/profile/edit" className="btn" style={{ marginTop: 20, background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', display: 'inline-flex' }}>
          <span className="material-icons" style={{ fontSize: 16 }}>edit</span> Edit Profile
        </Link>
      </div>

      {/* Personal Info */}
      <div className="profile-section animate-in animate-in-delay-1">
        <div className="profile-section-title">Personal Information</div>
        <div className="profile-card">
          <ProfileItem icon="person" label="Full Name" value={profile?.full_name || '—'} />
          <ProfileItem icon="phone" label="Phone" value={profile?.phone_number || '—'} />
          <ProfileItem icon="email" label="Email" value={user?.email || '—'} />
          <ProfileItem icon="cake" label="Age" value={age ? `${age} years` : '—'} />
          <ProfileItem icon="wc" label="Gender" value={profile?.gender || '—'} />
        </div>
      </div>

      {/* My Vehicles */}
      <div className="profile-section animate-in animate-in-delay-2">
        <div className="profile-section-title">My Vehicles</div>
        <div className="profile-card">
          {cars.map(c => (
            <div key={c.id} className="profile-item">
              <div className="profile-item-icon">
                <span className="material-icons">{c.seater_type === 2 ? 'motorcycle' : 'directions_car'}</span>
              </div>
              <span className="profile-item-text">{c.make} {c.model}</span>
              <span className="profile-item-value">{c.plate_number} · {c.seater_type}-Seater</span>
            </div>
          ))}
          <Link to="/add-vehicle" className="profile-item" style={{ textDecoration: 'none' }}>
            <div className="profile-item-icon" style={{ background: 'var(--green-light)', color: 'var(--green)' }}>
              <span className="material-icons">add</span>
            </div>
            <span className="profile-item-text" style={{ color: 'var(--green-dark)' }}>Add New Vehicle</span>
            <span className="material-icons profile-item-arrow">chevron_right</span>
          </Link>
        </div>
      </div>

      {/* Theme Switcher */}
      <div className="profile-section animate-in animate-in-delay-3">
        <div className="profile-section-title">Appearance</div>
        <div className="profile-card">
          <div className="profile-item" onClick={() => setShowThemes(!showThemes)} style={{ cursor: 'pointer' }}>
            <div className="profile-item-icon">
              <span className="material-icons">palette</span>
            </div>
            <span className="profile-item-text">Theme</span>
            <span className="profile-item-value" style={{ textTransform: 'capitalize' }}>{currentTheme}</span>
            <span className="material-icons profile-item-arrow">{showThemes ? 'expand_less' : 'expand_more'}</span>
          </div>
          {showThemes && (
            <div style={{ padding: '8px 18px 14px' }}>
              <div style={{ display: 'flex', gap: 10 }}>
                {THEMES.map(t => (
                  <button key={t.key} onClick={() => handleTheme(t.key)}
                    style={{
                      flex: 1, padding: '14px 12px', borderRadius: 'var(--radius-md)',
                      border: currentTheme === t.key ? '2px solid var(--brand-1)' : '2px solid var(--border)',
                      background: currentTheme === t.key ? 'var(--brand-glow)' : 'var(--card-bg)',
                      cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
                    }}>
                    <div style={{
                      width: '100%', height: 6, borderRadius: 3, marginBottom: 8,
                      background: `linear-gradient(90deg, ${t.colors[0]}, ${t.colors[1]}, ${t.colors[2]})`
                    }} />
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: currentTheme === t.key ? 'var(--brand-1)' : 'var(--text-secondary)' }}>
                      {t.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sign Out */}
      <div className="profile-section animate-in animate-in-delay-4">
        <button className="btn btn-danger" style={{ width: '100%', fontSize: 'var(--text-lg)' }} onClick={handleLogout}>
          <span className="material-icons" style={{ fontSize: 18 }}>logout</span> Sign Out
        </button>
      </div>
    </div>
  )
}

function ProfileItem({ icon, label, value }) {
  return (
    <div className="profile-item">
      <div className="profile-item-icon">
        <span className="material-icons">{icon}</span>
      </div>
      <span className="profile-item-text">{label}</span>
      <span className="profile-item-value">{value}</span>
    </div>
  )
}
