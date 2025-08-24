'use client';

import { useEffect, useState } from 'react';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 确保组件已经挂载到客户端
    setMounted(true);
  }, []);

  // 直接返回children，主题初始化已在layout中的内联脚本处理
  // 这样可以确保Lighthouse能够检测到首次内容绘制(FCP)
  return <>{children}</>;
}
