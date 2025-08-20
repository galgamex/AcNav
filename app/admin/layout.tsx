'use client';

import { useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminMobileDrawer } from '@/components/admin/AdminMobileDrawer';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const toggleMobileDrawer = () => {
    setIsMobileDrawerOpen(!isMobileDrawerOpen);
  };

  const closeMobileDrawer = () => {
    setIsMobileDrawerOpen(false);
  };

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