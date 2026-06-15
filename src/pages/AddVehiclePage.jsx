import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { CAR_MAKES, BIKE_MAKES } from '../utils/constants'
import './pages.css'

export default function AddVehiclePage() {
  const navigate = useNavigate()
  const [isBike, setIsBike] = useState(false)
  const [seater, setSeater] = useState(5)
  const [make, setMake] = useState('Maruti')
  const [model, setModel] = useState('Swift')
  const [color, setColor] = useState('')
  const [plate, setPlate] = useState('')
  const [photos, setPhotos] = useState([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handlePhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const user = (await supabase.auth.getUser()).data?.user
      const fileName = `${user?.id || 'guest'}/${Date.now()}.${ext}`
      await supabase.storage.from('car_photos').upload(fileName, file)
      const { data } = supabase.storage.from('car_photos').getPublicUrl(fileName)
      setPhotos([...photos, data.publicUrl])
    } catch (err) {
      setError('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  async function save(e) {
    e.preventDefault()
    if (!model.trim() || !plate.trim()) {
      setError('Please enter vehicle model and license plate'); return
    }
    setSaving(true); setError('')
    try {
      const user = (await supabase.auth.getUser()).data?.user
      await supabase.from('cars').insert({
        owner_id: user.id,
        make,
        model: model.trim(),
        color: color.trim(),
        plate_number: plate.trim(),
        seater_type: seater,
        photo_url: photos.length > 0 ? photos[0] : null,
      })
      navigate('/profile')
    } catch (err) {
      setError('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  function switchType(bike) {
    setIsBike(bike)
    setSeater(bike ? 2 : 5)
    setMake(bike ? BIKE_MAKES[0] : CAR_MAKES[0])
    setModel(bike ? 'Splendor Plus' : 'Swift')
  }

  const makes = isBike ? BIKE_MAKES : CAR_MAKES

  return (
    <div className="page-enter">
      <button className="btn btn-ghost" onClick={() => navigate(-1)}
        style={{ marginBottom: 16, gap: 4, padding: '8px 4px' }}>
        <span className="material-icons" style={{ fontSize: 20 }}>arrow_back</span> Back
      </button>

      {/* Header */}
      <div className="vehicle-header animate-in">
        <div style={{ position: 'absolute', width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', top: -40, right: -40 }} />
        <div style={{ position: 'absolute', width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', bottom: -25, left: -20 }} />
        <h1>Add Vehicle</h1>
        <p>Add your vehicle to start pooling</p>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}><span className="material-icons" style={{ fontSize: 18 }}>error</span>{error}</div>}

      <form onSubmit={save}>
        {/* Photos */}
        <div className="vehicle-card animate-in animate-in-delay-1">
          <div className="vehicle-card-title">VEHICLE PHOTOS</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {photos.map((p, i) => (
              <div key={i} style={{ width: 96, height: 80, borderRadius: 'var(--radius-xl)', overflow: 'hidden', position: 'relative' }}>
                <img src={p} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button type="button" style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'var(--red)', color: 'white', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={() => setPhotos(photos.filter((_, j) => j !== i))}>✕</button>
                {i === 0 && <span style={{ position: 'absolute', bottom: 4, left: 4, padding: '2px 6px', borderRadius: 4, background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: 8, fontWeight: 900 }}>Main</span>}
              </div>
            ))}
            <label style={{
              width: 96, height: 80, borderRadius: 'var(--radius-xl)',
              border: '2px dashed var(--brand-glow)', background: 'var(--indicator-bg)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', gap: 4, color: 'var(--brand-1)',
            }}>
              {uploading ? (
                <div className="spinner spinner-brand" style={{ width: 20, height: 20 }} />
              ) : (
                <><span className="material-icons" style={{ fontSize: 20 }}>add</span>
                  <span style={{ fontSize: 10, fontWeight: 900 }}>Add Photo</span></>
              )}
              <input type="file" accept="image/*" onChange={handlePhoto} hidden />
            </label>
          </div>
        </div>

        {/* Details */}
        <div className="vehicle-card animate-in animate-in-delay-2">
          <div className="vehicle-card-title">{isBike ? 'BIKE DETAILS' : 'VEHICLE DETAILS'}</div>

          <div className="type-toggle">
            <button type="button" className={`type-btn ${!isBike ? 'active' : ''}`} onClick={() => switchType(false)}>
              <span className="material-icons" style={{ fontSize: 18 }}>directions_car</span> Car
            </button>
            <button type="button" className={`type-btn ${isBike ? 'active' : ''}`} onClick={() => switchType(true)}>
              <span className="material-icons" style={{ fontSize: 18 }}>motorcycle</span> Bike
            </button>
          </div>

          <div className="input-label-sm" style={{ marginBottom: 8 }}>{isBike ? 'BIKE MAKE' : 'VEHICLE MAKE'}</div>
          <div className="make-chips">
            {makes.map(m => (
              <button type="button" key={m} className={`make-chip ${make === m ? 'active' : ''}`}
                onClick={() => setMake(m)}>{make === m && '✓ '}{m}</button>
            ))}
          </div>

          <div className="input-group" style={{ marginBottom: 14 }}>
            <label className="input-label-sm">{isBike ? 'BIKE MODEL' : 'VEHICLE MODEL'}</label>
            <input className="input-field" placeholder={isBike ? 'Splendor Plus' : 'Swift'}
              value={model} onChange={e => setModel(e.target.value)} />
          </div>
          <div className="input-group" style={{ marginBottom: 14 }}>
            <label className="input-label-sm">{isBike ? 'BIKE COLOR' : 'VEHICLE COLOR'}</label>
            <input className="input-field" placeholder="e.g. Glossy Black"
              value={color} onChange={e => setColor(e.target.value)} />
          </div>
          <div className="input-group">
            <label className="input-label-sm">LICENSE PLATE NUMBER</label>
            <input className="input-field" placeholder="e.g. TS 09 EA 1234"
              value={plate} onChange={e => setPlate(e.target.value)} />
          </div>
        </div>

        {/* Seater */}
        <div className="vehicle-card animate-in animate-in-delay-3">
          <div className="vehicle-card-title">SEATER TYPE</div>
          {isBike ? (
            <div style={{ textAlign: 'center' }}>
              <div className="seater-btn active" style={{ display: 'inline-block', pointerEvents: 'none', minWidth: 120 }}>
                <span className="seater-num">2</span>
                <span className="seater-label">Seater</span>
              </div>
              <p style={{ marginTop: 12, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>
                Bikes are fixed to 2-Seater (1 Rider + 1 Passenger)
              </p>
            </div>
          ) : (
            <div className="seater-grid">
              <button type="button" className={`seater-btn ${seater === 5 ? 'active' : ''}`} onClick={() => setSeater(5)}>
                <span className="seater-num">5</span>
                <span className="seater-label">Seater</span>
              </button>
              <button type="button" className={`seater-btn ${seater === 7 ? 'active' : ''}`} onClick={() => setSeater(7)}>
                <span className="seater-num">7</span>
                <span className="seater-label">Seater</span>
              </button>
            </div>
          )}
        </div>

        {/* Save */}
        <button type="submit" className="btn btn-brand-lg animate-in animate-in-delay-4" disabled={saving}
          style={{ width: '100%' }}>
          {saving && <span className="spinner" />}
          {saving ? 'Saving…' : 'Save Vehicle & Continue →'}
        </button>
      </form>
    </div>
  )
}
