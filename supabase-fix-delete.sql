-- 在 Supabase SQL Editor 中运行

-- 1. 确保 appointments 有 IP 和位置字段
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS ip_address TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS location TEXT;

-- 2. 给 appointments 加删除权限（修复删不掉的bug）
DROP POLICY IF EXISTS "anon_delete_appointments" ON appointments;
CREATE POLICY "anon_delete_appointments" ON appointments FOR DELETE USING (true);
