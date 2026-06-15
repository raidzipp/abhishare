// ═══════════════════════════════════════════════════
// RideZipp Helpers — Matches mobile_app logic
// ═══════════════════════════════════════════════════

export function getGreeting() {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'Good Morning 🌅'
  if (h >= 12 && h < 17) return 'Good Afternoon ☀️'
  return 'Good Evening 🌙'
}

export function formatTime(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)
  const dDay = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const time = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })

  if (dDay.getTime() === today.getTime()) return `Today, ${time}`
  if (dDay.getTime() === tomorrow.getTime()) return `Tomorrow, ${time}`
  const dateStr = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
  return `${dateStr}, ${time}`
}

export function formatDate(isoStr) {
  if (!isoStr) return 'N/A'
  const d = new Date(isoStr)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateTimeFull(isoStr) {
  if (!isoStr) return 'N/A'
  const d = new Date(isoStr)
  return d.toLocaleDateString('en-IN', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
  }) + ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

export function formatPrice(n) {
  if (n == null) return '₹0'
  return `₹${Number(n).toLocaleString('en-IN')}`
}

export function calculateAge(dob) {
  if (!dob) return null
  const d = new Date(dob)
  const now = new Date()
  let age = now.getFullYear() - d.getFullYear()
  if (now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) {
    age--
  }
  return age
}

export function getInitial(name) {
  if (!name) return 'U'
  return name.trim().charAt(0).toUpperCase()
}

export function getFirstName(fullName) {
  if (!fullName) return 'there'
  const first = fullName.split(' ')[0]
  return first || 'there'
}

export function isRideFuture(departureTime) {
  if (!departureTime) return false
  const dt = new Date(departureTime)
  const buffer = new Date(); buffer.setHours(buffer.getHours() - 1)
  return dt > buffer
}

export function isRideActive(ride) {
  const status = (ride?.status || 'active').toLowerCase()
  return !['completed', 'cancelled', 'failed'].includes(status) && isRideFuture(ride?.departure_time)
}

export function getRideStatusLabel(ride) {
  const dt = new Date(ride?.departure_time || '')
  const isPast = dt < new Date()
  if (isPast) return { label: 'Completed', variant: 'grey' }
  const status = ride?.status || 'active'
  if (status === 'active') return { label: 'Active', variant: 'green' }
  if (status === 'cancelled') return { label: 'Cancelled', variant: 'red' }
  return { label: status.toUpperCase(), variant: 'amber' }
}

export function downloadCSV(rows, filename = 'export.csv') {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${r[h] ?? ''}"`).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}
