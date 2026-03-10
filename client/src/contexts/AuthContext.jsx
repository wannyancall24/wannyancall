import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, supabaseReady } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchRole = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()
      if (error) {
        console.warn('fetchRole error:', error.message)
        return null
      }
      return data?.role ?? null
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    if (!supabaseReady) {
      setLoading(false)
      return
    }

    let isMounted = true

    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!isMounted) return
        const currentUser = session?.user ?? null
        setUser(currentUser)
        if (currentUser) {
          const r = await fetchRole(currentUser.id)
          if (isMounted) setRole(r)
        }
      } catch (e) {
        console.error('Auth init error:', e)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return
        const currentUser = session?.user ?? null
        setUser(currentUser)
        if (currentUser) {
          const r = await fetchRole(currentUser.id)
          if (isMounted) setRole(r)
        } else {
          setRole(null)
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [fetchRole])

  const signOut = useCallback(async () => {
    if (!supabaseReady) return
    await supabase.auth.signOut()
    setUser(null)
    setRole(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
