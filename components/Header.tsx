'use client';

import { Button } from '@/components/ui/button';
import { Moon, Sun, Settings, Menu, Plus, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useGlobalState } from '@/contexts/GlobalStateContext';

interface HeaderProps {
  onToggleSidebar?: () => void;
  onToggleMobileDrawer?: () => void;
  isSidebarCollapsed?: boolean;
}

export function Header({ onToggleSidebar, onToggleMobileDrawer, isSidebarCollapsed = false }: HeaderProps) {
  const { state, actions } = useGlobalState();
  const { isDark, isLoading } = state;

  return (
    <header 
      className={`fixed top-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-1  md:px-6 py-2 md:py-4 transition-all duration-300 ${
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
            aria-label="切换侧边栏"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {/* 移动端抽屉菜单切换按钮 */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onToggleMobileDrawer}
            className="md:hidden hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="打开移动端菜单"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-1 md:space-x-2">
          
          
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
            onClick={actions.toggleTheme}
            className="h-8 w-8 md:h-10 md:w-10"
            aria-label={isDark ? "切换到浅色模式" : "切换到深色模式"}
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