import { useState, useEffect } from 'react';

/** 检测是否为触摸设备（手机/平板） */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsMobile(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0
      );
    };
    check();
    // 设备类型在页面加载后不会改变，无需持续监听
  }, []);

  return isMobile;
}
