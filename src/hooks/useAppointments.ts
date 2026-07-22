import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { DbAppointment } from '../lib/supabase';

export function useAppointments() {
  const [appointments, setAppointments] = useState<DbAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = useCallback(async () => {
    const { data } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setAppointments(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const addAppointment = useCallback(
    async (params: {
      date: string; time_slot: string; activity: string; cuisine: string;
      source: string; guest_name?: string; status: string; loc?: string;
    }) => {
      const { error } = await supabase.from('appointments').insert({
        date: params.date,
        time_slot: params.time_slot,
        activity: params.activity,
        cuisine: params.cuisine,
        source: params.source,
        guest_name: params.guest_name || null,
        status: params.status,
        location: params.loc || null,
      });
      if (!error) {
        await fetchAppointments();
        // 如果已确认，阻断3小时
        if (params.status === 'confirmed') {
          blockHours(params.date, parseInt(params.time_slot));
        }
        return true;
      }
      return false;
    },
    [fetchAppointments]
  );

  const approveAppointment = useCallback(async (id: number) => {
    const appt = appointments.find((a) => a.id === id);
    if (!appt) return;
    await supabase.from('appointments').update({ status: 'confirmed' }).eq('id', id);
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'confirmed' } : a))
    );
    // 确认后阻断3小时
    blockHours(appt.date, parseInt(appt.time_slot));
  }, [appointments]);

  const rejectAppointment = useCallback(async (id: number) => {
    const appt = appointments.find((a) => a.id === id);
    await supabase.from('appointments').update({ status: 'rejected' }).eq('id', id);
    // 从列表中移除
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    // 如果之前是已确认的，释放那3小时
    if (appt && appt.status === 'confirmed') {
      unblockHours(appt.date, parseInt(appt.time_slot));
    }
  }, [appointments]);

  // 删除时也要释放已确认的时段
  const deleteAppointment = useCallback(async (id: number) => {
    const appt = appointments.find((a) => a.id === id);
    await supabase.from('appointments').delete().eq('id', id);
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    if (appt && appt.status === 'confirmed') {
      unblockHours(appt.date, parseInt(appt.time_slot));
    }
  }, [appointments]);

  return { appointments, loading, addAppointment, deleteAppointment, approveAppointment, rejectAppointment, refresh: fetchAppointments };
}

/** 阻断某日期的 hour + 接下来2小时 */
async function blockHours(date: string, hour: number) {
  for (let h = hour; h < hour + 3; h++) {
    await supabase.from('availability').upsert({ date, hour: h % 24, is_available: false }, { onConflict: 'date,hour' });
  }
}

/** 释放某日期的 hour + 接下来2小时 */
async function unblockHours(date: string, hour: number) {
  for (let h = hour; h < hour + 3; h++) {
    await supabase.from('availability').upsert({ date, hour: h % 24, is_available: true }, { onConflict: 'date,hour' });
  }
}
