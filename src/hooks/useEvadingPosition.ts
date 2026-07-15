import { useRef, useCallback } from 'react';

/**
 * 按钮躲闪 — 瞬移、大范围、随机方向
 */
export function useEvadingPosition() {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const jump = useCallback(() => {
    const btn = buttonRef.current;
    if (!btn) return;

    // 大范围随机：150~280px，方向完全随机
    const dist = 150 + Math.random() * 130;
    const angle = Math.random() * Math.PI * 2;

    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;

    btn.style.transform = `translate(${dx}px, ${dy}px)`;
  }, []);

  return { buttonRef, jump };
}
