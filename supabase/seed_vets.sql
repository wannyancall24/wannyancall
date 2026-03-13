-- テスト用獣医師データ 3名分
-- Supabase SQL Editor で実行してください

INSERT INTO public.vets (name, specialty, photo, rating, review_count, available_animals, night_ok, is_online, avg_response_min)
VALUES
  (
    '田中',
    '内科・皮膚科',
    '👨‍⚕️',
    4.8,
    124,
    ARRAY['犬', '猫'],
    true,
    true,
    3
  ),
  (
    '佐藤',
    '外科・整形外科',
    '👩‍⚕️',
    4.6,
    89,
    ARRAY['犬', '猫', '小動物', '鳥', 'エキゾチック'],
    false,
    true,
    5
  ),
  (
    '鈴木',
    '眼科・神経科',
    '👨‍⚕️',
    4.9,
    201,
    ARRAY['犬', '猫', '小動物', '鳥', 'エキゾチック'],
    true,
    false,
    4
  );
