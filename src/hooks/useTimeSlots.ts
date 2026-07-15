import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { DbTimeSlot } from '../lib/supabase';

export function useTimeSlots() {
  const [slots, setSlots] = useState<DbTimeSlot[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSlots = useCallback(async () => {
    const { data } = await supabase
      .from('time_slots')
      .select('*')
      .order('hour');
    if (data) setSlots(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchSlots(); }, [fetchSlots]);

  const toggleSlot = useCallback(async (id: number, is_active: boolean) => {
    await supabase.from('time_slots').update({ is_active }).eq('id', id);
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_active } : s))
    );
  }, []);

  return { slots, loading, toggleSlot, refresh: fetchSlots };
}
