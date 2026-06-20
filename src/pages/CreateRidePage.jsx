import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { getUserCars } from '../services/dataService'
import { TELANGANA_CITIES } from '../utils/constants'
import './pages.css'

export default function CreateRidePage() {
  const { user, profile } = useAuth()
  const [cars, setCars] = useState([])
  const [selectedCar, setSelectedCar] = useState(null)
  const [src, setSrc] = useState('')
  const [dst, setDst] = useState('')
  const [dt, setDt] = useState('')
  const [price, setPrice] = useState('')
  const [seats, setSeats] = useState('3')
  const [women, setWomen] = useState(false)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [success, setSuccess] = useState(false)
  const [srcDrop, setSrcDrop] = useState([])
  const [dstDrop, setDstDrop] = useState([])
  const srcRef = useRef(null)
  const dstRef = useRef(null)

  useEffect(() => {
    getUserCars().then(c => {
      setCars(c)
      if (c.length > 0) setSelectedCar(c[0])
    })
  }, [])

  useEffect(() => {
    function close(e) {
      if (srcRef.current && !srcRef.current.contains(e.target)) setSrcDrop([])
      if (dstRef.current && !dstRef.current.contains(e.target)) setDstDrop([])
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  function onSrc(v) { setSrc(v); setSrcDrop(v ? TELANGANA_CITIES.filter(c => c.toLowerCase().startsWith(v.toLowerCase())).slice(0, 8) : []) }
  function onDst(v) { setDst(v); setDstDrop(v ? TELANGANA_CITIES.filter(c => c.toLowerCase().startsWith(v.toLowerCase())).slice(0, 8) : []) }

  async function submit(e) {
    e.preventDefault(); setErr('')
    if (!src || !dst) { setErr('Please select source and destination.'); return }
    if (!dt) { setErr('Please select date and time.'); return }
    if (!price || Number(price) <= 0) { setErr('Please enter a valid price.'); return }
    if (!seats || Number(seats) < 1) { setErr('Please enter available seats.'); return }

    setBusy(true)
    const totalSeats = selectedCar ? selectedCar.seater_type : parseInt(seats)
    const availSeats = parseInt(seats)

    const { error } = await supabase.from('rides').insert({
      driver_id: user.id,
      source: src,
      destination: dst,
      departure_time: new Date(dt).toISOString(),
      price_per_seat: parseFloat(price),
      total_seats: totalSeats,
      available_seats: availSeats,
      vehicle_model: selectedCar ? `${selectedCar.make} ${selectedCar.model}` : '',
      vehicle_number: selectedCar ? selectedCar.plate_number : '',
      is_women_only: women,
      vehicle_photo_url: selectedCar?.photo_url || null,
    })

    setBusy(false)
    if (error) setErr(error.message)
    else setSuccess(true)
  }

  if (success) {
    return (
      <div className="page-enter" style={{ textAlign: 'center', padding: '60px 24px' }}>
        <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-xl)', background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <span className="material-icons" style={{ fontSize: 28, color: 'var(--green)' }}>check_circle</span>
        </div>
        <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, marginBottom: 6 }}>Ride Posted!</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontWeight: 400 }}>Your ride from <strong>{src}</strong> to <strong>{dst}</strong> is now live.</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Link to="/my-rides" className="btn btn-brand">View My Rides</Link>
          <button className="btn btn-outline" onClick={() => { setSuccess(false); setSrc(''); setDst(''); setDt(''); setPrice(''); setNote('') }}>Post Another</button>
        </div>
      </div>
    )
  }

  const isFemale = profile?.gender === 'Female'

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1 className="page-title">Post a Ride</h1>
        <p className="page-subtitle">Share your ride and earn by carpooling</p>
      </div>

      {err && <div className="alert alert-error" style={{ marginBottom: 14 }}><span className="material-icons" style={{ fontSize: 16 }}>error</span>{err}</div>}

      <form onSubmit={submit} className="create-form">
        {/* Vehicle Selection */}
        {cars.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <label className="input-label-sm">SELECT VEHICLE</label>
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              {cars.map(c => (
                <button type="button" key={c.id}
                  className={`filter-chip ${selectedCar?.id === c.id ? 'active' : ''}`}
                  onClick={() => setSelectedCar(c)}
                >
                  <span className="material-icons" style={{ fontSize: 14 }}>{c.seater_type === 2 ? 'motorcycle' : 'directions_car'}</span>
                  {c.make} {c.model} · {c.plate_number}
                </button>
              ))}
            </div>
          </div>
        )}

        {cars.length === 0 && (
          <div style={{ background: 'var(--indicator-bg)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-icons" style={{ color: 'var(--brand-1)', fontSize: 18 }}>info</span>
            <span style={{ flex: 1, fontSize: 'var(--text-md)', fontWeight: 500 }}>Add a vehicle to auto-fill details.</span>
            <Link to="/add-vehicle" className="btn btn-brand btn-sm">Add Vehicle</Link>
          </div>
        )}

        {/* Route */}
        <div className="create-2col">
          <div className="input-group" ref={srcRef} style={{ position: 'relative' }}>
            <label className="input-label">From *</label>
            <input className="input-field" placeholder="Pickup city" value={src}
              onChange={e => onSrc(e.target.value)} required />
            {srcDrop.length > 0 && (
              <div className="dropdown">
                {srcDrop.map(c => <div key={c} className="dropdown-item" onClick={() => { setSrc(c); setSrcDrop([]) }}>
                  <span className="material-icons" style={{ fontSize: 14, color: 'var(--brand-1)' }}>location_on</span>{c}
                </div>)}
              </div>
            )}
          </div>
          <div className="input-group" ref={dstRef} style={{ position: 'relative' }}>
            <label className="input-label">To *</label>
            <input className="input-field" placeholder="Drop city" value={dst}
              onChange={e => onDst(e.target.value)} required />
            {dstDrop.length > 0 && (
              <div className="dropdown">
                {dstDrop.map(c => <div key={c} className="dropdown-item" onClick={() => { setDst(c); setDstDrop([]) }}>
                  <span className="material-icons" style={{ fontSize: 14, color: 'var(--brand-1)' }}>location_on</span>{c}
                </div>)}
              </div>
            )}
          </div>
        </div>

        {/* DateTime */}
        <div className="input-group" style={{ marginTop: 14 }}>
          <label className="input-label">Date & Time *</label>
          <input className="input-field" type="datetime-local" value={dt}
            onChange={e => setDt(e.target.value)} required
            min={new Date().toISOString().slice(0, 16)} />
        </div>

        {/* Price & Seats */}
        <div className="create-2col" style={{ marginTop: 14 }}>
          <div className="input-group">
            <label className="input-label">Price per Seat (₹) *</label>
            <input className="input-field" type="number" min="1" placeholder="350"
              value={price} onChange={e => setPrice(e.target.value)} required />
          </div>
          <div className="input-group">
            <label className="input-label">Available Seats *</label>
            <input className="input-field" type="number" min="1" max="8"
              value={seats} onChange={e => setSeats(e.target.value)} required />
          </div>
        </div>

        {/* Vehicle (manual if no car selected) */}
        {!selectedCar && (
          <div className="create-2col" style={{ marginTop: 14 }}>
            <div className="input-group">
              <label className="input-label">Vehicle Model</label>
              <input className="input-field" placeholder="Maruti Swift" />
            </div>
            <div className="input-group">
              <label className="input-label">Vehicle Number</label>
              <input className="input-field" placeholder="TS 09 EA 1234" />
            </div>
          </div>
        )}

        {/* Note */}
        <div className="input-group" style={{ marginTop: 14 }}>
          <label className="input-label">Ride Note (optional)</label>
          <input className="input-field" placeholder="E.g. Starting from Hitech City metro station"
            value={note} onChange={e => setNote(e.target.value)} />
        </div>

        {/* Women Only */}
        {isFemale && (
          <label className="create-check">
            <input type="checkbox" checked={women} onChange={e => setWomen(e.target.checked)} />
            <span className="material-icons" style={{ fontSize: 16, color: 'var(--pink)' }}>female</span>
            Women-only ride
          </label>
        )}

        <button type="submit" className="btn btn-brand-lg" disabled={busy}
          style={{ width: '100%', marginTop: 20 }}>
          {busy && <span className="spinner" />}
          {busy ? 'Posting…' : 'Post Ride'}
        </button>
      </form>
    </div>
  )
}
