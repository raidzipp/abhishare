import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { useState } from 'react'
import './AppShell.css'

export default function AppShell() {
  const { user, loading, profileComplete } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-logo">🚗</div>
        <div className="app-loading-text gradient-text">RideZipp</div>
        <div className="spinner spinner-brand" style={{ width: 28, height: 28 }} />
      </div>
    )
  }

  if (!user) return <Navigate to="/" replace />
  if (!profileComplete) return <Navigate to="/profile-setup" replace />

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'shell-collapsed' : ''}`}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="shell-main">
        <TopBar />
        <main className="shell-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
