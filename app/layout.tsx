import type { Metadata } from 'next';
import './globals.css';
import { GlobalStateProvider } from '@/contexts/GlobalStateContext';
import { ThemeProvider } from '@/components/ThemeProvider';

// 使用系统字体替代Google Fonts以减少外部依赖
const systemFont = {
  className: 'font-sans'
};

export const metadata: Metadata = {
  title: 'ACGN - 精选优质网站导航',
  description: '精选优质网站导航平台，收录设计、ACG网站、AI工具、影视资源等实用网站，让您快速找到所需工具和资源。',
  keywords: 'ACGN导航,网站导航,网址大全,优质网站,设计工具,开发工具,影视资源,人工智能,AI工具,运营工具,生活服务,休闲娱乐,办公软件,实用工具,资源下载,职业技巧,网站推荐,导航平台,互联网导航,网站收藏',
  icons: {
    icon: '/Logo/Logo.png',
    shortcut: '/Logo/Logo.png',
    apple: '/Logo/Logo.png',
  },
  other: {
    'google-site-verification': process.env.GOOGLE_SITE_VERIFICATION || '',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* 使用系统字体，无需外部加载 */}
        
        {/* 移除Font Awesome CDN以消除渲染阻塞 */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* 确保页面在加载时有基本样式 */
              body { 
                margin: 0; 
                padding: 0; 
                font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background-color: #f9fafb;
                color: #1f2937;
              }
              .dark body {
                background-color: #111827;
                color: #f9fafb;
              }
              /* 防止布局偏移 */
              * {
                box-sizing: border-box;
              }
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
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
                  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (systemPrefersDark) {
                    document.documentElement.classList.add('dark');
                  }
                }
              })();
            `,
          }}
        />
      </head>
      <body className={systemFont.className}>
        {/* 预加载内容，确保FCP */}
        <noscript>
          <div style={{
            minHeight: '100vh',
            backgroundColor: '#f9fafb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#1f2937' }}>ACGN导航</h1>
              <p style={{ color: '#6b7280' }}>请启用JavaScript以获得完整体验</p>
            </div>
          </div>
        </noscript>
        <ThemeProvider>
          <GlobalStateProvider>
            {children}
          </GlobalStateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}