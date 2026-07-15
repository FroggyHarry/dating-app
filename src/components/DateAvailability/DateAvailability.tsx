import { useState, useRef } from 'react';
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
  const [allData, setAllData] = useState<Record<string, Record<number, boolean>>>({}); // date -> { hour: bool }
  const [saving, setSaving] = useState(false);

  const dragStartRef = useRef<string | null>(null);
  const isDraggingRef = useRef(false);
  const dragModeRef = useRef<'add' | 'remove'>('add');

  const grid = getMonthGrid(viewYear, viewMonth);

  const dateKey = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${viewYear}-${m}-${d}`;
  };

  // 加载某日期的数据（如果内存中没有才从DB取）
  const ensureLoaded = async (dates: string[]) => {
    const toLoad = dates.filter((d) => !allData[d]);
    if (toLoad.length === 0) return;

    const { data } = await supabase
      .from('availability')
      .select('*')
      .in('date', toLoad)
      .order('hour');

    const patch: Record<string, Record<number, boolean>> = {};
    for (const d of toLoad) patch[d] = {};
    if (data) {
      for (const r of data) {
        if (!patch[r.date]) patch[r.date] = {};
        patch[r.date][r.hour] = r.is_available;
      }
    }
    setAllData((prev) => {
      const next = { ...prev };
      for (const d of toLoad) {
        next[d] = patch[d];
      }
      return next;
    });
  };

  // 计算多选日期每个小时的聚合状态
  const getAggregated = (): Record<number, 'all-on' | 'all-off' | 'mixed'> => {
    const result: Record<number, 'all-on' | 'all-off' | 'mixed'> = {};
    for (const h of ALL_HOURS) {
      let hasOn = false, hasOff = false;
      for (const d of selectedDates) {
        const val = allData[d]?.[h];
        if (val === true) hasOn = true;
        else hasOff = true;
      }
      if (hasOn && !hasOff) result[h] = 'all-on';
      else if (hasOff && !hasOn) result[h] = 'all-off';
      else result[h] = 'mixed';
    }
    return result;
  };

  const aggregated = getAggregated();

  // 切换时段 → 对所有选中日期翻转
  const toggleHour = async (hour: number) => {
    const current = aggregated[hour];
    if (current === 'mixed') return; // 混合状态不操作

    const newVal = current !== 'all-on'; // all-on → false, all-off → true
    setSaving(true);

    // 更新内存
    setAllData((prev) => {
      const next = { ...prev };
      for (const d of selectedDates) {
        next[d] = { ...(next[d] || {}), [hour]: newVal };
      }
      return next;
    });

    // 保存到DB
    const rows = selectedDates.map((date) => ({ date, hour, is_available: newVal }));
    await supabase.from('availability').upsert(rows, { onConflict: 'date,hour' });
    setSaving(false);
  };

  // 处理日期选择
  const handleDayDown = (day: number) => {
    const key = dateKey(day);
    const mode: 'add' | 'remove' = selectedDates.includes(key) ? 'remove' : 'add';
    dragModeRef.current = mode;
    dragStartRef.current = key;
    isDraggingRef.current = true;

    if (mode === 'add') {
      const next = selectedDates.includes(key) ? selectedDates : [...selectedDates, key].sort();
      setSelectedDates(next);
      ensureLoaded(next);
    } else {
      const next = selectedDates.filter((d) => d !== key);
      setSelectedDates(next);
    }
  };

  const handleDayEnter = (day: number) => {
    if (!isDraggingRef.current) return;
    const key = dateKey(day);
    const start = dragStartRef.current!;
    const range = getDatesInRange(start, key);
    const mode = dragModeRef.current;

    if (mode === 'add') {
      const set = new Set(selectedDates);
      range.forEach((d) => set.add(d));
      const next = Array.from(set).sort();
      setSelectedDates(next);
      ensureLoaded(next);
    } else {
      const removeSet = new Set(range);
      const next = selectedDates.filter((d) => !removeSet.has(d));
      setSelectedDates(next);
    }
  };

  const handleDayUp = () => {
    isDraggingRef.current = false;
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
      onMouseUp={handleDayUp}
      onMouseLeave={handleDayUp}
      onTouchEnd={handleDayUp}
    >
      <h3>🕐 按日期管理时段</h3>
      <p className="admin-hint">
        拖拽选中日期 → 点击时段开关 → 同时应用到所有选中日期
      </p>

      {/* 日历 */}
      <div className="da-calendar" onMouseDown={(e) => e.preventDefault()}>
        <div className="calendar-header">
          <button type="button" className="calendar-nav" onClick={prevMonth}>‹</button>
          <span className="calendar-month">{viewYear}年 {viewMonth + 1}月</span>
          <button type="button" className="calendar-nav" onClick={nextMonth}>›</button>
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
                type="button"
                key={`d-${day}-${i}`}
                className={`day-cell${past ? ' past' : ''}${td ? ' today' : ''}${sel ? ' selected' : ''}`}
                disabled={past}
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
          {HOUR_GROUPS.map((g) => (
            <div key={g.label} className="da-group">
              <span className="da-group-label">{g.label}</span>
              <div className="da-hour-grid">
                {g.hours.map((h) => {
                  const state = aggregated[h];
                  let cls = 'da-hour-btn';
                  let label = `${h}:00`;
                  if (state === 'all-on') { cls += ' on'; label += ' ✅'; }
                  else if (state === 'all-off') { cls += ' off'; label += ' ❌'; }
                  else { cls += ' mixed'; label += ' 🔀'; }

                  return (
                    <button
                      type="button"
                      key={h}
                      className={cls}
                      onClick={() => toggleHour(h)}
                      disabled={saving || state === 'mixed'}
                    >
                      {label}
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
