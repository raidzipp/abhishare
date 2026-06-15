import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { logout } from '../../services/dataService'
import { THEMES } from '../../utils/constants'
import { getInitial } from '../../utils/helpers'
import { useState } from 'react'
import './Sidebar.css'

export default function Sidebar({ collapsed, onToggle }) {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [showThemes, setShowThemes] = useState(false)
  const currentTheme = localStorage.getItem('rz_theme') || 'indigo'

  const navItems = [
    { to: '/dashboard', icon: 'home', label: 'Dashboard' },
    { to: '/search', icon: 'search', label: 'Search Rides' },
    { to: '/create-ride', icon: 'add_circle', label: 'Post Ride' },
    { to: '/my-rides', icon: 'directions_car', label: 'My Rides' },
    { to: '/alerts', icon: 'notifications', label: 'Notifications' },
    { to: '/profile', icon: 'person', label: 'Profile' },
  ]

  function handleTheme(key) {
    localStorage.setItem('rz_theme', key)
    document.documentElement.setAttribute('data-theme', key === 'indigo' ? '' : key)
    setShowThemes(false)
  }

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="sidebar-top">
        <div className="sidebar-brand" onClick={() => navigate('/dashboard')}>
          <span className="sidebar-logo">🚗</span>
          {!collapsed && <span className="sidebar-brand-text">RideZipp</span>}
        </div>
        <button className="sidebar-toggle" onClick={onToggle} aria-label="Toggle sidebar">
          <span className="material-icons">{collapsed ? 'chevron_right' : 'chevron_left'}</span>
        </button>
      </div>

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

      <div className="sidebar-bottom">
        {!collapsed && (
          <>
            <button className="sidebar-link sidebar-theme-btn" onClick={() => setShowThemes(!showThemes)}>
              <span className="material-icons sidebar-icon">palette</span>
              <span className="sidebar-label">Theme</span>
              <span className="material-icons" style={{ fontSize: 16, marginLeft: 'auto' }}>
                {showThemes ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {showThemes && (
              <div className="sidebar-themes">
                {THEMES.map(t => (
                  <button
                    key={t.key}
                    className={`theme-btn ${currentTheme === t.key ? 'active' : ''}`}
                    onClick={() => handleTheme(t.key)}
                  >
                    <span
                      className="theme-swatch"
                      style={{ background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]}, ${t.colors[2]})` }}
                    />
                    <span>{t.name}</span>
                    {currentTheme === t.key && <span className="material-icons" style={{ fontSize: 14, marginLeft: 'auto' }}>check</span>}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        <div className="sidebar-user" onClick={() => navigate('/profile')}>
          <div className="sidebar-avatar">
            {profile?.profile_photo_url ? (
              <img src={profile.profile_photo_url} alt="" />
            ) : (
              <span>{getInitial(profile?.full_name)}</span>
            )}
          </div>
          {!collapsed && (
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{profile?.full_name || 'User'}</span>
              <span className="sidebar-user-role">{profile?.is_verified ? '✓ Verified' : 'Member'}</span>
            </div>
          )}
        </div>

        <button className="sidebar-link sidebar-logout" onClick={handleLogout} title={collapsed ? 'Sign Out' : undefined}>
          <span className="material-icons sidebar-icon">logout</span>
          {!collapsed && <span className="sidebar-label">Sign Out</span>}
        </button>
      </div>
    </aside>
  )
}
