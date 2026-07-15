import type { DbAppointment } from '../../lib/supabase';
import { formatDateCN, formatTimeCN } from '../../utils/dateUtils';
import './AppointmentList.css';

interface AppointmentListProps {
  appointments: DbAppointment[];
  loading: boolean;
}

export function AppointmentList({ appointments, loading }: AppointmentListProps) {
  if (loading) {
    return <p className="appt-loading">加载中...</p>;
  }

  if (appointments.length === 0) {
    return (
      <div className="appt-empty">
        <span className="appt-empty-icon">📭</span>
        <p>还没有预约记录</p>
        <p className="appt-empty-hint">有人提交预约后这里就能看到了~</p>
      </div>
    );
  }

  return (
    <div className="appt-list">
      <h3>📋 预约记录 ({appointments.length})</h3>
      {appointments.map((a) => (
        <div key={a.id} className="appt-card">
          <div className="appt-date-row">
            <span className="appt-date">{formatDateCN(a.date)}</span>
            <span className="appt-time">{formatTimeCN(a.time_slot)}</span>
          </div>
          <div className="appt-tags">
            <span className="appt-tag">{a.activity}</span>
            <span className="appt-tag">{a.cuisine}</span>
          </div>
          <span className="appt-created">
            {new Date(a.created_at).toLocaleString('zh-CN')}
          </span>
        </div>
      ))}
    </div>
  );
}
