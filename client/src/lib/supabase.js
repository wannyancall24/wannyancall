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

// 環境変数が未設定の場合でもクラッシュしないようダミークライアントを作成
export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key')

export const supabaseReady = isConfigured
