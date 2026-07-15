import { useState, useMemo } from 'react';
import { getMonthGrid, isToday, isPast, WEEKDAYS } from '../../utils/dateUtils';
import './Calendar.css';

interface CalendarProps {
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

export function Calendar({ selectedDate, onSelectDate }: CalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-based

  const grid = useMemo(
    () => getMonthGrid(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleDayClick = (day: number) => {
    if (isPast(viewYear, viewMonth, day)) return;
    const month = String(viewMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    onSelectDate(`${viewYear}-${month}-${dayStr}`);
  };

  const isSelected = (day: number): boolean => {
    if (!selectedDate) return false;
    const d = new Date(selectedDate + 'T00:00:00');
    return (
      d.getFullYear() === viewYear &&
      d.getMonth() === viewMonth &&
      d.getDate() === day
    );
  };

  return (
    <div className="calendar">
      {/* 月份导航 */}
      <div className="calendar-header">
        <button className="calendar-nav" onClick={prevMonth}>‹</button>
        <span className="calendar-month">
          {viewYear}年 {viewMonth + 1}月
        </span>
        <button className="calendar-nav" onClick={nextMonth}>›</button>
      </div>

      {/* 星期标题 */}
      <div className="calendar-weekdays">
        {WEEKDAYS.map((w) => (
          <span key={w} className="weekday">{w}</span>
        ))}
      </div>

      {/* 日期网格 */}
      <div className="calendar-grid">
        {grid.flat().map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="day-cell empty" />;
          }

          const past = isPast(viewYear, viewMonth, day);
          const today_ = isToday(viewYear, viewMonth, day);
          const sel = isSelected(day);

          return (
            <button
              key={`day-${day}-${i}`}
              className={`day-cell${past ? ' past' : ''}${today_ ? ' today' : ''}${sel ? ' selected' : ''}`}
              disabled={past}
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
