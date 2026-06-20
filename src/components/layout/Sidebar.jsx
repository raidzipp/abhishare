import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { logout } from '../../services/dataService'
import { getInitial } from '../../utils/helpers'
import './Sidebar.css'

export default function Sidebar({ collapsed, onToggle }) {
  const { profile } = useAuth()
  const navigate = useNavigate()

  const navItems = [
    { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/search', icon: 'search', label: 'Search Rides' },
    { to: '/create-ride', icon: 'auto_awesome', label: 'Post Ride' },
    { to: '/my-rides', icon: 'directions_car', label: 'My Rides' },
    { to: '/alerts', icon: 'notifications', label: 'Notifications' },
    { to: '/profile', icon: 'person', label: 'Profile' },
  ]

  async function handleLogout() {
    try {
      await logout()
    } finally {
      navigate('/')
    }
  }

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-top">
        <div className="sidebar-brand" onClick={() => navigate('/dashboard')}>
          <div className="sidebar-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" fill="url(#bolt)" />
              <defs>
                <linearGradient id="bolt" x1="4" y1="3" x2="18" y2="21" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#A78BFA" />
                  <stop offset="1" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          {!collapsed && (
            <div className="sidebar-brand-text-wrap">
              <span className="sidebar-brand-text">RideZipp</span>
              <span className="sidebar-tagline">Share Rides, Save Money</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            title={collapsed ? item.label : undefined}
          >
            <span className="material-icons sidebar-icon">{item.icon}</span>
            {!collapsed && <span className="sidebar-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Travel Smart Promo Card */}
      {!collapsed && (
        <div className="sidebar-promo-image-container">
          <img src="/assets/promo_image.png" alt="Travel Smart" className="sidebar-promo-image" />
        </div>
      )}

      {/* Profile + Sign Out */}
      <div className="sidebar-bottom">
        <div className="sidebar-user" onClick={() => navigate('/profile')}>
          <div className="sidebar-avatar-wrap">
            <div className="sidebar-avatar">
              {profile?.profile_photo_url ? (
                <img src={profile.profile_photo_url} alt="" />
              ) : (
                <span>{getInitial(profile?.full_name)}</span>
              )}
            </div>
            {profile?.is_verified && (
              <div className="verified-dot">
                <span className="material-icons">verified</span>
              </div>
            )}
          </div>
          {!collapsed && (
            <>
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{profile?.full_name || 'User'}</span>
                <span className="sidebar-user-role">Verified User</span>
              </div>
              <span className="material-icons sidebar-gear">settings</span>
            </>
          )}
        </div>

        <button className="sidebar-signout" onClick={handleLogout}>
          <span className="material-icons">logout</span>
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  )
}
