-- ============================================
-- consultations テーブルに報酬関連カラムを追加
-- Supabase Dashboard > SQL Editor で実行してください
-- ============================================

-- 動物種別（dogcat or exotic）
ALTER TABLE public.consultations
  ADD COLUMN IF NOT EXISTS animal_type text DEFAULT 'dogcat';

-- 指名料（0 or 500）
ALTER TABLE public.consultations
  ADD COLUMN IF NOT EXISTS nomination_fee integer DEFAULT 0;

-- 獣医師報酬額（計算済み）
ALTER TABLE public.consultations
  ADD COLUMN IF NOT EXISTS vet_reward_amount integer DEFAULT 0;

-- 夜間/深夜加算額
ALTER TABLE public.consultations
  ADD COLUMN IF NOT EXISTS time_fee integer DEFAULT 0;
