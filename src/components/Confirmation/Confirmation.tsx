import { useState, useRef, useEffect, useCallback } from 'react';
import { FloatingHearts } from '../FloatingHearts/FloatingHearts';
import { ACTIVITIES, CUISINES } from '../../constants/activities';
import { CONFIG } from '../../config';
import { formatDateCN, formatTimeCN } from '../../utils/dateUtils';
import type { DateDetails } from '../../types';
import './Confirmation.css';

interface ConfirmationProps {
  dateDetails: DateDetails;
  onReset: () => void;
  onFrogTripleClick: () => void;
  isPending?: boolean;
}

export function Confirmation({ dateDetails, onReset, onFrogTripleClick, isPending }: ConfirmationProps) {
  const { date, timeSlot, activity, food } = dateDetails;
  const [clickCount, setClickCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFrogClick = useCallback(() => {
    if (!CONFIG.showAdminEntry) return;
    const count = clickCount + 1;
    setClickCount(count);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (count >= 3) { setClickCount(0); onFrogTripleClick(); return; }
    timerRef.current = setTimeout(() => setClickCount(0), 1500);
  }, [clickCount, onFrogTripleClick]);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const getLabel = (list: { key: string; label: string; emoji: string }[], key: string | null) => {
    if (!key) return '';
    const item = list.find((a) => a.key === key);
    return item ? `${item.emoji} ${item.label}` : key;
  };

  return (
    <div className="confirmation phase-enter">
      {CONFIG.showFloatingDecor && <FloatingHearts />}

      <div className="confirmation-card">
        <div className="confetti-emoji">{isPending ? '⏳' : CONFIG.showFloatingDecor ? '🎉' : '✅'}</div>

        {isPending ? (
          <>
            <h2 className="confirmation-title">{CONFIG.afterConfirmTitle}</h2>
            <p className="confirmation-message">{CONFIG.afterConfirmMsg}</p>
          </>
        ) : (
          <>
            <h2 className="confirmation-title">{CONFIG.confirmTitle}</h2>
            {CONFIG.showFrogImage && (
              <img className="confirmation-image" src="./95b0e241ead5133e53d30d07fa0ed958.jpeg" alt="蛙" />
            )}
          </>
        )}

        <div className="confirmation-details">
          <div className="detail-row">
            <span className="detail-icon">📅</span>
            <span className="detail-text">{date ? formatDateCN(date) : ''}</span>
          </div>
          <div className="detail-row">
            <span className="detail-icon">⏰</span>
            <span className="detail-text">{timeSlot ? formatTimeCN(timeSlot) : ''}</span>
          </div>
          {CONFIG.hasActivities && (
            <div className="detail-row">
              <span className="detail-icon">🎯</span>
              <span className="detail-text">{getLabel(ACTIVITIES, activity)}</span>
            </div>
          )}
          {CONFIG.hasActivities && (
            <div className="detail-row">
              <span className="detail-icon">🍽️</span>
              <span className="detail-text">{getLabel(CUISINES, food)}</span>
            </div>
          )}
        </div>

        {CONFIG.showAnimals && (
          <div className="confirmation-animals">
            <span>🐕</span>
            <span className="heart-between">💗</span>
            <span className={CONFIG.showAdminEntry ? 'frog-clickable' : ''} onClick={handleFrogClick}>🐸</span>
          </div>
        )}

        <button className="btn-primary reset-btn" onClick={onReset}>
          🔄 重新安排
        </button>
      </div>
    </div>
  );
}
