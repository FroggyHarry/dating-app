import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { getMonthGrid, isToday, isPast, isOutOfRange, WEEKDAYS, formatDateCN } from '../../utils/dateUtils';
import './DateAvailability.css';

export function DateAvailability() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availability, setAvailability] = useState<Record<number, boolean>>({});
  const [saving, setSaving] = useState(false);

  const grid = getMonthGrid(viewYear, viewMonth);

  // 加载选中日期的可用时段
  const loadAvailability = useCallback(async (date: string) => {
    const { data } = await supabase
      .from('availability')
      .select('*')
      .eq('date', date)
      .order('hour');
    if (data && data.length > 0) {
      const map: Record<number, boolean> = {};
      data.forEach((r: any) => { map[r.hour] = r.is_available; });
      setAvailability(map);
    } else {
      // 没有数据则从 time_slots 初始化
      const { data: slots } = await supabase.from('time_slots').select('*');
      if (slots) {
        const map: Record<number, boolean> = {};
        slots.forEach((s: any) => { map[s.hour] = s.is_active; });
        setAvailability(map);
      }
    }
  }, []);

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    loadAvailability(date);
  };

  const toggleHour = async (hour: number) => {
    const current = availability[hour] ?? true;
    const newVal = !current;
    setAvailability((prev) => ({ ...prev, [hour]: newVal }));
    setSaving(true);

    await supabase.from('availability').upsert({
      date: selectedDate,
      hour,
      is_available: newVal,
    }, { onConflict: 'date,hour' });

    setSaving(false);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
    else setViewMonth(viewMonth + 1);
  };

  const isSel = (day: number): boolean => {
    if (!selectedDate) return false;
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return selectedDate === `${viewYear}-${m}-${d}`;
  };

  // 分组显示时段
  const hourGroups = [
    { label: '中午', hours: [12] },
    { label: '下午', hours: [13, 14, 15, 16, 17] },
    { label: '晚上', hours: [18, 19, 20, 21, 22, 23] },
    { label: '凌晨', hours: [0, 1, 2] },
  ];

  return (
    <div className="date-availability">
      <h3>🕐 按日期管理时段</h3>
      <p className="admin-hint">先点日历选日期，再开关那天的具体时段</p>

      {/* 迷你日历 */}
      <div className="da-calendar">
        <div className="calendar-header">
          <button className="calendar-nav" onClick={prevMonth}>‹</button>
          <span className="calendar-month">{viewYear}年 {viewMonth + 1}月</span>
          <button className="calendar-nav" onClick={nextMonth}>›</button>
        </div>
        <div className="calendar-weekdays">
          {WEEKDAYS.map((w) => <span key={w} className="weekday">{w}</span>)}
        </div>
        <div className="calendar-grid">
          {grid.flat().map((day, i) => {
            if (day === null) return <div key={`e-${i}`} className="day-cell empty" />;
            const past = isPast(viewYear, viewMonth, day);
            const out = isOutOfRange(viewYear, viewMonth, day);
            const disabled = past || out;
            const sel = isSel(day);
            const td = isToday(viewYear, viewMonth, day);
            return (
              <button
                key={`d-${day}-${i}`}
                className={`day-cell${disabled ? ' past' : ''}${td ? ' today' : ''}${sel ? ' selected' : ''}`}
                disabled={disabled}
                onClick={() => {
                  const m = String(viewMonth + 1).padStart(2, '0');
                  const d = String(day).padStart(2, '0');
                  handleSelectDate(`${viewYear}-${m}-${d}`);
                }}
              >{day}</button>
            );
          })}
        </div>
      </div>

      {/* 时段开关 */}
      {selectedDate && (
        <div className="da-slots">
          <h4>{formatDateCN(selectedDate)}</h4>
          {hourGroups.map((g) => (
            <div key={g.label} className="da-group">
              <span className="da-group-label">{g.label}</span>
              <div className="da-hour-grid">
                {g.hours.map((h) => {
                  const avail = availability[h] ?? false;
                  return (
                    <button
                      key={h}
                      className={`da-hour-btn${avail ? ' on' : ' off'}`}
                      onClick={() => toggleHour(h)}
                      disabled={saving}
                    >
                      {h}:00 {avail ? '✅' : '❌'}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
