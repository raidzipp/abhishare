import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { calculateAge } from '../utils/helpers'
import './pages.css'

export default function ProfileSetupPage() {
  const { user, profileComplete, refreshProfile, loading: authLoading } = useAuth()
  const [dob, setDob] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  if (authLoading) {
    return (
      <div className="app-loading">
        <div className="app-loading-logo">🚗</div>
        <div className="app-loading-text gradient-text">RideZipp</div>
        <div className="spinner spinner-brand" style={{ width: 28, height: 28 }} />
      </div>
    )
  }

  if (!user) return <Navigate to="/" replace />
  if (profileComplete) return <Navigate to="/dashboard" replace />

  function handlePhoto(e) {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!dob) { setError('Please select your date of birth.'); return }
    setLoading(true); setError('')

    try {
      let photoUrl = null
      if (photoFile) {
        const ext = photoFile.name.split('.').pop()
        const fileName = `${user.id}_${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage.from('car_photos').upload(fileName, photoFile, {
          contentType: photoFile.type, upsert: true
        })
        if (upErr) throw upErr
        const { data: urlData } = supabase.storage.from('car_photos').getPublicUrl(fileName)
        photoUrl = urlData.publicUrl
      }

      const updates = { date_of_birth: dob }
      if (photoUrl) updates.profile_photo_url = photoUrl

      const { error: dbErr } = await supabase.from('profiles').update(updates).eq('id', user.id)
      if (dbErr) throw dbErr

      await refreshProfile()
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Failed to complete setup')
    } finally {
      setLoading(false)
    }
  }

  const age = calculateAge(dob)

  return (
    <div className="setup-page">
      <div className="setup-container">
        <div className="setup-header">
          <h1 className="gradient-text">Complete Your Profile</h1>
          <p>Just a few details to get you started</p>
        </div>

        <div className="setup-photo-wrap" onClick={() => document.getElementById('photo-input').click()}>
          <div className="setup-photo">
            {photoPreview ? (
              <img src={photoPreview} alt="Profile" />
            ) : (
              <span className="material-icons" style={{fontSize:56, color:'var(--brand-1)', opacity:0.3}}>person</span>
            )}
          </div>
          <div className="setup-photo-badge">
            <span className="material-icons" style={{fontSize:18}}>camera_alt</span>
          </div>
          <input id="photo-input" type="file" accept="image/*" onChange={handlePhoto} hidden />
        </div>

        {error && <div className="alert alert-error" style={{marginTop:16}}><span className="material-icons" style={{fontSize:18}}>error</span>{error}</div>}

        <form onSubmit={handleSubmit} className="setup-form">
          <div className="input-group">
            <label className="input-label">Date of Birth</label>
            <div className="setup-dob-field">
              <input id="setup-dob" className="input-field" type="date" value={dob}
                onChange={e => setDob(e.target.value)} max={new Date().toISOString().split('T')[0]} required />
              {age !== null && (
                <span className="setup-age-badge">{age} years</span>
              )}
            </div>
          </div>

          <button type="submit" className="btn btn-brand-lg" disabled={loading} style={{width:'100%', marginTop:24}}>
            {loading && <span className="spinner" />}
            {loading ? 'Completing…' : 'Complete Setup'}
          </button>

          <p className="setup-hint">Your age will be visible to help other riders.</p>
        </form>
      </div>
    </div>
  )
}
