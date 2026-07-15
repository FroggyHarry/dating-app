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
    async (date: string, time_slot: string, activity: string, cuisine: string, meta?: { loc?: string }) => {
      const { error } = await supabase.from('appointments').insert({
        date,
        time_slot,
        activity,
        cuisine,
        location: meta?.loc || null,
      });
      if (!error) {
        await fetchAppointments();
        return true;
      }
      return false;
    },
    [fetchAppointments]
  );

  const deleteAppointment = useCallback(async (id: number) => {
    await supabase.from('appointments').delete().eq('id', id);
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return { appointments, loading, addAppointment, deleteAppointment, refresh: fetchAppointments };
}
