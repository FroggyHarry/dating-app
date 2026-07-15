import { useMemo } from 'react';
import './FloatingHearts.css';

const HEART_EMOJIS = ['❤️', '💕', '💗', '💖', '💝', '💘', '🌸', '✨'];

interface Heart {
  id: number;
  emoji: string;
  left: number;
  size: number;
  duration: number;
  delay: number;
}

export function FloatingHearts() {
  const hearts: Heart[] = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      emoji: HEART_EMOJIS[i % HEART_EMOJIS.length],
      left: Math.random() * 100,
      size: 18 + Math.random() * 28,
      duration: 2.5 + Math.random() * 3.5,
      delay: Math.random() * 2,
    }));
  }, []);

  return (
    <div className="floating-hearts" aria-hidden="true">
      {hearts.map((h) => (
        <span
          key={h.id}
          className="heart-particle"
          style={{
            left: `${h.left}%`,
            fontSize: `${h.size}px`,
            animationDuration: `${h.duration}s`,
            animationDelay: `${h.delay}s`,
          }}
        >
          {h.emoji}
        </span>
      ))}
    </div>
  );
}
