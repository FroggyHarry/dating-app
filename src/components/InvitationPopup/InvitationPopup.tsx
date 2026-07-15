import { useState, useRef, useCallback, useEffect } from 'react';
import { EvadingButton } from '../EvadingButton/EvadingButton';
import { CONFIG } from '../../config';
import './InvitationPopup.css';

interface InvitationPopupProps {
  onAccept: () => void;
  onSecretClick: () => void;
}

export function InvitationPopup({ onAccept, onSecretClick }: InvitationPopupProps) {
  const [clickCount, setClickCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEmojiClick = useCallback(() => {
    if (!CONFIG.showAdminEntry) return;
    const count = clickCount + 1;
    setClickCount(count);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (count >= 3) { setClickCount(0); onSecretClick(); return; }
    timerRef.current = setTimeout(() => setClickCount(0), 1500);
  }, [clickCount, onSecretClick]);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  return (
    <div className="invitation-popup phase-enter">
      {CONFIG.showAnimals && (
        <div className="invitation-animals">
          <span className="animal animal-left">🐕</span>
          <span className="animal animal-right">🐱</span>
        </div>
      )}

      {CONFIG.showFloatingDecor && (
        <div className="floating-decor">
          <span className="decor decor-1">💕</span>
          <span className="decor decor-2">✨</span>
          <span className="decor decor-3">🌸</span>
          <span className="decor decor-4">💖</span>
        </div>
      )}

      <div className="invitation-card">
        <span className={`invitation-emoji${CONFIG.showAdminEntry ? ' secret-trigger' : ''}`} onClick={handleEmojiClick}>
          {CONFIG.showAdminEntry ? '💌' : '📅'}
        </span>
        <h1 className="invitation-title">{CONFIG.inviteTitle}</h1>
        {CONFIG.inviteHint && (
          <p className="invitation-hint">{CONFIG.inviteHint}</p>
        )}

        <div className="invitation-buttons">
          <button className="btn-primary invitation-yes-btn" onClick={onAccept}>
            {CONFIG.showEvadingButton ? '愿意 ❤️' : '开始预约'}
          </button>
          {CONFIG.showEvadingButton && <EvadingButton label="不愿意 😭" />}
        </div>
      </div>
    </div>
  );
}
