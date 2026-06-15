import { useState } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import './auth.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { user, profileComplete, loading: authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="app-loading">
        <div className="app-loading-logo">🚗</div>
        <div className="app-loading-text gradient-text">RideZipp</div>
        <div className="spinner spinner-brand" style={{ width: 28, height: 28 }} />
      </div>
    )
  }

  if (user && profileComplete) return <Navigate to="/dashboard" replace />
  if (user && !profileComplete) return <Navigate to="/profile-setup" replace />

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please enter both fields.'); return }
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      setError(err.message)
      setLoading(false)
    }
    // If successful, we stay in loading state until AuthContext redirects us
  }

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-circle auth-circle-1" />
        <div className="auth-circle auth-circle-2" />
        <div className="auth-circle auth-circle-3" />
        <div className="auth-visual-content">
          <span className="auth-emoji">🚗</span>
          <h2>Share rides,<br />save money</h2>
          <p>Join thousands of commuters carpooling across Telangana. Post a ride or find one in seconds.</p>
          <div className="auth-visual-stats">
            <div className="auth-stat">
              <span className="auth-stat-num">10K+</span>
              <span className="auth-stat-label">Active Users</span>
            </div>
            <div className="auth-stat">
              <span className="auth-stat-num">50K+</span>
              <span className="auth-stat-label">Rides Shared</span>
            </div>
            <div className="auth-stat">
              <span className="auth-stat-num">₹2M+</span>
              <span className="auth-stat-label">Saved</span>
            </div>
          </div>
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-form-container">
          <div className="auth-form-logo">🚗 <span className="gradient-text">RideZipp</span></div>
          <h1>Welcome back</h1>
          <p className="auth-subtitle">Sign in to continue to RideZipp</p>

          {error && <div className="alert alert-error"><span className="material-icons" style={{fontSize:18}}>error</span>{error}</div>}

          <form onSubmit={handleLogin} className="auth-form">
            <div className="input-group">
              <label className="input-label">Email</label>
              <input id="login-email" className="input-field" type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-pwd-wrap">
                <input id="login-password" className="input-field" type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
                <button type="button" className="input-pwd-toggle" onClick={() => setShowPwd(!showPwd)}>
                  <span className="material-icons">{showPwd ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-brand-lg" disabled={loading} style={{width:'100%', marginTop:8}}>
              {loading && <span className="spinner" />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="auth-link">
            New to RideZipp? <Link to="/signup">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
