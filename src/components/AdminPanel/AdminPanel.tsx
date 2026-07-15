import { useState } from 'react';
import { AdminLogin } from '../AdminLogin/AdminLogin';
import { AppointmentList } from '../AppointmentList/AppointmentList';
import { EditableList } from '../EditableList/EditableList';
import { useAdmin } from '../../hooks/useAdmin';
import { useAppointments } from '../../hooks/useAppointments';
import { useTimeSlots } from '../../hooks/useTimeSlots';
import { supabase } from '../../lib/supabase';
import type { DbTimeSlot } from '../../lib/supabase';
import type { AdminTab } from '../../types';
import './AdminPanel.css';

interface AdminPanelProps {
  showLogin: boolean;
  onCloseLogin: () => void;
}

export function AdminPanel({ showLogin, onCloseLogin }: AdminPanelProps) {
  const { isAdmin, login, logout } = useAdmin();
  const { appointments, loading: apptsLoading } = useAppointments();
  const { slots, toggleSlot } = useTimeSlots();
  const [tab, setTab] = useState<AdminTab>('appointments');

  // 管理活动/菜系数据（简化：用本地 state 直接读写 supabase）
  const [activities, setActivities] = useState<{ id: number; key: string; label: string; emoji: string; is_active: boolean }[]>([]);
  const [cuisines, setCuisines] = useState<{ id: number; key: string; label: string; emoji: string; is_active: boolean }[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const loadAllData = async () => {
    const { data: acts } = await supabase.from('activities').select('*').order('id');
    const { data: cuis } = await supabase.from('cuisines').select('*').order('id');
    if (acts) setActivities(acts);
    if (cuis) setCuisines(cuis);
    setDataLoaded(true);
  };

  // 当管理员登录后加载数据
  if (isAdmin && !dataLoaded) {
    loadAllData();
  }

  if (!isAdmin && !showLogin) return null;

  return (
    <>
      {showLogin && !isAdmin && (
        <AdminLogin
          onLogin={login}
          onCancel={onCloseLogin}
        />
      )}

      {isAdmin && (
        <div className="admin-panel">
          <div className="admin-header">
            <h2>🐸 管理后台</h2>
            <button className="btn-secondary admin-logout-btn" onClick={logout}>
              退出
            </button>
          </div>

          <div className="admin-tabs">
            {([
              ['appointments', '📋 预约'],
              ['time-slots', '🕐 时段'],
              ['activities', '🎯 活动'],
              ['cuisines', '🍽️ 菜系'],
            ] as [AdminTab, string][]).map(([key, label]) => (
              <button
                key={key}
                className={`admin-tab${tab === key ? ' active' : ''}`}
                onClick={() => setTab(key)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="admin-content">
            {tab === 'appointments' && (
              <AppointmentList appointments={appointments} loading={apptsLoading} />
            )}

            {tab === 'time-slots' && (
              <div className="admin-section">
                <h3>🕐 可用时间段</h3>
                <p className="admin-hint">开关每个时段，关闭后前台不显示该时间</p>
                <div className="time-slot-toggle-grid">
                  {(['中午', '下午', '晚上', '凌晨'] as string[]).map((group) => {
                    const groupSlots = slots.filter((s) => s.group_label === group);
                    if (groupSlots.length === 0) return null;
                    return (
                      <div key={group} className="toggle-group">
                        <span className="toggle-group-label">{group}</span>
                        {groupSlots.map((s: DbTimeSlot) => (
                          <label key={s.id} className="toggle-item">
                            <span>{s.label}</span>
                            <input
                              type="checkbox"
                              checked={s.is_active}
                              onChange={(e) => toggleSlot(s.id, e.target.checked)}
                            />
                          </label>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {tab === 'activities' && (
              <EditableList
                title="🎯 活动管理"
                items={activities}
                table="activities"
                onUpdate={setActivities}
              />
            )}

            {tab === 'cuisines' && (
              <EditableList
                title="🍽️ 菜系管理"
                items={cuisines}
                table="cuisines"
                onUpdate={setCuisines}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
