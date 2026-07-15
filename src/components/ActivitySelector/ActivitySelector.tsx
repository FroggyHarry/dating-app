import type { Activity } from '../../types';
import './ActivitySelector.css';

interface ActivitySelectorProps {
  activities: Activity[];
  selected: string | null;
  onSelect: (key: string) => void;
  title: string;
}

export function ActivitySelector({ activities, selected, onSelect, title }: ActivitySelectorProps) {
  return (
    <div className="activity-selector">
      <h3 className="activity-title">{title}</h3>
      <div className="activity-grid">
        {activities.map((item) => {
          const isSelected = selected === item.key;
          return (
            <button
              key={item.key}
              className={`activity-card${isSelected ? ' selected' : ''}`}
              onClick={() => onSelect(item.key)}
            >
              <span className="activity-emoji">{item.emoji}</span>
              <span className="activity-label">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
