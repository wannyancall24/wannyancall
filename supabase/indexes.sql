-- パフォーマンス改善用インデックス
-- Supabase SQL Editor で実行してください
-- 既に存在するインデックスはスキップされます

-- vets テーブル
CREATE INDEX IF NOT EXISTS idx_vets_is_online ON public.vets(is_online);
CREATE INDEX IF NOT EXISTS idx_vets_rating ON public.vets(rating DESC);
CREATE INDEX IF NOT EXISTS idx_vets_night_ok ON public.vets(night_ok) WHERE night_ok = true;
CREATE INDEX IF NOT EXISTS idx_vets_auth_id ON public.vets(auth_id);

-- profiles テーブル
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- consultations テーブル
CREATE INDEX IF NOT EXISTS idx_consultations_user_id ON public.consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_vet_id ON public.consultations(vet_id);
CREATE INDEX IF NOT EXISTS idx_consultations_created_at ON public.consultations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON public.consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_user_created ON public.consultations(user_id, created_at DESC);

-- chat_rooms テーブル
CREATE INDEX IF NOT EXISTS idx_chat_rooms_user_id ON public.chat_rooms(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_vet_id ON public.chat_rooms(vet_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_status ON public.chat_rooms(status);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_consultation ON public.chat_rooms(consultation_id);

-- messages テーブル
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON public.messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_room_created ON public.messages(room_id, created_at);
