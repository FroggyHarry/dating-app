import { FloatingHearts } from '../FloatingHearts/FloatingHearts';
import { ACTIVITIES, CUISINES } from '../../constants/activities';
import { formatDateCN, formatTimeCN } from '../../utils/dateUtils';
import type { DateDetails } from '../../types';
import './Confirmation.css';

interface ConfirmationProps {
  dateDetails: DateDetails;
  onReset: () => void;
}

export function Confirmation({ dateDetails, onReset }: ConfirmationProps) {
  const { date, timeSlot, activity, food } = dateDetails;

  const getLabel = (list: { key: string; label: string; emoji: string }[], key: string | null) => {
    if (!key) return '';
    const item = list.find((a) => a.key === key);
    return item ? `${item.emoji} ${item.label}` : key;
  };

  return (
    <div className="confirmation phase-enter">
      <FloatingHearts />

      <div className="confirmation-card">
        <div className="confetti-emoji">🎉</div>
        <h2 className="confirmation-title">真开心你没有拒绝蛙，蛙会准时来接elva！</h2>

        <img
          className="confirmation-image"
          src="./95b0e241ead5133e53d30d07fa0ed958.jpeg"
          alt="蛙"
        />

        <div className="confirmation-details">
          <div className="detail-row">
            <span className="detail-icon">📅</span>
            <span className="detail-text">{date ? formatDateCN(date) : ''}</span>
          </div>
          <div className="detail-row">
            <span className="detail-icon">⏰</span>
            <span className="detail-text">{timeSlot ? formatTimeCN(timeSlot) : ''}</span>
          </div>
          <div className="detail-row">
            <span className="detail-icon">🎯</span>
            <span className="detail-text">
              {getLabel(ACTIVITIES, activity)}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-icon">🍽️</span>
            <span className="detail-text">
              {getLabel(CUISINES, food)}
            </span>
          </div>
        </div>

        <div className="confirmation-animals">
          <span>🐸</span>
          <span className="heart-between">💗</span>
          <span>🐕</span>
        </div>

        <button className="btn-primary reset-btn" onClick={onReset}>
          🔄 重新安排
        </button>
      </div>
    </div>
  );
}
