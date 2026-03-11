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
  const roleFetched = useRef(false)
  const processingRef = useRef(false)
  const loadingResolved = useRef(false)

  useEffect(() => {
    if (!supabaseReady) {
      setLoading(false)
      loadingResolved.current = true
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

    // セッションを処理する共通関数（一括state更新）
    async function processSession(sessionUser) {
      const u = sessionUser ?? null
      const newId = u?.id ?? null

      // 同じユーザーで既にrole取得済みなら何もしない
      if (newId && newId === currentUserId.current && roleFetched.current) {
        if (!loadingResolved.current) {
          loadingResolved.current = true
          setLoading(false)
        }
        return
      }

      // 処理中ロック: 二重実行を防止（fetchRole中にonAuthStateChangeが発火するケース）
      if (processingRef.current) return
      processingRef.current = true

      currentUserId.current = newId

      if (u) {
        const r = await fetchRole(u.id)
        roleFetched.current = true
        // 一括更新: user + role + loading を同じタイミングで
        setUser(u)
        setRole(r)
      } else {
        roleFetched.current = false
        setUser(null)
        setRole(null)
      }
      loadingResolved.current = true
      setLoading(false)
      processingRef.current = false
    }

    // 初回セッション取得（5秒タイムアウト付き）
    const timeout = setTimeout(() => {
      loadingResolved.current = true
      setLoading(false)
    }, 5000)

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      clearTimeout(timeout)
      await processSession(session?.user)
    }).catch((e) => {
      clearTimeout(timeout)
      setAuthError(`Auth init: ${e.message}`)
      loadingResolved.current = true
      setLoading(false)
    })

    // ログイン/ログアウトイベントのみ監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // INITIAL_SESSION は getSession で処理済み
        if (event === 'INITIAL_SESSION') return

        // TOKEN_REFRESHED は同一ユーザーなので常にスキップ
        if (event === 'TOKEN_REFRESHED') return

        const u = session?.user ?? null
        const newId = u?.id ?? null

        // 同じユーザーのイベントは全て無視（SIGNED_IN等）
        if (newId && newId === currentUserId.current && roleFetched.current) return

        // ユーザーが変わった場合のみ処理（ログイン/ログアウト）
        await processSession(u)
      }
    )

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  const signOut = useCallback(async () => {
    currentUserId.current = null
    roleFetched.current = false
    setUser(null)
    setRole(null)
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
