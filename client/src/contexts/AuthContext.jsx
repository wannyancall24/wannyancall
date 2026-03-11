import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { supabase, supabaseReady } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)
  const initialized = useRef(false)
  const currentUserId = useRef(null)

  useEffect(() => {
    if (!supabaseReady) {
      setLoading(false)
      return
    }

    // StrictMode対策: 二重実行を防止
    if (initialized.current) return
    initialized.current = true

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

    // 初回セッション取得（3秒タイムアウト付き）
    let settled = false
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true
        console.warn('Auth: getSession timed out after 3s, treating as logged out')
        setLoading(false)
      }
    }, 3000)

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (settled) return // タイムアウト済みなら無視
      settled = true
      clearTimeout(timeout)
      const u = session?.user ?? null
      currentUserId.current = u?.id ?? null
      setUser(u)
      if (u) {
        const r = await fetchRole(u.id)
        setRole(r)
      }
      setLoading(false)
    }).catch((e) => {
      if (settled) return
      settled = true
      clearTimeout(timeout)
      setAuthError(`Auth init: ${e.message}`)
      setLoading(false)
    })

    // ログイン/ログアウトイベントのみ監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // INITIAL_SESSION は init() で処理済みなのでスキップ
        if (event === 'INITIAL_SESSION') return

        const u = session?.user ?? null
        const newId = u?.id ?? null

        // 同じユーザーのTOKEN_REFRESHEDは無視（不要な再レンダリング防止）
        if (event === 'TOKEN_REFRESHED' && newId === currentUserId.current) return

        currentUserId.current = newId
        setUser(u)

        if (u) {
          const r = await fetchRole(u.id)
          setRole(r)
        } else {
          setRole(null)
        }
      }
    )

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  const signOut = useCallback(async () => {
    // 先にローカル状態をクリア（画面遷移を即時反映）
    currentUserId.current = null
    setUser(null)
    setRole(null)
    // Supabaseのサインアウトは非同期で実行（ハングしても影響なし）
    if (supabaseReady) {
      try {
        await Promise.race([
          supabase.auth.signOut(),
          new Promise(resolve => setTimeout(resolve, 3000)),
        ])
      } catch {
        // サインアウトAPIが失敗してもローカルは既にクリア済み
      }
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, role, loading, authError, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
