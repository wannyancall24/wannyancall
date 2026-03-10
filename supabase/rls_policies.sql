-- ============================================
-- RLS (Row Level Security) Policies
-- Supabase Dashboard > SQL Editor で実行してください
-- ============================================

-- ── profiles テーブル ──
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- 自分のプロフィールのみ閲覧可能
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- 自分のプロフィールのみ更新可能
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- サインアップ時に自分のプロフィールを作成可能
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);


-- ── vets テーブルに auth_id カラムを追加（auth.uid() との紐付け用） ──
-- 既にある場合はスキップされます
ALTER TABLE public.vets ADD COLUMN IF NOT EXISTS auth_id uuid REFERENCES auth.users(id);


-- ── consultations テーブル ──
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own consultations" ON public.consultations;
DROP POLICY IF EXISTS "Users can insert own consultations" ON public.consultations;
DROP POLICY IF EXISTS "Users can update own consultations" ON public.consultations;
DROP POLICY IF EXISTS "Vets can view assigned consultations" ON public.consultations;
DROP POLICY IF EXISTS "Vets can update assigned consultations" ON public.consultations;

-- 飼い主: 自分の相談のみ閲覧可能
CREATE POLICY "Users can view own consultations"
  ON public.consultations FOR SELECT
  USING (auth.uid() = user_id);

-- 飼い主: 自分の相談を作成可能
CREATE POLICY "Users can insert own consultations"
  ON public.consultations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 飼い主: 自分の相談のみ更新可能
CREATE POLICY "Users can update own consultations"
  ON public.consultations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 獣医師: 担当の相談を閲覧可能（vets.auth_id 経由で照合）
CREATE POLICY "Vets can view assigned consultations"
  ON public.consultations FOR SELECT
  USING (
    vet_id IN (SELECT id FROM public.vets WHERE auth_id = auth.uid())
  );

-- 獣医師: 担当の相談を更新可能（vets.auth_id 経由で照合）
CREATE POLICY "Vets can update assigned consultations"
  ON public.consultations FOR UPDATE
  USING (
    vet_id IN (SELECT id FROM public.vets WHERE auth_id = auth.uid())
  )
  WITH CHECK (
    vet_id IN (SELECT id FROM public.vets WHERE auth_id = auth.uid())
  );
