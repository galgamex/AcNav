import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { GlobalStateProvider } from '@/contexts/GlobalStateContext';
import { ThemeProvider } from '@/components/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AcMoe - 精选优质网站导航',
  description: '精选优质网站导航',
  icons: {
    icon: '/Logo/Logo.png',
    shortcut: '/Logo/Logo.png',
    apple: '/Logo/Logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap"
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