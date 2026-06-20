import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { CAR_MAKES, BIKE_MAKES } from '../utils/constants'
import './pages.css'

export default function AddVehiclePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [type, setType] = useState('car')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [plate, setPlate] = useState('')
  const [seater, setSeater] = useState(null)
  const [photoUrl, setPhotoUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [uploading, setUploading] = useState(false)

  const makes = type === 'car' ? CAR_MAKES : BIKE_MAKES
  const seaters = type === 'car' ? [{ n: 4, label: '4 Seater' }, { n: 5, label: '5 Seater' }, { n: 7, label: '7 Seater' }, { n: 8, label: '8 Seater' }]
    : [{ n: 2, label: '2 Seater' }]

  async function handlePhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const path = `vehicles/${user.id}/${Date.now()}_${file.name}`
      const { error } = await supabase.storage.from('vehicle-photos').upload(path, file)
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('vehicle-photos').getPublicUrl(path)
      setPhotoUrl(publicUrl)
    } catch (err) {
      setErr('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  async function save(e) {
    e.preventDefault(); setErr('')
    if (!make) { setErr('Select a vehicle make.'); return }
    if (!model) { setErr('Enter vehicle model.'); return }
    if (!plate) { setErr('Enter plate number.'); return }
    const seatNum = type === 'car' ? seater : 2
    if (!seatNum) { setErr('Select seater type.'); return }

    setSaving(true)
    try {
      const { error } = await supabase.from('cars').insert({
        owner_id: user.id,
        type,
        make,
        model,
        plate_number: plate.toUpperCase().trim(),
        seater_type: seatNum,
        photo_url: photoUrl || null,
      })
      if (error) throw error
      navigate('/profile')
    } catch (e) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-enter">
      <button className="btn btn-ghost" onClick={() => navigate(-1)}
        style={{ marginBottom: 14, gap: 4, padding: '6px 4px' }}>
        <span className="material-icons" style={{ fontSize: 18 }}>arrow_back</span> Back
      </button>

      <div className="vehicle-header">
        <h1><span className="material-icons">directions_car</span> Add Vehicle</h1>
        <p>Register your vehicle to post rides faster</p>
      </div>

      {err && <div className="alert alert-error" style={{ marginBottom: 14 }}><span className="material-icons" style={{ fontSize: 16 }}>error</span>{err}</div>}

      <form onSubmit={save}>
        {/* Vehicle Type */}
        <div className="vehicle-card">
          <div className="vehicle-card-title">Vehicle Type</div>
          <div className="type-toggle">
            <button type="button" className={`type-btn ${type === 'car' ? 'active' : ''}`} onClick={() => { setType('car'); setMake(''); setSeater(null) }}>
              <span className="material-icons" style={{ fontSize: 18 }}>directions_car</span> Car
            </button>
            <button type="button" className={`type-btn ${type === 'bike' ? 'active' : ''}`} onClick={() => { setType('bike'); setMake(''); setSeater(2) }}>
              <span className="material-icons" style={{ fontSize: 18 }}>motorcycle</span> Bike
            </button>
          </div>
        </div>

        {/* Make & Model */}
        <div className="vehicle-card">
          <div className="vehicle-card-title">Details</div>
          <div style={{ marginBottom: 14 }}>
            <label className="input-label" style={{ marginBottom: 8, display: 'block' }}>Make</label>
            <div className="make-chips">
              {makes.map(m => (
                <button type="button" key={m} className={`make-chip ${make === m ? 'active' : ''}`}
                  onClick={() => setMake(m)}>{m}</button>
              ))}
            </div>
          </div>
          <div className="input-group" style={{ marginBottom: 14 }}>
            <label className="input-label">Model</label>
            <input className="input-field" placeholder={type === 'car' ? 'Swift, Creta, Nexon…' : 'Pulsar, Classic…'}
              value={model} onChange={e => setModel(e.target.value)} required />
          </div>
          <div className="input-group">
            <label className="input-label">Plate Number</label>
            <input className="input-field" placeholder="TS 09 EA 1234"
              value={plate} onChange={e => setPlate(e.target.value)} required />
          </div>
        </div>

        {/* Seater (for car only) */}
        {type === 'car' && (
          <div className="vehicle-card">
            <div className="vehicle-card-title">Seating</div>
            <div className="seater-grid">
              {seaters.map(s => (
                <button type="button" key={s.n} className={`seater-btn ${seater === s.n ? 'active' : ''}`}
                  onClick={() => setSeater(s.n)}>
                  <span className="seater-num">{s.n}</span>
                  <span className="seater-label">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Photo */}
        <div className="vehicle-card">
          <div className="vehicle-card-title">Vehicle Photo (Optional)</div>
          {photoUrl ? (
            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 10, border: '1px solid var(--border)' }}>
              <img src={photoUrl} alt="Vehicle" style={{ width: '100%', height: 160, objectFit: 'cover' }} />
            </div>
          ) : (
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '28px 20px', border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)',
              cursor: 'pointer', textAlign: 'center', transition: 'all 0.12s',
              background: 'var(--page-bg)',
            }}>
              <span className="material-icons" style={{ fontSize: 32, color: 'var(--text-muted)', marginBottom: 6 }}>add_a_photo</span>
              <span style={{ fontSize: 'var(--text-md)', fontWeight: 500, color: 'var(--text-muted)' }}>
                {uploading ? 'Uploading…' : 'Click to upload'}
              </span>
              <input type="file" accept="image/*" onChange={handlePhoto} hidden disabled={uploading} />
            </label>
          )}
          {photoUrl && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPhotoUrl('')}>Remove Photo</button>
          )}
        </div>

        <button type="submit" className="btn btn-brand-lg" disabled={saving}
          style={{ width: '100%', marginTop: 4 }}>
          {saving && <span className="spinner" />}
          {saving ? 'Saving…' : 'Save Vehicle'}
        </button>
      </form>
    </div>
  )
}
