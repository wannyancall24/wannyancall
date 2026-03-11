import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

const isConfigured = !!(supabaseUrl && supabaseAnonKey
  && !supabaseUrl.includes('placeholder')
  && supabaseUrl.startsWith('https://'))

export const supabaseDebugInfo = {
  urlSet: !!supabaseUrl,
  urlPrefix: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : '(empty)',
  keySet: !!supabaseAnonKey,
  keyLength: supabaseAnonKey.length,
  isConfigured,
}

// スマホブラウザ対応: データ取得のみタイムアウト付き（認証リクエストは除外）
function createFetchWithTimeout(timeoutMs = 15000) {
  return (url, options = {}) => {
    // 認証エンドポイントはタイムアウトを適用しない（セッション保持に必要）
    const isAuthRequest = typeof url === 'string' && url.includes('/auth/')
    // 既にsignalが設定されている場合はそのまま使う（Supabase内部のAbortControllerと衝突防止）
    if (isAuthRequest || options.signal) {
      return fetch(url, options)
    }
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeoutMs)
    return fetch(url, {
      ...options,
      signal: controller.signal,
    }).finally(() => clearTimeout(id))
  }
}

// 環境変数が未設定の場合でもクラッシュしないようダミークライアントを作成
export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        fetch: createFetchWithTimeout(15000),
      },
      realtime: {
        params: { eventsPerSecond: 1 },
      },
      auth: {
        storageKey: 'wannyancall-auth',
        storage: window.localStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : createClient('https://placeholder.supabase.co', 'placeholder-key')

export const supabaseReady = isConfigured
