-- RLS一時無効化（デバッグ用）
-- 動作確認後、必ず rls_fix.sql で再有効化してください

ALTER TABLE public.vets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations DISABLE ROW LEVEL SECURITY;
