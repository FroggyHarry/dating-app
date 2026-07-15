import { useState } from 'react';
import { AdminLogin } from '../AdminLogin/AdminLogin';
import { AppointmentList } from '../AppointmentList/AppointmentList';
import { EditableList } from '../EditableList/EditableList';
import { DateAvailability } from '../DateAvailability/DateAvailability';
import { useAdmin } from '../../hooks/useAdmin';
import { useAppointments } from '../../hooks/useAppointments';
import { supabase } from '../../lib/supabase';
import type { AdminTab } from '../../types';
import './AdminPanel.css';

interface AdminPanelProps {
  showLogin: boolean;
  onCloseLogin: () => void;
}

export function AdminPanel({ showLogin, onCloseLogin }: AdminPanelProps) {
  const { isAdmin, login, logout } = useAdmin();
  const { appointments, loading: apptsLoading, deleteAppointment } = useAppointments();
  const [tab, setTab] = useState<AdminTab>('appointments');

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

  if (isAdmin && !dataLoaded) {
    loadAllData();
  }

  if (!isAdmin && !showLogin) return null;

  return (
    <>
      {showLogin && !isAdmin && (
        <AdminLogin onLogin={login} onCancel={onCloseLogin} />
      )}

      {isAdmin && (
        <div className="admin-panel">
          <div className="admin-header">
            <h2>🐸 管理后台</h2>
            <button className="btn-secondary admin-logout-btn" onClick={logout}>退出</button>
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
              <AppointmentList
                appointments={appointments}
                loading={apptsLoading}
                onDelete={deleteAppointment}
              />
            )}

            {tab === 'time-slots' && (
              <DateAvailability />
            )}

            {tab === 'activities' && (
              <EditableList title="🎯 活动管理" items={activities} table="activities" onUpdate={setActivities} />
            )}

            {tab === 'cuisines' && (
              <EditableList title="🍽️ 菜系管理" items={cuisines} table="cuisines" onUpdate={setCuisines} />
            )}
          </div>
        </div>
      )}
    </>
  );
}
