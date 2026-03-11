-- vetsテーブルを誰でも閲覧可能にする（RLS修正）
-- スマホで0名表示される問題の修正
-- Supabase SQL Editor で実行してください

-- RLS有効化（既に有効でも安全）
ALTER TABLE public.vets ENABLE ROW LEVEL SECURITY;

-- 既存のSELECTポリシーを全て削除して再作成
DROP POLICY IF EXISTS "Anyone can view vets" ON public.vets;
DROP POLICY IF EXISTS "Public read vets" ON public.vets;
DROP POLICY IF EXISTS "vets_select" ON public.vets;
DROP POLICY IF EXISTS "allow_select_vets" ON public.vets;

-- 未ログイン（anon）含め全員が閲覧可能
CREATE POLICY "Anyone can view vets"
  ON public.vets FOR SELECT
  USING (true);

-- 確認用: テーブルのポリシー一覧
-- SELECT policyname, permissive, roles, cmd, qual
-- FROM pg_policies WHERE tablename = 'vets';
