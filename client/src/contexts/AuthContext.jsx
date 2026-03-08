import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null) // 'owner' | 'vet' | null
  const [loading, setLoading] = useState(true)

  async function fetchRole(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    return data?.role ?? null
  }

  useEffect(() => {
    // 初期セッション確認
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const r = await fetchRole(session.user.id)
        setRole(r)
      }
      setLoading(false)
    })

    // 認証状態の変化を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const r = await fetchRole(session.user.id)
        setRole(r)
      } else {
        setRole(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setRole(null)
  }

  return (
    <AuthContext.Provider value={{ user, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
