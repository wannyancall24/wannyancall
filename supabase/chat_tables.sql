-- チャット機能用テーブル
-- Supabase SQL Editor で実行してください

-- チャットルーム
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  consultation_id bigint REFERENCES public.consultations(id),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  vet_id integer NOT NULL REFERENCES public.vets(id),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  payment_intent_id text,
  total_amount integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- メッセージ
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id),
  sender_role text NOT NULL CHECK (sender_role IN ('user', 'vet')),
  content text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON public.messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(room_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_user_id ON public.chat_rooms(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_vet_id ON public.chat_rooms(vet_id);

-- RLS有効化
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- chat_rooms: 参加者のみアクセス可能
CREATE POLICY "chat_rooms_select" ON public.chat_rooms
  FOR SELECT USING (
    auth.uid() = user_id
    OR auth.uid() IN (SELECT auth_id FROM public.vets WHERE id = vet_id)
  );

CREATE POLICY "chat_rooms_insert" ON public.chat_rooms
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "chat_rooms_update" ON public.chat_rooms
  FOR UPDATE USING (
    auth.uid() = user_id
    OR auth.uid() IN (SELECT auth_id FROM public.vets WHERE id = vet_id)
  );

-- messages: ルーム参加者のみ閲覧・送信可能
CREATE POLICY "messages_select" ON public.messages
  FOR SELECT USING (
    room_id IN (
      SELECT id FROM public.chat_rooms
      WHERE user_id = auth.uid()
        OR vet_id IN (SELECT v.id FROM public.vets v WHERE v.auth_id = auth.uid())
    )
  );

CREATE POLICY "messages_insert" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND room_id IN (
      SELECT id FROM public.chat_rooms
      WHERE user_id = auth.uid()
        OR vet_id IN (SELECT v.id FROM public.vets v WHERE v.auth_id = auth.uid())
    )
  );

-- Realtime有効化
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
