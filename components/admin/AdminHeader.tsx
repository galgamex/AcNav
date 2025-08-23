'use client';

import { Button } from '@/components/ui/button';
import { LogOut, Settings, Menu, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AdminHeaderProps {
  onToggleMobileDrawer?: () => void;
}

export function AdminHeader({ onToggleMobileDrawer }: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (error) {
      console.error('退出登录失败:', error);
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 py-2 md:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* 移动端菜单按钮 */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onToggleMobileDrawer}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <h1 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
            AcNavs 管理后台
          </h1>
        </div>
        
        <div className="flex items-center space-x-1 md:space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleGoHome}
            className="h-8 w-8 md:h-10 md:w-10 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20"
            title="返回首页"
          >
            <Home className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10">
            <Settings className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleLogout}
            className="h-8 w-8 md:h-10 md:w-10"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}