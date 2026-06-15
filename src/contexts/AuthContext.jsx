// ═══════════════════════════════════════════════════
// RideZipp Auth Context — Profile check + auth state
// Mirrors mobile's AuthGate logic from main.dart
// ═══════════════════════════════════════════════════

import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { getProfile, cacheClear } from '../services/dataService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileComplete, setProfileComplete] = useState(false)

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile()
      else setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (event === 'SIGNED_OUT') {
        setProfile(null)
        setProfileComplete(false)
        cacheClear()
        setLoading(false)
      } else if (session?.user) {
        await loadProfile()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile() {
    try {
      const p = await getProfile(true)
      setProfile(p)
      // Mobile AuthGate check: date_of_birth must be set
      setProfileComplete(!!p?.date_of_birth)
    } catch (err) {
      console.error('Error loading profile:', err)
    } finally {
      setLoading(false)
    }
  }

  async function refreshProfile() {
    const p = await getProfile(true)
    setProfile(p)
    setProfileComplete(!!p?.date_of_birth)
  }

  return (
    <AuthContext.Provider value={{
      user, profile, loading, profileComplete,
      refreshProfile, setProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
