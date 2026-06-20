import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { searchRides } from '../services/dataService'
import { TELANGANA_CITIES } from '../utils/constants'
import { formatTime, formatPrice } from '../utils/helpers'
import './pages.css'

export default function SearchRidePage() {
  const [from, setFrom] = useState(localStorage.getItem('rz_search_from') || '')
  const [to, setTo] = useState(localStorage.getItem('rz_search_to') || '')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [persons, setPersons] = useState(1)
  const [results, setResults] = useState([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState('All')
  const [fromDrop, setFromDrop] = useState([])
  const [toDrop, setToDrop] = useState([])
  const fromRef = useRef(null)
  const toRef = useRef(null)

  const filters = ['All', 'Cheapest', 'Women Only', 'Bike Only', 'Car Only']

  useEffect(() => {
    function close(e) {
      if (fromRef.current && !fromRef.current.contains(e.target)) setFromDrop([])
      if (toRef.current && !toRef.current.contains(e.target)) setToDrop([])
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  function onFrom(v) {
    setFrom(v)
    setFromDrop(v ? TELANGANA_CITIES.filter(c => c.toLowerCase().startsWith(v.toLowerCase())).slice(0, 8) : [])
  }
  function onTo(v) {
    setTo(v)
    setToDrop(v ? TELANGANA_CITIES.filter(c => c.toLowerCase().startsWith(v.toLowerCase())).slice(0, 8) : [])
  }
  function swap() { const t = from; setFrom(to); setTo(t); setFromDrop([]); setToDrop([]) }

  async function search() {
    if (!from && !to) return
    localStorage.setItem('rz_search_from', from)
    localStorage.setItem('rz_search_to', to)
    setSearched(true); setLoading(true); setFromDrop([]); setToDrop([])
    try {
      // In a real app we'd also pass date and persons, but dataService.searchRides only takes from/to currently
      const res = await searchRides({ from, to })
      setResults(res)
    } finally { setLoading(false) }
  }

  let filtered = results.filter(r => (r.available_seats || 0) > 0)
  if (activeFilter === 'Cheapest') filtered.sort((a, b) => (a.price_per_seat || 0) - (b.price_per_seat || 0))
  if (activeFilter === 'Women Only') filtered = filtered.filter(r => r.is_women_only)
  if (activeFilter === 'Bike Only') filtered = filtered.filter(r => r.total_seats === 2)
  if (activeFilter === 'Car Only') filtered = filtered.filter(r => r.total_seats > 2)

  return (
    <div className="page-enter">
      <div className="search-panel animate-in">
        <h1>
          <span className="material-icons">search</span>
          Find a Ride
        </h1>
        <div className="search-inputs">
          <div className="search-input-wrap" ref={fromRef}>
            <span className="search-input-icon src" />
            <input className="search-input" placeholder="Leaving from…" value={from}
              onChange={e => onFrom(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} />
            {fromDrop.length > 0 && (
              <div className="dropdown" style={{zIndex:60}}>
                {fromDrop.map(c => (
                  <div key={c} className="dropdown-item" onClick={() => { setFrom(c); setFromDrop([]) }}>
                    <span className="material-icons" style={{fontSize:14, color:'var(--brand-1)'}}>location_on</span>{c}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="search-swap" onClick={swap} title="Swap">
            <span className="material-icons" style={{fontSize:16}}>swap_vert</span>
          </button>
          <div className="search-input-wrap" ref={toRef}>
            <span className="search-input-icon dst" />
            <input className="search-input" placeholder="Going to…" value={to}
              onChange={e => onTo(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} />
            {toDrop.length > 0 && (
              <div className="dropdown" style={{zIndex:60}}>
                {toDrop.map(c => (
                  <div key={c} className="dropdown-item" onClick={() => { setTo(c); setToDrop([]) }}>
                    <span className="material-icons" style={{fontSize:14, color:'var(--brand-1)'}}>location_on</span>{c}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="search-row-2">
          <input className="search-date" type="date" value={date} onChange={e => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]} />
          <div className="search-persons-box">
            <span className="material-icons" style={{fontSize:14, color:'var(--text-muted)'}}>people</span>
            <button className="search-persons-btn" onClick={() => setPersons(Math.max(1, persons - 1))}>−</button>
            <span className="search-persons-num">{persons}</span>
            <button className="search-persons-btn" onClick={() => setPersons(Math.min(6, persons + 1))}>+</button>
          </div>
        </div>
        <button className="search-go" onClick={search} disabled={!from && !to}>
          <span className="material-icons" style={{fontSize:16}}>search</span>
          Search Rides
        </button>
      </div>

      <div className="filter-row animate-in animate-in-delay-1">
        {filters.map(f => (
          <button key={f} className={`filter-chip ${activeFilter === f ? 'active' : ''}`}
            onClick={() => setActiveFilter(f)}>{f}</button>
        ))}
      </div>

      {searched && !loading && (
        <div className="results-header animate-in animate-in-delay-2">
          <span className="results-count">{filtered.length} rides found</span>
          {(from || to) && <span className="results-route">{from} → {to}</span>}
        </div>
      )}

      <div className="ride-list animate-in animate-in-delay-2">
        {loading ? (
          <div style={{textAlign:'center', padding:40, color:'var(--text-muted)'}}>
            <div className="spinner spinner-brand" style={{width:24,height:24,margin:'0 auto 10px'}} />
          </div>
        ) : searched && filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-emoji">🔍</div>
            <h3>No rides found</h3>
            <p>Try different locations or date</p>
          </div>
        ) : (
          filtered.map(r => <SearchRideCard key={r.id} ride={r} />)
        )}
      </div>
    </div>
  )
}

function SearchRideCard({ ride }) {
  const d = ride.driver || {}
  return (
    <Link to={`/ride/${ride.id}`} className="rcard">
      <div className="rcard-top">
        <div className="rcard-avatar">
          {d.profile_photo_url ? <img src={d.profile_photo_url} alt="" />
            : <span className="material-icons" style={{color:'var(--text-muted)',fontSize:20}}>person</span>}
        </div>
        <div>
          <div className="rcard-driver-name">{d.full_name || 'Driver'}</div>
          <div className="rcard-driver-meta">{ride.vehicle_model || 'Car'} · {ride.total_seats}-Seater</div>
        </div>
        {d.rating > 0 && <div className="rcard-rating"><span className="material-icons" style={{fontSize:11}}>star</span>{Number(d.rating).toFixed(1)}</div>}
        {ride.is_women_only && <span className="badge badge-pink" style={{marginLeft:4}}>♀ Women Only</span>}
      </div>
      <div className="rcard-route">
        <div className="rcard-route-line">
          <div className="rcard-dots">
            <div className="rcard-dot rcard-dot-g" />
            <div className="rcard-dot-line" />
            <div className="rcard-dot rcard-dot-r" />
          </div>
          <div className="rcard-cities">
            <div className="rcard-city">{ride.source}</div>
            <div className="rcard-city">{ride.destination}</div>
          </div>
        </div>
        <div className="rcard-meta" style={{marginTop:10}}>
          <span className="rcard-meta-item"><span className="material-icons">calendar_today</span>{formatTime(ride.departure_time)}</span>
          <span className="rcard-meta-item"><span className="material-icons">schedule</span>{new Date(ride.departure_time).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true})}</span>
          <span className="rcard-meta-item"><span className="material-icons">event_seat</span>{ride.available_seats} left</span>
        </div>
      </div>
      <div className="rcard-bottom">
        <div><span className="rcard-price">{formatPrice(ride.price_per_seat)}</span><span className="rcard-price-label"> / seat</span></div>
        <span className="rcard-view-btn">View Details<span className="material-icons" style={{fontSize:14}}>chevron_right</span></span>
      </div>
    </Link>
  )
}
