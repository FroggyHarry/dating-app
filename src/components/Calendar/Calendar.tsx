import { useState, useMemo, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { getMonthGrid, isToday, isPast, WEEKDAYS } from '../../utils/dateUtils';
import './Calendar.css';

interface CalendarProps {
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

export function Calendar({ selectedDate, onSelectDate }: CalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());

  const grid = useMemo(
    () => getMonthGrid(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  // 加载当前月份哪些日期有空闲时段
  useEffect(() => {
    const load = async () => {
      const start = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(viewYear, viewMonth + 1, 0).getDate();
      const end = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      const { data } = await supabase
        .from('availability')
        .select('date')
        .eq('is_available', true)
        .gte('date', start)
        .lte('date', end);

      if (data) {
        const set = new Set<string>();
        // 每个日期只要至少有一个可用时段就算可用
        data.forEach((r: any) => set.add(r.date));
        setAvailableDates(set);
      } else {
        setAvailableDates(new Set());
      }
    };
    load();
  }, [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
    else setViewMonth(viewMonth + 1);
  };

  const handleDayClick = (day: number) => {
    if (isPast(viewYear, viewMonth, day)) return;
    const key = dateKey(day);
    // 未来日期必须在 availableDates 中才能选
    if (!isToday(viewYear, viewMonth, day) && !availableDates.has(key)) return;
    onSelectDate(key);
  };

  const dateKey = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${viewYear}-${m}-${d}`;
  };

  const isSelected = (day: number): boolean => {
    if (!selectedDate) return false;
    return selectedDate === dateKey(day);
  };

  return (
    <div className="calendar">
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
          if (day === null) return <div key={`empty-${i}`} className="day-cell empty" />;

          const past = isPast(viewYear, viewMonth, day);
          const today_ = isToday(viewYear, viewMonth, day);
          const sel = isSelected(day);
          const key = dateKey(day);
          // 未来日期没在 availability 里 → 灰色不可点
          const noSlots = !past && !today_ && !availableDates.has(key);
          const disabled = past || noSlots;

          return (
            <button
              key={`day-${day}-${i}`}
              className={`day-cell${disabled ? ' past' : ''}${today_ ? ' today' : ''}${sel ? ' selected' : ''}`}
              disabled={disabled}
              onClick={() => handleDayClick(day)}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
