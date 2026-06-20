import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { useState } from 'react'
import './AppShell.css'

export default function AppShell() {
  const { user, loading, profileComplete } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const location = useLocation()

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-logo">R</div>
        <div className="app-loading-text gradient-text">RideZipp</div>
        <div className="spinner spinner-brand" style={{ width: 24, height: 24 }} />
      </div>
    )
  }

  if (!user) return <Navigate to="/" replace />

  const isDashboard = location.pathname === '/dashboard'

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'shell-collapsed' : ''}`}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="shell-main">
        {!isDashboard && <TopBar />}
        <main className="shell-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
