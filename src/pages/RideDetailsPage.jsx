import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { getRideById } from '../services/dataService'
import { formatDateTimeFull, formatPrice } from '../utils/helpers'
import { RAZORPAY_KEY } from '../utils/constants'
import './pages.css'

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function RideDetailsPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [ride, setRide] = useState(null)
  const [loading, setLoading] = useState(true)
  const [seats, setSeats] = useState(1)
  const [payMethod, setPayMethod] = useState('upi')
  const [booking, setBooking] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    getRideById(id).then(r => { setRide(r); setLoading(false) })
  }, [id])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
        <div className="spinner spinner-brand" style={{ width: 28, height: 28, margin: '0 auto 12px' }} />
        Loading ride…
      </div>
    )
  }

  if (!ride) {
    return (
      <div className="empty-state" style={{ marginTop: 40 }}>
        <div className="empty-state-emoji">😕</div>
        <h3>Ride not found</h3>
        <p>This ride may have been removed</p>
        <button className="btn btn-brand" onClick={() => navigate('/dashboard')}>Go Home</button>
      </div>
    )
  }

  const driver = ride.driver || {}
  const available = ride.available_seats || 0
  const isOwn = ride.driver_id === user?.id
  const total = (ride.price_per_seat || 0) * seats
  const isWomen = ride.is_women_only

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function createBooking(paymentId, status) {
    setBooking(true)
    try {
      await supabase.from('bookings').insert({
        ride_id: ride.id,
        passenger_id: user.id,
        seats_booked: seats,
        total_paid: total,
        razorpay_order_id: paymentId,
        payment_status: status === 'cash' ? 'cash' : 'paid',
        payment_method: payMethod,
      })
      await supabase.from('rides').update({
        available_seats: available - seats,
      }).eq('id', ride.id)

      showToast('Booking confirmed! 🎉')
      setTimeout(() => navigate('/my-rides'), 1500)
    } catch (e) {
      showToast('Booking failed: ' + e.message, 'error')
    } finally {
      setBooking(false)
    }
  }

  async function handleBook() {
    if (payMethod === 'cash') {
      createBooking('cash', 'cash')
    } else {
      setBooking(true)
      const isLoaded = await loadRazorpayScript()
      setBooking(false)
      
      if (!isLoaded) {
        showToast('Failed to load payment gateway. Please check your connection or try Cash.', 'error')
        return
      }

      // Razorpay JS checkout
      const options = {
        key: RAZORPAY_KEY,
        amount: Math.round(total * 100),
        currency: 'INR',
        name: 'RideZipp',
        description: `${ride.source} → ${ride.destination} (${seats} seat${seats > 1 ? 's' : ''})`,
        prefill: { email: user?.email || '' },
        theme: { color: '#6366F1' },
        handler: function (response) {
          createBooking(response.razorpay_payment_id || 'unknown', 'paid')
        },
      }
      try {
        const rzp = new window.Razorpay(options)
        rzp.on('payment.failed', function (response) {
          showToast('Payment failed: ' + (response.error?.description || 'Unknown error'), 'error')
        })
        rzp.open()
      } catch {
        showToast('Payment gateway not available. Try Cash instead.', 'error')
      }
    }
  }

  return (
    <div className="page-enter">
      <button className="btn btn-ghost" onClick={() => navigate(-1)}
        style={{ marginBottom: 16, gap: 4, padding: '8px 4px' }}>
        <span className="material-icons" style={{ fontSize: 20 }}>arrow_back</span> Back
      </button>

      <h1 style={{ fontSize: 'var(--text-5xl)', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 24 }}>Ride Details</h1>

      {/* Route Card */}
      <div className="detail-section">
        <div className="detail-card detail-route-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--brand-1)' }} />
              <div style={{ width: 2, height: 28, background: 'var(--border)', margin: '2px 0' }} />
              <span className="material-icons" style={{ fontSize: 12, color: 'var(--red)' }}>location_on</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 'var(--text-4xl)', fontWeight: 900, marginBottom: 6 }}>{ride.source}</div>
              <div style={{ height: 10 }} />
              <div style={{ fontSize: 'var(--text-4xl)', fontWeight: 900 }}>{ride.destination}</div>
            </div>
          </div>
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
            <span className="material-icons" style={{ fontSize: 16, color: 'var(--brand-1)' }}>schedule</span>
            {formatDateTimeFull(ride.departure_time)}
          </div>
          {isWomen && (
            <div style={{ marginTop: 10 }}>
              <span className="badge badge-pink">
                <span className="material-icons" style={{ fontSize: 13 }}>female</span> Women Only
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Driver Card */}
      <div className="detail-section">
        <div className="detail-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="avatar avatar-md" style={{ background: 'var(--indicator-bg)' }}>
              {driver.profile_photo_url ? (
                <img src={driver.profile_photo_url} alt="" />
              ) : (
                <span className="material-icons" style={{ fontSize: 24, color: 'var(--brand-1)' }}>person</span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>{driver.full_name || 'Loading…'}</div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Driver</div>
            </div>
            {driver.rating > 0 && (
              <div style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', background: 'var(--amber-light)', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="material-icons" style={{ fontSize: 14, color: 'var(--amber-dark)' }}>star</span>
                <span style={{ fontWeight: 800, color: 'var(--amber-dark)' }}>{Number(driver.rating).toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="detail-section">
        <div className="detail-card">
          <div className="detail-row">
            <div className="detail-row-icon"><span className="material-icons">currency_rupee</span></div>
            <div className="detail-row-label">Price / Seat</div>
            <div className="detail-row-value">{formatPrice(ride.price_per_seat)}</div>
          </div>
          <div className="detail-row">
            <div className="detail-row-icon"><span className="material-icons">event_seat</span></div>
            <div className="detail-row-label">Available Seats</div>
            <div className="detail-row-value">{available} / {ride.total_seats}</div>
          </div>
          <div className="detail-row">
            <div className="detail-row-icon"><span className="material-icons">{ride.total_seats === 2 ? 'motorcycle' : 'directions_car'}</span></div>
            <div className="detail-row-label">Vehicle</div>
            <div className="detail-row-value">{ride.vehicle_model || 'N/A'}</div>
          </div>
          <div className="detail-row">
            <div className="detail-row-icon"><span className="material-icons">pin</span></div>
            <div className="detail-row-label">Number</div>
            <div className="detail-row-value">{ride.vehicle_number || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Booking Section */}
      {!isOwn && available > 0 ? (
        <div className="detail-section">
          <div className="detail-card booking-panel">
            {/* Seats */}
            <div className="booking-row">
              <label>Seats</label>
              <div className="stepper">
                <button type="button" className="stepper-btn" disabled={seats <= 1}
                  onClick={() => setSeats(seats - 1)}>−</button>
                <span className="stepper-num">{seats}</span>
                <button type="button" className="stepper-btn" disabled={seats >= available}
                  onClick={() => setSeats(seats + 1)}>+</button>
              </div>
            </div>

            <div style={{ height: 1, background: 'var(--divider)', margin: '4px 0 16px' }} />

            {/* Payment Method */}
            <div className="booking-row">
              <label>Pay via</label>
              <div className="pay-toggle">
                <button type="button" className={`pay-btn ${payMethod === 'upi' ? 'active' : ''}`}
                  onClick={() => setPayMethod('upi')}>
                  <span className="material-icons" style={{ fontSize: 16 }}>account_balance</span> UPI
                </button>
                <button type="button" className={`pay-btn ${payMethod === 'cash' ? 'active' : ''}`}
                  onClick={() => setPayMethod('cash')}>
                  <span className="material-icons" style={{ fontSize: 16 }}>money</span> Cash
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="booking-total">
              <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-base)' }}>Total</span>
              <span className="booking-sum">{formatPrice(total)}</span>
            </div>

            <button className="btn btn-brand-lg" style={{ width: '100%' }}
              disabled={booking} onClick={handleBook}>
              {booking ? (
                <><span className="spinner" /> Processing…</>
              ) : (
                <>
                  <span className="material-icons" style={{ fontSize: 18 }}>{payMethod === 'upi' ? 'payment' : 'check_circle'}</span>
                  {payMethod === 'upi' ? `Pay ${formatPrice(total)} via UPI` : `Book — Pay ${formatPrice(total)} Cash`}
                </>
              )}
            </button>
          </div>
        </div>
      ) : isOwn ? (
        <div className="status-card" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <span className="material-icons" style={{ color: 'var(--brand-1)' }}>info</span>
          <span>This is your ride.</span>
        </div>
      ) : (
        <div className="status-card" style={{ background: 'var(--red-light)', border: '1px solid #FECACA' }}>
          <span className="material-icons" style={{ color: 'var(--red)' }}>error_outline</span>
          <span>No seats available.</span>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            <span className="material-icons" style={{ fontSize: 18 }}>{toast.type === 'success' ? 'check_circle' : 'error'}</span>
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  )
}
