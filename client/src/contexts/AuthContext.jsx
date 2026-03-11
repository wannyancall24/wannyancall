import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { supabase, supabaseReady } from '../lib/supabase'

const AuthContext = createContext(null)

// === DEBUG: AuthContext デバッグログ（画面表示用） ===
const authDebugLog = []
const authDebugStartTime = Date.now()
function authTs() { return ((Date.now() - authDebugStartTime) / 1000).toFixed(2) + 's' }
function authLog(msg) { authDebugLog.push(`[${authTs()}] ${msg}`) }
// グローバルに公開して FindVet から参照可能に
window.__authDebugLog = authDebugLog

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)
  const initialized = useRef(false)
  const currentUserId = useRef(null)

  useEffect(() => {
    authLog(`useEffect: supabaseReady=${supabaseReady}`)

    if (!supabaseReady) {
      authLog('supabaseReady=false, setLoading(false)')
      setLoading(false)
      return
    }

    // StrictMode対策: 二重実行を防止
    if (initialized.current) {
      authLog('already initialized, skip')
      return
    }
    initialized.current = true

    async function fetchRole(userId) {
      authLog(`fetchRole: start for ${userId.slice(0,8)}`)
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single()
        authLog(`fetchRole: result=${data?.role ?? 'null'}, error=${error?.message || 'none'}`)
        if (error) return null
        return data?.role ?? null
      } catch (e) {
        authLog(`fetchRole: exception=${e.message}`)
        return null
      }
    }

    // 初回セッション取得（5秒タイムアウト付き）
    let timedOut = false
    const timeout = setTimeout(() => {
      timedOut = true
      authLog('getSession: TIMED OUT after 5s')
      setLoading(false)
    }, 5000)

    authLog('getSession: calling...')
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      clearTimeout(timeout)
      const u = session?.user ?? null
      authLog(`getSession: resolved, user=${u?.id?.slice(0,8) || 'null'}, timedOut=${timedOut}`)
      currentUserId.current = u?.id ?? null
      setUser(u)
      if (u) {
        const r = await fetchRole(u.id)
        setRole(r)
      }
      authLog('getSession: setLoading(false)')
      setLoading(false)
    }).catch((e) => {
      clearTimeout(timeout)
      authLog(`getSession: CATCH error=${e.message}`)
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
