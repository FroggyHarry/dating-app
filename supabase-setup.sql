-- ==========================================
-- 约会预约系统 — Supabase 建表 SQL
-- 在 Supabase SQL Editor 中运行这段脚本
-- ==========================================

-- 1. 时间段表
CREATE TABLE time_slots (
  id SERIAL PRIMARY KEY,
  hour INT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  group_label TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- 初始时间段数据 (12:00 ~ 凌晨2:00)
INSERT INTO time_slots (hour, label, group_label, is_active) VALUES
  (12, '12:00', '中午', true),
  (13, '13:00', '下午', true),
  (14, '14:00', '下午', true),
  (15, '15:00', '下午', true),
  (16, '16:00', '下午', true),
  (17, '17:00', '下午', true),
  (18, '18:00', '晚上', true),
  (19, '19:00', '晚上', true),
  (20, '20:00', '晚上', true),
  (21, '21:00', '晚上', true),
  (22, '22:00', '晚上', true),
  (23, '23:00', '晚上', true),
  (0, '0:00', '凌晨', true),
  (1, '1:00', '凌晨', true),
  (2, '2:00', '凌晨', true);

-- 2. 活动表
CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  emoji TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true
);

INSERT INTO activities (key, label, emoji, is_active) VALUES
  ('karting', '开卡丁车', '🏎️', true),
  ('movie', '看电影', '🎬', true),
  ('drink', '小酌', '🥂', true),
  ('cage_fight', '八角笼', '🥊', true),
  ('escape_room', '密室逃脱', '🔐', true),
  ('gaming', '打游戏', '🎮', true);

-- 3. 菜系表
CREATE TABLE cuisines (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  emoji TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true
);

INSERT INTO cuisines (key, label, emoji, is_active) VALUES
  ('chinese', '中餐', '🥡', true),
  ('japanese', '日料', '🍣', true),
  ('korean', '韩餐', '🥩', true),
  ('western', '西餐', '🍝', true),
  ('hotpot', '火锅', '🍲', true),
  ('bbq', '烧烤', '🍖', true);

-- 4. 预约记录表
CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  date TEXT NOT NULL,
  time_slot TEXT NOT NULL,
  activity TEXT NOT NULL,
  cuisine TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 设置表（存后台密码等）
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO settings (key, value) VALUES ('admin_password', 'frog123');

-- ========== 安全策略：允许前端匿名读写 ==========
-- 生产环境建议开启 RLS 并做限制，
-- 但这是个人项目，保持简单

ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuisines ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 允许匿名读取所有表
CREATE POLICY "anon_read_time_slots" ON time_slots FOR SELECT USING (true);
CREATE POLICY "anon_read_activities" ON activities FOR SELECT USING (true);
CREATE POLICY "anon_read_cuisines" ON cuisines FOR SELECT USING (true);
CREATE POLICY "anon_read_appointments" ON appointments FOR SELECT USING (true);
CREATE POLICY "anon_read_settings" ON settings FOR SELECT USING (true);

-- 允许匿名写入 appointments
CREATE POLICY "anon_insert_appointments" ON appointments FOR INSERT WITH CHECK (true);

-- 允许匿名更新 settings（用于改密码）
CREATE POLICY "anon_update_settings" ON settings FOR UPDATE USING (true) WITH CHECK (true);
