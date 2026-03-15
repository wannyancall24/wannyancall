-- vetsテーブルに得意分野・自己紹介カラムを追加
-- Supabase SQL Editor で実行してください

ALTER TABLE vets
  ADD COLUMN IF NOT EXISTS specialties TEXT,
  ADD COLUMN IF NOT EXISTS self_introduction TEXT;

-- career カラムが存在しない場合は追加
ALTER TABLE vets
  ADD COLUMN IF NOT EXISTS career TEXT;

COMMENT ON COLUMN vets.specialties IS '得意分野（必須）';
COMMENT ON COLUMN vets.self_introduction IS '自己紹介メッセージ（任意）';
COMMENT ON COLUMN vets.career IS '経歴・職歴（必須）';
