'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminMobileDrawer } from '@/components/admin/AdminMobileDrawer';
import { useAuth } from '@/hooks/useAuth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading } = useAuth();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileDrawer = () => {
    setIsMobileDrawerOpen(!isMobileDrawerOpen);
  };

  const closeMobileDrawer = () => {
    setIsMobileDrawerOpen(false);
  };

  // 如果是登录页面，直接返回children，不显示管理后台布局
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // 如果正在加载认证状态，显示加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  // 如果未认证且不在登录页，显示加载状态
  if (!isAuthenticated && pathname !== '/admin/login') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">验证中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader onToggleMobileDrawer={toggleMobileDrawer} />
      <div className="flex pt-16">
        {/* 桌面端侧边栏 */}
        <div className="hidden md:block">
          <AdminSidebar />
        </div>
        
        {/* 移动端抽屉菜单 */}
        <AdminMobileDrawer
          isOpen={isMobileDrawerOpen}
          onClose={closeMobileDrawer}
        />
        
        <main className="flex-1 md:pt-16 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}