import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 環境変数が未設定の場合はダミーのクライアントを返す（アプリのクラッシュを防ぐ）
const isConfigured = supabaseUrl && supabaseAnonKey

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key')

export const supabaseReady = isConfigured
