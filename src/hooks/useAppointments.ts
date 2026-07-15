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
    async (date: string, time_slot: string, activity: string, cuisine: string) => {
      const { error } = await supabase.from('appointments').insert({
        date,
        time_slot,
        activity,
        cuisine,
      });
      if (!error) {
        await fetchAppointments();
        return true;
      }
      return false;
    },
    [fetchAppointments]
  );

  return { appointments, loading, addAppointment, refresh: fetchAppointments };
}
