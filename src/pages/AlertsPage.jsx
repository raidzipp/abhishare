import './pages.css'

export default function AlertsPage() {
  return (
    <div className="page-enter">
      <h1 style={{ fontSize: 'var(--text-5xl)', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 24 }}>Notifications</h1>
      <div className="alerts-empty">
        <span className="material-icons">notifications_none</span>
        <p>No new notifications</p>
      </div>
    </div>
  )
}
