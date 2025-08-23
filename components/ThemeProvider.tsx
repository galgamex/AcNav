'use client';

import { useEffect, useState } from 'react';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 确保组件已经挂载到客户端
    setMounted(true);
    
    // 初始化主题
    const initializeTheme = () => {
      try {
        const theme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldBeDark = theme === 'dark' || (!theme && systemPrefersDark);
        
        if (shouldBeDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (e) {
        // 如果localStorage不可用，使用系统偏好
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (systemPrefersDark) {
          document.documentElement.classList.add('dark');
        }
      }
    };

    // 立即执行一次
    initializeTheme();
  }, []);

  // 在客户端挂载之前，返回一个简单的包装器，避免水合不匹配
  if (!mounted) {
    return (
      <div style={{ 
        visibility: 'hidden',
        minHeight: '100vh',
        backgroundColor: 'rgba(245, 245, 245, 1)'
      }}>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}
