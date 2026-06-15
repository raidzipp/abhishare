import { useState } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { GENDERS } from '../utils/constants'
import './auth.css'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [gender, setGender] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="app-loading">
        <div className="app-loading-logo">🚗</div>
        <div className="app-loading-text gradient-text">RideZipp</div>
        <div className="spinner spinner-brand" style={{ width: 28, height: 28 }} />
      </div>
    )
  }

  if (user) return <Navigate to="/dashboard" replace />

  async function handleSignup(e) {
    e.preventDefault()
    setError('')
    if (!name.trim() || !email || !password || !gender) {
      setError('Please fill all required fields.'); return
    }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }

    setLoading(true)
    try {
      const { data, error: authErr } = await supabase.auth.signUp({ email, password })
      if (authErr) throw authErr

      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: name.trim(),
          gender,
          phone_number: phone.trim(),
        })
      }
      navigate('/profile-setup')
    } catch (err) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-circle auth-circle-1" />
        <div className="auth-circle auth-circle-2" />
        <div className="auth-circle auth-circle-3" />
        <div className="auth-visual-content">
          <span className="auth-emoji">✨</span>
          <h2>Join the<br />ride-sharing revolution</h2>
          <p>Create your account and start sharing rides with verified commuters in your city.</p>
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-form-container">
          <div className="auth-form-logo">🚗 <span className="gradient-text">RideZipp</span></div>
          <h1>Create account</h1>
          <p className="auth-subtitle">Fill in your details to get started</p>

          {error && <div className="alert alert-error"><span className="material-icons" style={{fontSize:18}}>error</span>{error}</div>}

          <form onSubmit={handleSignup} className="auth-form">
            <div className="input-group">
              <label className="input-label">Full Name *</label>
              <input id="signup-name" className="input-field" placeholder="Your full name"
                value={name} onChange={e => setName(e.target.value)} required />
            </div>

            <div className="auth-2col">
              <div className="input-group">
                <label className="input-label">Gender *</label>
                <select id="signup-gender" className="input-field" value={gender} onChange={e => setGender(e.target.value)} required>
                  <option value="">Select</option>
                  {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Phone</label>
                <input id="signup-phone" className="input-field" type="tel" placeholder="+91 9876543210"
                  value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Email *</label>
              <input id="signup-email" className="input-field" type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div className="input-group">
              <label className="input-label">Password *</label>
              <div className="input-pwd-wrap">
                <input id="signup-password" className="input-field" type={showPwd ? 'text' : 'password'} placeholder="Min. 6 characters"
                  value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                <button type="button" className="input-pwd-toggle" onClick={() => setShowPwd(!showPwd)}>
                  <span className="material-icons">{showPwd ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-brand-lg" disabled={loading} style={{width:'100%', marginTop:8}}>
              {loading && <span className="spinner" />}
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="auth-link">
            Already have an account? <Link to="/">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
