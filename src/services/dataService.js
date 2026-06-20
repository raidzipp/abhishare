// ═══════════════════════════════════════════════════
// RideZipp Data Service — Port of mobile DataService + CacheService
// ═══════════════════════════════════════════════════

import { supabase } from '../supabaseClient'

const CACHE_PREFIX = 'rz_'
const STALE_MS = 5 * 60 * 1000 // 5 min

// ── Cache helpers ──
function cacheSet(key, data) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ ts: Date.now(), data }))
  } catch { /* quota exceeded, ignore */ }
}

function cacheGet(key, maxAge = STALE_MS) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key)
    if (!raw) return null
    const { ts, data } = JSON.parse(raw)
    if (Date.now() - ts > maxAge) return null
    return data
  } catch { return null }
}

function cacheClear() {
  Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX)).forEach(k => localStorage.removeItem(k))
}

// ── Profile ──
export async function getProfile(forceRefresh = false) {
  if (!forceRefresh) {
    const cached = cacheGet('profile')
    if (cached) return cached
  }

  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, rating, profile_photo_url, gender, bio, phone_number, role, is_verified, is_blocked, date_of_birth, profile_completed')
    .eq('id', user.id)
    .maybeSingle()

  if (data) cacheSet('profile', data)
  return data
}

// ── Recommended Rides (Home) ──
export async function getRecommendedRides(forceRefresh = false) {
  if (!forceRefresh) {
    const cached = cacheGet('recommended_rides')
    if (cached) return cached
  }

  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  const now = new Date().toISOString()
  let query = supabase
    .from('rides')
    .select(`
      id, source, destination, departure_time, price_per_seat,
      available_seats, is_women_only, driver_id, status, total_seats,
      vehicle_model, vehicle_number,
      driver:profiles!rides_driver_id_fkey(id, full_name, rating, profile_photo_url, gender)
    `)
    .eq('status', 'active')
    .gt('departure_time', now)
    .gt('available_seats', 0)

  if (user) query = query.neq('driver_id', user.id)

  const { data, error } = await query.order('departure_time').limit(20)
  if (error) {
    console.error('Error fetching recommended rides:', error)
    return cacheGet('recommended_rides') || []
  }

  const fresh = data || []
  cacheSet('recommended_rides', fresh)
  return fresh
}

// ── My Bookings ──
export async function getMyBookings(forceRefresh = false) {
  if (!forceRefresh) {
    const cached = cacheGet('my_bookings')
    if (cached) return cached
  }

  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) return []

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      id, ride_id, seats_booked, total_paid, payment_status, payment_method, created_at,
      ride:rides(id, source, destination, departure_time, price_per_seat, available_seats, status, total_seats)
    `)
    .eq('passenger_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching bookings:', error)
    return cacheGet('my_bookings') || []
  }

  const fresh = data || []
  cacheSet('my_bookings', fresh)
  return fresh
}

// ── My Posted Rides ──
export async function getMyPostedRides(forceRefresh = false) {
  if (!forceRefresh) {
    const cached = cacheGet('my_posted_rides')
    if (cached) return cached
  }

  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) return []

  const { data, error } = await supabase
    .from('rides')
    .select('id, source, destination, departure_time, price_per_seat, available_seats, total_seats, status, vehicle_model, vehicle_number, is_women_only, created_at')
    .eq('driver_id', user.id)
    .order('departure_time', { ascending: false })

  if (error) {
    console.error('Error fetching posted rides:', error)
    return cacheGet('my_posted_rides') || []
  }

  const fresh = data || []
  cacheSet('my_posted_rides', fresh)
  return fresh
}

// ── Search Rides ──
export async function searchRides({ from, to } = {}) {
  let query = supabase
    .from('rides')
    .select(`
      id, source, destination, departure_time, price_per_seat,
      available_seats, is_women_only, driver_id, status, total_seats,
      vehicle_model, vehicle_number,
      driver:profiles!rides_driver_id_fkey(full_name, rating, gender, profile_photo_url)
    `)
    .eq('status', 'active')
    .gt('available_seats', 0)

  if (from) query = query.ilike('source', `%${from}%`)
  if (to) query = query.ilike('destination', `%${to}%`)

  const { data, error } = await query.order('departure_time').limit(50)
  if (error) { console.error('Search error:', error); return [] }
  return data || []
}

// ── Get User Cars ──
export async function getUserCars(forceRefresh = false) {
  if (!forceRefresh) {
    const cached = cacheGet('user_cars')
    if (cached) return cached
  }

  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) return []

  const { data } = await supabase
    .from('cars')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  if (data) cacheSet('user_cars', data)
  return data || []
}

// ── Ride by ID ──
export async function getRideById(id) {
  // Always fetch fresh for a single ride details
  const { data } = await supabase
    .from('rides')
    .select(`
      *,
      driver:profiles!rides_driver_id_fkey(id, full_name, rating, profile_photo_url, gender, is_verified, phone_number)
    `)
    .eq('id', id)
    .maybeSingle()
  return data
}

// ── Booking Stats ──
export async function getBookingStats(forceRefresh = false) {
  if (!forceRefresh) {
    const cached = cacheGet('booking_stats')
    if (cached) return cached
  }

  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) return { ridesBooked: 0, amountSpent: 0 }

  const { data } = await supabase
    .from('bookings')
    .select('total_paid')
    .eq('passenger_id', user.id)

  const bookings = data || []
  const stats = {
    ridesBooked: bookings.length,
    amountSpent: bookings.reduce((sum, b) => sum + (Number(b.total_paid) || 0), 0),
  }
  cacheSet('booking_stats', stats)
  return stats
}

// ── Logout ──
export async function logout() {
  cacheClear()
  try {
    await supabase.auth.signOut()
  } catch (err) {
    console.error('Logout error:', err)
  }
}

export { cacheClear }
