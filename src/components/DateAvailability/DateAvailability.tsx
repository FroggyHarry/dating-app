import { useState, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { getMonthGrid, isToday, isPast, isOutOfRange, WEEKDAYS, formatDateCN } from '../../utils/dateUtils';
import './DateAvailability.css';

export function DateAvailability() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [availability, setAvailability] = useState<Record<number, boolean>>({});
  const [saving, setSaving] = useState(false);

  // 拖拽范围选择
  const dragStartRef = useRef<string | null>(null);
  const isDraggingRef = useRef(false);

  const grid = getMonthGrid(viewYear, viewMonth);

  const dateKey = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${viewYear}-${m}-${d}`;
  };

  // 加载第一个选中日期的可用时段作为模板
  const loadAvailability = useCallback(async (dates: string[]) => {
    if (dates.length === 0) { setAvailability({}); return; }
    const { data } = await supabase
      .from('availability')
      .select('*')
      .eq('date', dates[0])
      .order('hour');
    if (data && data.length > 0) {
      const map: Record<number, boolean> = {};
      data.forEach((r: any) => { map[r.hour] = r.is_available; });
      setAvailability(map);
    } else {
      const { data: slots } = await supabase.from('time_slots').select('*');
      if (slots) {
        const map: Record<number, boolean> = {};
        slots.forEach((s: any) => { map[s.hour] = s.is_active; });
        setAvailability(map);
      }
    }
  }, []);

  const handleDayDown = (day: number) => {
    const key = dateKey(day);
    dragStartRef.current = key;
    isDraggingRef.current = true;
    setSelectedDates([key]);
    loadAvailability([key]);
  };

  const handleDayEnter = (day: number) => {
    if (!isDraggingRef.current || !dragStartRef.current) return;
    const key = dateKey(day);
    const start = dragStartRef.current;
    // 计算范围内的所有日期
    const allDates = getDatesInRange(start, key);
    setSelectedDates(allDates);
    if (allDates.length === 1) loadAvailability(allDates);
  };

  const handleDayUp = () => {
    isDraggingRef.current = false;
    dragStartRef.current = null;
  };

  // 切换时段 → 应用到所有选中日期
  const toggleHour = async (hour: number) => {
    const current = availability[hour] ?? true;
    const newVal = !current;
    setAvailability((prev) => ({ ...prev, [hour]: newVal }));
    setSaving(true);

    const rows = selectedDates.map((date) => ({
      date,
      hour,
      is_available: newVal,
    }));

    await supabase.from('availability').upsert(rows, { onConflict: 'date,hour' });
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
    return selectedDates.includes(dateKey(day));
  };

  // 显示选中的范围
  const rangeLabel = () => {
    if (selectedDates.length === 0) return null;
    if (selectedDates.length === 1) return formatDateCN(selectedDates[0]);
    const first = formatDateCN(selectedDates[0]);
    const last = formatDateCN(selectedDates[selectedDates.length - 1]);
    return `${first} ~ ${last}（${selectedDates.length}天）`;
  };

  const hourGroups = [
    { label: '中午', hours: [12] },
    { label: '下午', hours: [13, 14, 15, 16, 17] },
    { label: '晚上', hours: [18, 19, 20, 21, 22, 23] },
    { label: '凌晨', hours: [0, 1, 2] },
  ];

  return (
    <div className="date-availability"
      onMouseUp={handleDayUp}
      onMouseLeave={handleDayUp}
      onTouchEnd={handleDayUp}
    >
      <h3>🕐 按日期管理时段</h3>
      <p className="admin-hint">
        在日历上<strong>按住拖拽</strong>选中连续日期，然后开关时段 → 同时应用到所有选中日期
      </p>

      {/* 日历 */}
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
                onMouseDown={() => handleDayDown(day)}
                onMouseEnter={() => handleDayEnter(day)}
              >{day}</button>
            );
          })}
        </div>
      </div>

      {/* 时段开关 */}
      {selectedDates.length > 0 && (
        <div className="da-slots">
          <h4>{rangeLabel()}</h4>
          <p className="admin-hint">下方的开关会应用到上面选中的所有日期</p>
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

/** 计算两个日期字符串之间的所有日期 */
function getDatesInRange(a: string, b: string): string[] {
  const d1 = new Date(a + 'T00:00:00');
  const d2 = new Date(b + 'T00:00:00');
  const start = d1 < d2 ? d1 : d2;
  const end = d1 < d2 ? d2 : d1;
  const dates: string[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}
