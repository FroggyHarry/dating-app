import { useEvadingPosition } from '../../hooks/useEvadingPosition';
import { useIsMobile } from '../../hooks/useIsMobile';
import './EvadingButton.css';

interface EvadingButtonProps {
  label: string;
}

export function EvadingButton({ label }: EvadingButtonProps) {
  const { buttonRef, jump } = useEvadingPosition();
  const isMobile = useIsMobile();

  const handleMouseEnter = () => {
    if (!isMobile) jump();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    jump();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    jump();
  };

  return (
    <button
      ref={buttonRef}
      className="evading-button"
      onMouseEnter={handleMouseEnter}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      tabIndex={-1}
      aria-hidden="true"
    >
      {label}
    </button>
  );
}
