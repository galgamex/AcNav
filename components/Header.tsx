'use client';

import { Button } from '@/components/ui/button';
import { Moon, Sun, Settings, Menu, Plus, ExternalLink, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useGlobalState } from '@/contexts/GlobalStateContext';
import { useState, useEffect, useRef } from 'react';

interface HeaderProps {
  onToggleSidebar?: () => void;
  onToggleMobileDrawer?: () => void;
  isSidebarCollapsed?: boolean;
}

export function Header({ onToggleSidebar, onToggleMobileDrawer, isSidebarCollapsed = false }: HeaderProps) {
  const { state, actions } = useGlobalState();
  const { isDark, navigationPages, isLoading } = state;
  const [showNavigationDropdown, setShowNavigationDropdown] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 确保客户端挂载
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNavigationDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
          
          {/* 更多导航下拉菜单 */}
          {isClient && navigationPages && navigationPages.length > 0 && (
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="ghost"
                onClick={() => setShowNavigationDropdown(!showNavigationDropdown)}
                className="flex items-center space-x-1 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 h-8 md:h-10"
              >
                <span>更多导航</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showNavigationDropdown ? 'rotate-180' : ''}`} />
              </Button>
              
              {showNavigationDropdown && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1 z-50">
                  {navigationPages.map((page) => (
                    <Link
                      key={page.id}
                      href={`/nav/${page.slug}`}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setShowNavigationDropdown(false)}
                    >
                      {page.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

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
            onClick={actions.toggleTheme}
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