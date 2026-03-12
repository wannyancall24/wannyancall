-- profiles に is_admin カラム追加
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- profiles に is_blocked カラム追加
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_blocked boolean DEFAULT false;

-- reports テーブル
CREATE TABLE IF NOT EXISTS reports (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_id      uuid NOT NULL,
  target_type    text NOT NULL,  -- 'user' | 'vet'
  target_name    text,
  reason         text NOT NULL,
  detail         text,
  consultation_id uuid,
  status         text NOT NULL DEFAULT 'pending', -- 'pending' | 'resolved' | 'dismissed'
  admin_note     text,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "通報作成" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "自分の通報参照" ON reports FOR SELECT USING (auth.uid() = reporter_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "管理者通報更新" ON reports FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- blocked_users テーブル
CREATE TABLE IF NOT EXISTS blocked_users (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "自分のブロック参照" ON blocked_users FOR SELECT USING (auth.uid() = blocker_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "ブロック追加" ON blocked_users FOR INSERT WITH CHECK (auth.uid() = blocker_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "ブロック削除" ON blocked_users FOR DELETE USING (auth.uid() = blocker_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- 管理者によるユーザー強制削除関数
CREATE OR REPLACE FUNCTION admin_delete_user(target_user_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  DELETE FROM auth.users WHERE id = target_user_id
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true);
$$;

-- 管理者による相談強制終了関数
CREATE OR REPLACE FUNCTION admin_force_complete(room_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE chat_rooms SET status = 'completed', completed_at = now()
  WHERE id = room_id
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true);
$$;
