import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, supabaseReady } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabaseReady) { setLoading(false); return }
    let mounted = true
    const timeout = setTimeout(() => { if (mounted) setLoading(false) }, 3000)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      if (event === 'INITIAL_SESSION') {
        const u = session?.user ?? null
        setUser(u)
        clearTimeout(timeout)
        setLoading(false)
        if (u) fetchProfile(u.id).then(p => { if (mounted) { setRole(p?.role ?? null); setIsAdmin(p?.is_admin ?? false) } })
      } else if (event === 'SIGNED_IN') {
        const u = session?.user ?? null
        setUser(u)
        if (u) fetchProfile(u.id).then(p => { if (mounted) { setRole(p?.role ?? null); setIsAdmin(p?.is_admin ?? false) } })
      } else if (event === 'SIGNED_OUT') {
        setUser(null); setRole(null); setIsAdmin(false)
      }
    })
    return () => { mounted = false; clearTimeout(timeout); subscription.unsubscribe() }
  }, [])

  const signOut = useCallback(async () => {
    setUser(null); setRole(null); setIsAdmin(false)
    if (supabaseReady) { try { await supabase.auth.signOut() } catch {} }
  }, [])

  return (
    <AuthContext.Provider value={{ user, role, isAdmin, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

async function fetchProfile(userId) {
  try {
    const { data, error } = await supabase.from('profiles').select('role,is_admin').eq('id', userId).single()
    if (error) return null
    return data
  } catch { return null }
}

export function useAuth() { return useContext(AuthContext) }
