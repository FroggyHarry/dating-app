import { useState, useRef, useCallback, useEffect } from 'react';
import { EvadingButton } from '../EvadingButton/EvadingButton';
import './InvitationPopup.css';

interface InvitationPopupProps {
  onAccept: () => void;
  onSecretClick: () => void;
}

export function InvitationPopup({ onAccept, onSecretClick }: InvitationPopupProps) {
  const [clickCount, setClickCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEmojiClick = useCallback(() => {
    const count = clickCount + 1;
    setClickCount(count);
    if (timerRef.current) clearTimeout(timerRef.current);

    if (count >= 3) {
      setClickCount(0);
      onSecretClick();
      return;
    }

    timerRef.current = setTimeout(() => setClickCount(0), 1500);
  }, [clickCount, onSecretClick]);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  return (
    <div className="invitation-popup phase-enter">
      <div className="invitation-animals">
        <span className="animal animal-left">🐕</span>
        <span className="animal animal-right">🐱</span>
      </div>

      <div className="floating-decor">
        <span className="decor decor-1">💕</span>
        <span className="decor decor-2">✨</span>
        <span className="decor decor-3">🌸</span>
        <span className="decor decor-4">💖</span>
      </div>

      <div className="invitation-card">
        <span className="invitation-emoji secret-trigger" onClick={handleEmojiClick}>
          💌
        </span>
        <h1 className="invitation-title">可以和蛙一起约会嘛？</h1>
        <p className="invitation-hint">
          系统检测到：对方已经紧张到开始写网页了
        </p>

        <div className="invitation-buttons">
          <button className="btn-primary invitation-yes-btn" onClick={onAccept}>
            愿意 ❤️
          </button>
          <EvadingButton label="不愿意 😭" />
        </div>
      </div>
    </div>
  );
}
