-- vetsテーブルにプロフィール項目を追加
-- Supabase SQL Editor で実行してください

ALTER TABLE public.vets ADD COLUMN IF NOT EXISTS experience integer;
ALTER TABLE public.vets ADD COLUMN IF NOT EXISTS hospital text;
ALTER TABLE public.vets ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.vets ADD COLUMN IF NOT EXISTS career text;
