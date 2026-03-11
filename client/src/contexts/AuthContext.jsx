import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, supabaseReady } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabaseReady) {
      setLoading(false)
      return
    }

    let mounted = true

    // 3秒で必ずloading解除（何が起きても固まらない）
    const timeout = setTimeout(() => {
      if (mounted) setLoading(false)
    }, 3000)

    // onAuthStateChange一本で管理（getSession不要）
    // INITIAL_SESSION: 起動時に必ず1回発火（セッション有無に関わらず）
    // SIGNED_IN: ログイン時
    // SIGNED_OUT: ログアウト時
    // TOKEN_REFRESHED: トークン更新（無視でOK）
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return

        if (event === 'INITIAL_SESSION') {
          const u = session?.user ?? null
          setUser(u)
          clearTimeout(timeout)
          setLoading(false)
          if (u) {
            fetchRole(u.id).then(r => { if (mounted) setRole(r) })
          }
        } else if (event === 'SIGNED_IN') {
          const u = session?.user ?? null
          setUser(u)
          if (u) {
            fetchRole(u.id).then(r => { if (mounted) setRole(r) })
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setRole(null)
        }
      }
    )

    return () => {
      mounted = false
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  const signOut = useCallback(async () => {
    setUser(null)
    setRole(null)
    if (supabaseReady) {
      try { await supabase.auth.signOut() } catch {}
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

async function fetchRole(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    if (error) return null
    return data?.role ?? null
  } catch {
    return null
  }
}

export function useAuth() {
  return useContext(AuthContext)
}
