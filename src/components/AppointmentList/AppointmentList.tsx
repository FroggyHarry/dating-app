import { useState } from 'react';
import type { DbAppointment } from '../../lib/supabase';
import { formatDateCN, formatTimeCN } from '../../utils/dateUtils';
import './AppointmentList.css';

interface AppointmentListProps {
  appointments: DbAppointment[];
  loading: boolean;
  onDelete: (id: number) => void;
}

export function AppointmentList({ appointments, loading, onDelete }: AppointmentListProps) {
  const [confirmId, setConfirmId] = useState<number | null>(null);

  if (loading) {
    return <p className="appt-loading">加载中...</p>;
  }

  if (appointments.length === 0) {
    return (
      <div className="appt-empty">
        <span className="appt-empty-icon">📭</span>
        <p>还没有预约记录</p>
      </div>
    );
  }

  return (
    <div className="appt-list">
      <h3>📋 预约记录 ({appointments.length})</h3>
      {appointments.map((a) => (
        <div key={a.id} className="appt-card">
          <div className="appt-card-main">
            <div className="appt-date-row">
              <span className="appt-date">{formatDateCN(a.date)}</span>
              <span className="appt-time">{formatTimeCN(a.time_slot)}</span>
            </div>
            <div className="appt-tags">
              <span className="appt-tag">{a.activity}</span>
              <span className="appt-tag">{a.cuisine}</span>
            </div>
            <div className="appt-meta">
              <span className="appt-created">
                {new Date(a.created_at).toLocaleString('zh-CN')}
              </span>
              {a.location && (
                <span className="appt-location">📍 {a.location}</span>
              )}
            </div>
          </div>

          {confirmId === a.id ? (
            <div className="appt-delete-confirm">
              <span>确认删除？</span>
              <button className="btn-del-yes" onClick={() => { onDelete(a.id); setConfirmId(null); }}>删除</button>
              <button className="btn-del-no" onClick={() => setConfirmId(null)}>取消</button>
            </div>
          ) : (
            <button className="appt-delete-btn" onClick={() => setConfirmId(a.id)}>🗑️</button>
          )}
        </div>
      ))}
    </div>
  );
}
