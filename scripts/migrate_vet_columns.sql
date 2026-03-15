-- vetsテーブルにspecialtiesカラムを追加
-- Supabase SQL Editor で実行してください
-- ※ bio・career は既存カラムのため追加不要

ALTER TABLE vets
  ADD COLUMN IF NOT EXISTS specialties TEXT;

COMMENT ON COLUMN vets.specialties IS '得意分野';
