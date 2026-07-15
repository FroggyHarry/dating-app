import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import './TimePicker.css';

interface TimePickerProps {
  selectedDate: string | null;
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
}

const HOUR_GROUPS = [
  { label: '中午', hours: [12] },
  { label: '下午', hours: [13, 14, 15, 16, 17] },
  { label: '晚上', hours: [18, 19, 20, 21, 22, 23] },
  { label: '凌晨', hours: [0, 1, 2] },
];

export function TimePicker({ selectedDate, selectedTime, onSelectTime }: TimePickerProps) {
  const [availableHours, setAvailableHours] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedDate) { setLoading(false); return; }
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('availability')
        .select('*')
        .eq('date', selectedDate)
        .eq('is_available', true);

      if (data && data.length > 0) {
        setAvailableHours(new Set(data.map((r: any) => r.hour)));
      } else {
        // 该日期还没设置过，用 time_slots 默认值
        const { data: slots } = await supabase.from('time_slots').select('*').eq('is_active', true);
        if (slots) setAvailableHours(new Set(slots.map((s: any) => s.hour)));
      }
      setLoading(false);
    };
    load();
  }, [selectedDate]);

  if (loading) {
    return (
      <div className="time-picker">
        <p className="time-loading">加载时间段中...</p>
      </div>
    );
  }

  if (!selectedDate) {
    return (
      <div className="time-picker">
        <p className="time-loading">请先选择日期</p>
      </div>
    );
  }

  return (
    <div className="time-picker">
      <h3 className="time-picker-title">⏰ 选择时间</h3>
      {HOUR_GROUPS.map((group) => {
        const groupHours = group.hours.filter((h) => availableHours.has(h));
        if (groupHours.length === 0) return null;
        return (
          <div key={group.label} className="time-group">
            <span className="time-group-label">{group.label}</span>
            <div className="time-slots">
              {groupHours.map((h) => {
                const timeStr = `${String(h).padStart(2, '0')}:00`;
                return (
                  <button
                    key={timeStr}
                    className={`time-slot${selectedTime === timeStr ? ' selected' : ''}`}
                    onClick={() => onSelectTime(timeStr)}
                  >
                    {h}:00
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      {availableHours.size === 0 && (
        <p className="time-loading">该日期暂无可用时段</p>
      )}
    </div>
  );
}
