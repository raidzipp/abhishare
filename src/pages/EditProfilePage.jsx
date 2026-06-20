import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { GENDERS } from '../utils/constants'
import './pages.css'

export default function EditProfilePage() {
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState('')
  const [dob, setDob] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { loadProfile() }, [])

  async function loadProfile() {
    if (!user) { navigate('/'); return }
    const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
    if (p) {
      setName(p.full_name || '')
      setPhone(p.phone_number || '')
      setGender(p.gender || '')
      setDob(p.date_of_birth || '')
    }
    setLoading(false)
  }

  async function save(e) {
    e.preventDefault()
    if (!name.trim()) { setError('Name cannot be empty'); return }
    setSaving(true); setError('')
    try {
      await supabase.from('profiles').update({
        full_name: name.trim(),
        phone_number: phone.trim(),
        gender,
        date_of_birth: dob || null,
      }).eq('id', user.id)
      await refreshProfile()
      navigate('/profile')
    } catch (err) {
      setError(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
        <div className="spinner spinner-brand" style={{ width: 24, height: 24, margin: '0 auto 10px' }} />
      </div>
    )
  }

  return (
    <div className="page-enter">
      <button className="btn btn-ghost" onClick={() => navigate(-1)}
        style={{ marginBottom: 14, gap: 4, padding: '6px 4px' }}>
        <span className="material-icons" style={{ fontSize: 18 }}>arrow_back</span> Back
      </button>

      <div className="page-header">
        <h1 className="page-title">Edit Profile</h1>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 14 }}><span className="material-icons" style={{ fontSize: 16 }}>error</span>{error}</div>}

      <form onSubmit={save} className="edit-form">
        <div className="input-group" style={{ marginBottom: 18 }}>
          <label className="input-label">Full Name</label>
          <input className="input-field" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" required />
        </div>

        <div className="input-group" style={{ marginBottom: 18 }}>
          <label className="input-label">Phone Number</label>
          <input className="input-field" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Enter phone number" />
        </div>

        <div className="input-group" style={{ marginBottom: 18 }}>
          <label className="input-label">Gender</label>
          <select className="input-field" value={gender} onChange={e => setGender(e.target.value)}>
            <option value="">Select gender</option>
            {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div className="input-group" style={{ marginBottom: 28 }}>
          <label className="input-label">Date of Birth</label>
          <input className="input-field" type="date" value={dob} onChange={e => setDob(e.target.value)} max={new Date().toISOString().split('T')[0]} />
        </div>

        <button type="submit" className="btn btn-brand-lg" disabled={saving} style={{ width: '100%' }}>
          {saving && <span className="spinner" />}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
