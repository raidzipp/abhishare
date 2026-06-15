import { useAuth } from '../../contexts/AuthContext'
import { getInitial } from '../../utils/helpers'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../services/dataService'
import { useState, useRef, useEffect } from 'react'
import './TopBar.css'

export default function TopBar() {
  const { profile } = useAuth()
  const navigate = useNavigate()
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

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h2 className="topbar-greeting">
          {profile?.full_name ? `Hey, ${profile.full_name.split(' ')[0]}` : 'Welcome'}
        </h2>
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
