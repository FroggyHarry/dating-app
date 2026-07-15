import { CONFIG } from '../../config';
import './IntermediatePage.css';

interface IntermediatePageProps {
  onNext: () => void;
}

export function IntermediatePage({ onNext }: IntermediatePageProps) {
  return (
    <div className="intermediate-page phase-enter">
      <div className="intermediate-card">
        <div className="intermediate-emoji">😭</div>
        <h2 className="intermediate-title">{CONFIG.intermediateTitle}</h2>
        <p className="intermediate-hint">{CONFIG.intermediateHint}</p>
        <button className="btn-primary" onClick={onNext}>
          {CONFIG.intermediateBtn}
        </button>
      </div>
    </div>
  );
}
