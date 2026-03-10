-- ============================================
-- RLS ポリシー修正
-- vetsテーブルの公開閲覧を明示的に許可
-- Supabase Dashboard > SQL Editor で実行してください
-- ============================================

-- ── vets テーブル: 誰でも閲覧可能にする ──
ALTER TABLE public.vets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view vets" ON public.vets;

-- 未ログインユーザー（anon）含め全員が閲覧可能
CREATE POLICY "Anyone can view vets"
  ON public.vets FOR SELECT
  USING (true);


-- ── profiles テーブル: 既存ポリシーの再確認 ──
-- （既に設定済みの場合はDROPしてから再作成）
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);


-- ── consultations テーブル: 既存ポリシーの再確認 ──
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own consultations" ON public.consultations;
DROP POLICY IF EXISTS "Users can insert own consultations" ON public.consultations;
DROP POLICY IF EXISTS "Users can update own consultations" ON public.consultations;
DROP POLICY IF EXISTS "Vets can view assigned consultations" ON public.consultations;
DROP POLICY IF EXISTS "Vets can update assigned consultations" ON public.consultations;

CREATE POLICY "Users can view own consultations"
  ON public.consultations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consultations"
  ON public.consultations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own consultations"
  ON public.consultations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Vets can view assigned consultations"
  ON public.consultations FOR SELECT
  USING (
    vet_id IN (SELECT id FROM public.vets WHERE auth_id = auth.uid())
  );

CREATE POLICY "Vets can update assigned consultations"
  ON public.consultations FOR UPDATE
  USING (
    vet_id IN (SELECT id FROM public.vets WHERE auth_id = auth.uid())
  )
  WITH CHECK (
    vet_id IN (SELECT id FROM public.vets WHERE auth_id = auth.uid())
  );
