-- 在 Supabase SQL Editor 运行
-- 自动在插入预约时记录客户端 IP

CREATE OR REPLACE FUNCTION capture_appointment_ip()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ip_address := current_setting('request.headers', true)::json->>'x-forwarded-for';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_capture_ip ON appointments;
CREATE TRIGGER trigger_capture_ip
  BEFORE INSERT ON appointments
  FOR EACH ROW EXECUTE FUNCTION capture_appointment_ip();
