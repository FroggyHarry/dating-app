import { useState } from 'react';
import type { DbAppointment } from '../../lib/supabase';
import { formatDateCN, formatTimeCN } from '../../utils/dateUtils';
import './AppointmentList.css';

interface AppointmentListProps {
  appointments: DbAppointment[];
  loading: boolean;
  onDelete: (id: number) => void;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
}

const statusBadge = (s: string | null) => {
  if (s === 'pending') return <span className="badge badge-pending">⏳ 待确认</span>;
  if (s === 'rejected') return <span className="badge badge-rejected">❌ 已拒绝</span>;
  return <span className="badge badge-confirmed">✅ 已确认</span>;
};

export function AppointmentList({ appointments, loading, onDelete, onApprove, onReject }: AppointmentListProps) {
  const [confirmId, setConfirmId] = useState<number | null>(null);

  if (loading) return <p className="appt-loading">加载中...</p>;

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
              {statusBadge(a.status)}
            </div>
            {a.guest_name && <div className="appt-guest">👤 {a.guest_name}</div>}
            <div className="appt-tags">
              <span className="appt-tag">{a.activity}</span>
              <span className="appt-tag">{a.cuisine}</span>
              {a.source && <span className="appt-tag appt-source">{a.source === 'friend' ? '👥 朋友版' : '💕 elva版'}</span>}
            </div>
            <div className="appt-meta">
              <span className="appt-created">{new Date(a.created_at).toLocaleString('zh-CN')}</span>
              {a.location && <span className="appt-location">📍 {a.location}</span>}
            </div>
          </div>

          <div className="appt-actions">
            {a.status === 'pending' && onApprove && onReject && (
              <>
                <button className="btn-approve" onClick={() => onApprove(a.id)}>✅</button>
                <button className="btn-reject" onClick={() => onReject(a.id)}>❌</button>
              </>
            )}
            {confirmId === a.id ? (
              <div className="appt-delete-confirm">
                <button className="btn-del-yes" onClick={() => { onDelete(a.id); setConfirmId(null); }}>删除</button>
                <button className="btn-del-no" onClick={() => setConfirmId(null)}>取消</button>
              </div>
            ) : (
              <button className="appt-delete-btn" onClick={() => setConfirmId(a.id)}>🗑️</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
