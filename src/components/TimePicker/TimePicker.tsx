import { useTimeSlots } from '../../hooks/useTimeSlots';
import { groupTimeSlots } from '../../types';
import './TimePicker.css';

interface TimePickerProps {
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
}

export function TimePicker({ selectedTime, onSelectTime }: TimePickerProps) {
  const { slots, loading } = useTimeSlots();
  const groups = groupTimeSlots(slots);

  if (loading) {
    return (
      <div className="time-picker">
        <p className="time-loading">加载时间段中...</p>
      </div>
    );
  }

  return (
    <div className="time-picker">
      <h3 className="time-picker-title">⏰ 选择时间</h3>
      {groups.map((group) => (
        <div key={group.label} className="time-group">
          <span className="time-group-label">{group.label}</span>
          <div className="time-slots">
            {group.slots.map((s) => {
              const timeStr = `${String(s.hour).padStart(2, '0')}:00`;
              const isSelected = selectedTime === timeStr;
              return (
                <button
                  key={timeStr}
                  className={`time-slot${isSelected ? ' selected' : ''}`}
                  onClick={() => onSelectTime(timeStr)}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
