import { EvadingButton } from '../EvadingButton/EvadingButton';
import './InvitationPopup.css';

interface InvitationPopupProps {
  onAccept: () => void;
}

export function InvitationPopup({ onAccept }: InvitationPopupProps) {
  return (
    <div className="invitation-popup phase-enter">
      {/* 装饰小动物 */}
      <div className="invitation-animals">
        <span className="animal animal-left">🐕</span>
        <span className="animal animal-right">🐱</span>
      </div>

      {/* 漂浮装饰 */}
      <div className="floating-decor">
        <span className="decor decor-1">💕</span>
        <span className="decor decor-2">✨</span>
        <span className="decor decor-3">🌸</span>
        <span className="decor decor-4">💖</span>
      </div>

      {/* 主卡片 */}
      <div className="invitation-card">
        <div className="invitation-emoji">💌</div>
        <h1 className="invitation-title">可以和蛙一起约会嘛？</h1>
        <p className="invitation-hint">
          系统检测到：对方已经紧张到开始写网页了
        </p>

        <div className="invitation-buttons">
          <button
            className="btn-primary invitation-yes-btn"
            onClick={onAccept}
          >
            愿意 ❤️
          </button>
          <EvadingButton label="不愿意 😭" />
        </div>
      </div>
    </div>
  );
}
