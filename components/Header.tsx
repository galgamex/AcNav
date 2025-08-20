'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Settings, Menu, Plus } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  onToggleSidebar?: () => void;
  onToggleMobileDrawer?: () => void;
  isSidebarCollapsed?: boolean;
}

export function Header({ onToggleSidebar, onToggleMobileDrawer, isSidebarCollapsed = false }: HeaderProps) {
  const [isDark, setIsDark] = useState(false);

  // 初始化主题
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);



  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <header 
      className={`fixed top-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 py-2 md:py-4 transition-all duration-300 ${
        isSidebarCollapsed ? 'left-0 md:left-16' : 'left-0 md:left-56'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* 桌面端侧边栏切换按钮 */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onToggleSidebar}
            className="hidden md:flex hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {/* 移动端抽屉菜单切换按钮 */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onToggleMobileDrawer}
            className="md:hidden hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {/* 顶部导航内容可在后台自定义 */}
          <div className="hidden lg:flex items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400 px-3 py-2">
              顶部导航内容可在后台自定义
            </span>
          </div>
        </div>
        

        
        <div className="flex items-center space-x-1 md:space-x-2">
          <Link href="/admin">
            <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
          
          <Link href="/submit">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 md:h-10 md:w-10 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20"
              title="申请收录"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </Link>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8 md:h-10 md:w-10"
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
   );
}