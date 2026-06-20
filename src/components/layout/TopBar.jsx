import { useAuth } from '../../contexts/AuthContext'
import { getInitial } from '../../utils/helpers'
import { useNavigate, useLocation } from 'react-router-dom'
import { logout } from '../../services/dataService'
import { useState, useRef, useEffect } from 'react'
import './TopBar.css'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/search': 'Search Rides',
  '/create-ride': 'Post a Ride',
  '/my-rides': 'My Rides',
  '/alerts': 'Notifications',
  '/profile': 'Profile',
  '/profile/edit': 'Edit Profile',
  '/add-vehicle': 'Add Vehicle',
}

export default function TopBar() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  const pageTitle = PAGE_TITLES[location.pathname] || (location.pathname.startsWith('/ride/') ? 'Ride Details' : 'RideZipp')

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-breadcrumb">
          <span className="topbar-breadcrumb-item">{pageTitle}</span>
        </div>
      </div>

      <div className="topbar-search" onClick={() => navigate('/search')} role="button" tabIndex={0} aria-label="Search rides">
        <span className="material-icons">search</span>
        <span className="topbar-search-text">Search rides…</span>
        <span className="topbar-search-kbd">⌘K</span>
      </div>

      <div className="topbar-right">
        <button className="topbar-icon-btn" onClick={() => navigate('/alerts')} aria-label="Notifications">
          <span className="material-icons">notifications_none</span>
        </button>

        <div className="topbar-user" ref={menuRef}>
          <button className="topbar-avatar-btn" onClick={() => setShowMenu(!showMenu)}>
            <div className="topbar-avatar">
              {profile?.profile_photo_url ? (
                <img src={profile.profile_photo_url} alt="" />
              ) : (
                <span>{getInitial(profile?.full_name)}</span>
              )}
            </div>
            <span className="topbar-user-name">{profile?.full_name?.split(' ')[0] || 'User'}</span>
            <span className="material-icons topbar-caret">expand_more</span>
          </button>

          {showMenu && (
            <div className="topbar-menu">
              <div className="topbar-menu-header">
                <strong>{profile?.full_name || 'User'}</strong>
                <span>{profile?.gender || ''}</span>
              </div>
              <div className="topbar-menu-divider" />
              <button className="topbar-menu-item" onClick={() => { setShowMenu(false); navigate('/profile') }}>
                <span className="material-icons">person</span> Profile
              </button>
              <button className="topbar-menu-item" onClick={() => { setShowMenu(false); navigate('/profile/edit') }}>
                <span className="material-icons">edit</span> Edit Profile
              </button>
              <div className="topbar-menu-divider" />
              <button className="topbar-menu-item topbar-menu-danger" onClick={handleLogout}>
                <span className="material-icons">logout</span> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
