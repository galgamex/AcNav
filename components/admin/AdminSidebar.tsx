'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, FolderOpen, Globe, Settings, Tag, FileText, Layout } from 'lucide-react';

const navigation = [
  { name: '概览', href: '/admin', icon: Home },
  { name: '页面设置', href: '/admin/navigation-pages', icon: Layout },
  { name: '分类管理', href: '/admin/categories', icon: FolderOpen },
  { name: '网站管理', href: '/admin/websites', icon: Globe },
  { name: '标签管理', href: '/admin/tags', icon: Tag },
  { name: '收录申请', href: '/admin/submissions', icon: FileText },

  { name: '设置', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              )}
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}