-- 朋友版 + 审批系统
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'elva';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS guest_name TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'confirmed';
