import './IntermediatePage.css';

interface IntermediatePageProps {
  onNext: () => void;
}

export function IntermediatePage({ onNext }: IntermediatePageProps) {
  return (
    <div className="intermediate-page phase-enter">
      <div className="intermediate-card">
        <div className="intermediate-emoji">😭</div>
        <h2 className="intermediate-title">不是，你真的点了愿意？</h2>
        <p className="intermediate-hint">
          我都已经准备好被你不要了
        </p>
        <button className="btn-primary" onClick={onNext}>
          干嘛
        </button>
      </div>
    </div>
  );
}
