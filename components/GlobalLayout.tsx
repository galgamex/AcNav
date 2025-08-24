'use client';

import { ReactNode } from 'react';
import { Header } from './Header';
import { UnifiedSidebar } from './UnifiedSidebar';
import { MobileDrawer } from './MobileDrawer';
import { Footer } from './Footer';
import { useGlobalState } from '@/contexts/GlobalStateContext';

interface GlobalLayoutProps {
  children: ReactNode;
  sidebarMode?: 'home' | 'navigation' | 'category' | 'website';
  sidebarProps?: {
    sidebarCategories?: any[];
    category?: any;
    activeSubCategory?: number | null;
    onSubCategoryChange?: (subCategoryId: number | null) => void;
    website?: any;
    categories?: any[];
  };
}

export function GlobalLayout({ 
  children, 
  sidebarMode = 'home',
  sidebarProps = {}
}: GlobalLayoutProps) {
  const { state, actions } = useGlobalState();
  const { isSidebarCollapsed, isMobileDrawerOpen } = state;

  const toggleSidebar = () => {
    actions.toggleSidebar();
  };

  const toggleMobileDrawer = () => {
    actions.toggleMobileDrawer();
  };

  const closeMobileDrawer = () => {
    actions.setMobileDrawerOpen(false);
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
        <UnifiedSidebar 
          mode={sidebarMode}
          isCollapsed={isSidebarCollapsed}
          {...sidebarProps}
        />
      </div>
      
      {/* 移动端抽屉菜单 */}
      <MobileDrawer 
        isOpen={isMobileDrawerOpen}
        onClose={closeMobileDrawer}
        mode={sidebarMode}
        {...sidebarProps}
      />
      
      <main className={`pt-12 md:pt-16 transition-all duration-300 ${
        isSidebarCollapsed ? 'md:ml-16' : 'md:ml-56'
      }`}>
        {children}
      </main>
      
      <Footer />
    </div>
  );
}
