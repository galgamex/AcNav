import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { GlobalStateProvider } from '@/contexts/GlobalStateContext';
import { ThemeProvider } from '@/components/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ACGN - 精选优质网站导航',
  description: 'ACGN导航(ACGN.org)致力于打造国内最好的互联网优质网站网址大全，收录了全网好用强大的网站网址和软件，涵盖设计、开发、影视、人工智能、AI、运营、生活、休闲、办公、工具、资源等超全面的网址和职业技巧内容，让您的上网体验更便捷更放心，努力成为全民级人人都信赖的导航平台。',
  keywords: 'ACGN导航,网站导航,网址大全,优质网站,设计工具,开发工具,影视资源,人工智能,AI工具,运营工具,生活服务,休闲娱乐,办公软件,实用工具,资源下载,职业技巧,网站推荐,导航平台,互联网导航,网站收藏',
  icons: {
    icon: '/Logo/Logo.png',
    shortcut: '/Logo/Logo.png',
    apple: '/Logo/Logo.png',
  },
  other: {
    'google-fonts': 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" data-scroll-behavior="smooth">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <GlobalStateProvider>
            {children}
          </GlobalStateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}