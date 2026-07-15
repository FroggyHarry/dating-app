import { useState, useRef, useEffect, useCallback } from 'react';
import { FloatingHearts } from '../FloatingHearts/FloatingHearts';
import { ACTIVITIES, CUISINES } from '../../constants/activities';
import { formatDateCN, formatTimeCN } from '../../utils/dateUtils';
import type { DateDetails } from '../../types';
import './Confirmation.css';

interface ConfirmationProps {
  dateDetails: DateDetails;
  onReset: () => void;
  onFrogTripleClick: () => void;
}

export function Confirmation({ dateDetails, onReset, onFrogTripleClick }: ConfirmationProps) {
  const { date, timeSlot, activity, food } = dateDetails;
  const [clickCount, setClickCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFrogClick = useCallback(() => {
    const count = clickCount + 1;
    setClickCount(count);

    if (timerRef.current) clearTimeout(timerRef.current);

    if (count >= 3) {
      setClickCount(0);
      onFrogTripleClick();
      return;
    }

    timerRef.current = setTimeout(() => {
      setClickCount(0);
    }, 1500);
  }, [clickCount, onFrogTripleClick]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

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
          <span>🐕</span>
          <span className="heart-between">💗</span>
          <span
            className="frog-clickable"
            onClick={handleFrogClick}
            title={clickCount > 0 ? `再点 ${3 - clickCount} 次...` : undefined}
          >
            🐸
          </span>
        </div>

        <button className="btn-primary reset-btn" onClick={onReset}>
          🔄 重新安排
        </button>
      </div>
    </div>
  );
}
