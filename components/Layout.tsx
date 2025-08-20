'use client';

import { useState, ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';
import { MobileDrawer } from './MobileDrawer';

interface LayoutProps {
  children?: ReactNode;
  showMainContent?: boolean;
}

export function Layout({ children, showMainContent = true }: LayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileDrawer = () => {
    setIsMobileDrawerOpen(!isMobileDrawerOpen);
  };

  const closeMobileDrawer = () => {
    setIsMobileDrawerOpen(false);
  };

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        onToggleSidebar={toggleSidebar} 
        onToggleMobileDrawer={toggleMobileDrawer}
        isSidebarCollapsed={isSidebarCollapsed}
      />
      
      {/* 桌面端侧边栏 */}
      <div className="hidden md:block">
        <Sidebar 
          isCollapsed={isSidebarCollapsed}
        />
      </div>
      
      {/* 移动端抽屉菜单 */}
      <MobileDrawer 
        isOpen={isMobileDrawerOpen}
        onClose={closeMobileDrawer}
      />
      
      <main className={`pt-12 md:pt-16 transition-all duration-300 ${
        isSidebarCollapsed ? 'md:ml-16' : 'md:ml-56'
      }`}>
        {children ? children : (
          showMainContent && (
            <MainContent 
              showHeader={false}
            />
          )
        )}
      </main>
    </div>
  );

}