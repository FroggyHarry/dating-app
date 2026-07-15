import { useState, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { getMonthGrid, isToday, isPast, WEEKDAYS, formatDateCN } from '../../utils/dateUtils';
import './DateAvailability.css';

const ALL_HOURS = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2];
const HOUR_GROUPS = [
  { label: '中午', hours: [12] },
  { label: '下午', hours: [13, 14, 15, 16, 17] },
  { label: '晚上', hours: [18, 19, 20, 21, 22, 23] },
  { label: '凌晨', hours: [0, 1, 2] },
];

export function DateAvailability() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [allData, setAllData] = useState<Record<string, Record<number, boolean>>>({});

  // 日期拖拽
  const dragDateStart = useRef<string | null>(null);
  const draggingDate = useRef(false);
  const dragDateMode = useRef<'add' | 'remove'>('add');

  // 时段拖拽
  const draggingHour = useRef(false);
  const dragHourMode = useRef<boolean | null>(null); // true=开, false=关

  const grid = getMonthGrid(viewYear, viewMonth);

  const dateKey = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${viewYear}-${m}-${d}`;
  };

  const ensureLoaded = async (dates: string[]) => {
    const toLoad = dates.filter((d) => !allData[d]);
    if (toLoad.length === 0) return;
    const { data } = await supabase.from('availability').select('*').in('date', toLoad).order('hour');
    const patch: Record<string, Record<number, boolean>> = {};
    for (const d of toLoad) patch[d] = {};
    if (data) for (const r of data) {
      if (!patch[r.date]) patch[r.date] = {};
      patch[r.date][r.hour] = r.is_available;
    }
    setAllData((prev) => {
      const next = { ...prev };
      for (const d of toLoad) next[d] = patch[d];
      return next;
    });
  };

  const getAggregated = (): Record<number, 'all-on' | 'all-off' | 'mixed'> => {
    const result: Record<number, 'all-on' | 'all-off' | 'mixed'> = {};
    for (const h of ALL_HOURS) {
      let hasOn = false, hasOff = false;
      for (const d of selectedDates) {
        if (allData[d]?.[h] === true) hasOn = true;
        else hasOff = true;
      }
      if (hasOn && !hasOff) result[h] = 'all-on';
      else if (hasOff && !hasOn) result[h] = 'all-off';
      else result[h] = 'mixed';
    }
    return result;
  };

  const aggregated = getAggregated();

  const applyHourChange = useCallback(async (hour: number, newVal: boolean) => {
    setAllData((prev) => {
      const next = { ...prev };
      for (const d of selectedDates) next[d] = { ...(next[d] || {}), [hour]: newVal };
      return next;
    });
    const rows = selectedDates.map((date) => ({ date, hour, is_available: newVal }));
    await supabase.from('availability').upsert(rows, { onConflict: 'date,hour' });
  }, [selectedDates]);

  // --- 日期选择 ---
  const onDayDown = (day: number, e: React.MouseEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).blur();
    const key = dateKey(day);
    const mode: 'add' | 'remove' = selectedDates.includes(key) ? 'remove' : 'add';
    dragDateMode.current = mode;
    dragDateStart.current = key;
    draggingDate.current = true;

    if (mode === 'add') {
      const next = selectedDates.includes(key) ? selectedDates : [...selectedDates, key].sort();
      setSelectedDates(next);
      ensureLoaded(next);
    } else {
      setSelectedDates((prev) => prev.filter((d) => d !== key));
    }
  };

  const onDayEnter = (day: number) => {
    if (!draggingDate.current) return;
    const key = dateKey(day);
    const range = getDatesInRange(dragDateStart.current!, key);
    if (dragDateMode.current === 'add') {
      setSelectedDates((prev) => {
        const set = new Set(prev);
        range.forEach((d) => set.add(d));
        const next = Array.from(set).sort();
        ensureLoaded(next);
        return next;
      });
    } else {
      setSelectedDates((prev) => {
        const removeSet = new Set(range);
        return prev.filter((d) => !removeSet.has(d));
      });
    }
  };

  // --- 时段拖拽选择 ---
  const onHourDown = (hour: number, e: React.MouseEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).blur();
    const state = aggregated[hour];
    if (state === 'mixed') return;
    const newVal = state !== 'all-on'; // on→off, off→on
    dragHourMode.current = newVal;
    draggingHour.current = true;
    applyHourChange(hour, newVal);
  };

  const onHourEnter = (hour: number) => {
    if (!draggingHour.current || dragHourMode.current === null) return;
    const state = aggregated[hour];
    if (state === 'mixed') return;
    const cur = state === 'all-on';
    if (cur !== dragHourMode.current) {
      applyHourChange(hour, dragHourMode.current);
    }
  };

  const onGlobalUp = () => {
    draggingDate.current = false;
    draggingHour.current = false;
    dragHourMode.current = null;
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
    else setViewMonth(viewMonth + 1);
  };

  const isSel = (day: number) => selectedDates.includes(dateKey(day));
  const rangeLabel = () => {
    if (selectedDates.length === 0) return null;
    if (selectedDates.length === 1) return formatDateCN(selectedDates[0]);
    return `${formatDateCN(selectedDates[0])} ~ ${formatDateCN(selectedDates[selectedDates.length - 1])}（${selectedDates.length}天）`;
  };

  return (
    <div className="date-availability"
      onMouseUp={onGlobalUp}
      onMouseLeave={onGlobalUp}
      onTouchEnd={onGlobalUp}
    >
      <h3>🕐 按日期管理时段</h3>
      <p className="admin-hint">
        拖拽选中日期 → 拖拽切换时段 → 同时应用到所有选中日期
      </p>

      {/* 日历 */}
      <div className="da-calendar" onMouseDown={(e) => e.preventDefault()}>
        <div className="calendar-header">
          <button type="button" className="calendar-nav" onClick={prevMonth} tabIndex={-1}>‹</button>
          <span className="calendar-month">{viewYear}年 {viewMonth + 1}月</span>
          <button type="button" className="calendar-nav" onClick={nextMonth} tabIndex={-1}>›</button>
        </div>
        <div className="calendar-weekdays">
          {WEEKDAYS.map((w) => <span key={w} className="weekday">{w}</span>)}
        </div>
        <div className="calendar-grid">
          {grid.flat().map((day, i) => {
            if (day === null) return <div key={`e-${i}`} className="day-cell empty" />;
            const past = isPast(viewYear, viewMonth, day);
            const td = isToday(viewYear, viewMonth, day);
            const sel = isSel(day);
            return (
              <button
                type="button" tabIndex={-1}
                key={`d-${day}-${i}`}
                className={`day-cell${past ? ' past' : ''}${td ? ' today' : ''}${sel ? ' selected' : ''}`}
                disabled={past}
                onMouseDown={(e) => onDayDown(day, e)}
                onMouseEnter={() => onDayEnter(day)}
              >{day}</button>
            );
          })}
        </div>
      </div>

      {/* 时段开关 — 永远渲染，避免 DOM 变化触发滚动 */}
      <div className={`da-slots${selectedDates.length === 0 ? ' da-slots-hidden' : ''}`}>
        {selectedDates.length === 0 ? (
          <p className="da-slots-empty">👆 在上面日历选中日期来编辑时段</p>
        ) : (
          <>
            <h4>{rangeLabel()}</h4>
            {HOUR_GROUPS.map((g) => (
              <div key={g.label} className="da-group">
                <span className="da-group-label">{g.label}</span>
                <div className="da-hour-grid" onMouseDown={(e) => e.preventDefault()}>
                  {g.hours.map((h) => {
                    const state = aggregated[h];
                    let cls = 'da-hour-btn';
                    let label = `${h}:00`;
                    if (state === 'all-on') { cls += ' on'; label += ' ✅'; }
                    else if (state === 'all-off') { cls += ' off'; label += ' ❌'; }
                    else { cls += ' mixed'; label += ' 🔀'; }

                    return (
                      <button
                        type="button" tabIndex={-1}
                        key={h}
                        className={cls}
                        onMouseDown={(e) => onHourDown(h, e)}
                        onMouseEnter={() => onHourEnter(h)}
                        disabled={state === 'mixed'}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

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
