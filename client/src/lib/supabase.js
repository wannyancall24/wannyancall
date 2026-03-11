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

// シンプルなSupabaseクライアント（カスタムfetchなし — 全問題の根本原因だった）
export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
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

// 汎用クエリヘルパー: タイムアウト + リトライ付き
export async function queryWithRetry(queryFn, { retries = 2, timeoutMs = 15000 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await Promise.race([
        queryFn(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('タイムアウト')), timeoutMs)
        ),
      ])
      if (result.error) throw new Error(`${result.error.message} (code: ${result.error.code})`)
      return { data: result.data, error: null }
    } catch (e) {
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, (attempt + 1) * 1500))
        continue
      }
      return { data: null, error: e.message }
    }
  }
}
