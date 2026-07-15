import './TimePicker.css';

interface TimePickerProps {
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
}

const TIME_SLOTS = [
  { label: '中午', hours: [12] },
  { label: '下午', hours: [13, 14, 15, 16, 17] },
  { label: '晚上', hours: [18, 19, 20, 21, 22, 23] },
  { label: '凌晨', hours: [0, 1, 2] },
];

export function TimePicker({ selectedTime, onSelectTime }: TimePickerProps) {
  return (
    <div className="time-picker">
      <h3 className="time-picker-title">⏰ 选择时间</h3>
      {TIME_SLOTS.map((group) => (
        <div key={group.label} className="time-group">
          <span className="time-group-label">{group.label}</span>
          <div className="time-slots">
            {group.hours.map((h) => {
              const timeStr = `${String(h).padStart(2, '0')}:00`;
              const isSelected = selectedTime === timeStr;
              const displayHour = h === 0 ? '0:00' : `${h}:00`;
              return (
                <button
                  key={timeStr}
                  className={`time-slot${isSelected ? ' selected' : ''}`}
                  onClick={() => onSelectTime(timeStr)}
                >
                  {displayHour}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
