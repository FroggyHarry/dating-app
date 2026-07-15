-- ==========================================
-- 在 Supabase SQL Editor 中运行
-- ==========================================

-- 1. appointments 加 IP 和位置字段
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS ip_address TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS location TEXT;

-- 2. 按日期时段表
CREATE TABLE IF NOT EXISTS availability (
  id SERIAL PRIMARY KEY,
  date TEXT NOT NULL,
  hour INT NOT NULL,
  is_available BOOLEAN DEFAULT true,
  UNIQUE(date, hour)
);

-- 3. 从 time_slots 复制默认数据到最近 30 天
DO $$
DECLARE
  d DATE;
  r RECORD;
BEGIN
  FOR d IN SELECT generate_series(CURRENT_DATE, CURRENT_DATE + 30, '1 day'::interval)::date
  LOOP
    FOR r IN SELECT hour, is_active FROM time_slots
    LOOP
      INSERT INTO availability (date, hour, is_available)
      VALUES (d::text, r.hour, r.is_active)
      ON CONFLICT (date, hour) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- 4. 权限
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "anon_read_availability" ON availability FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "anon_insert_availability" ON availability FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "anon_update_availability" ON availability FOR UPDATE USING (true) WITH CHECK (true);
