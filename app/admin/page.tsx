import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen, Globe, BarChart3 } from 'lucide-react';
import { AuthGuard } from '@/components/admin/AuthGuard';

async function getStats() {
  const [categoriesCount, websitesCount] = await Promise.all([
    prisma.category.count(),
    prisma.website.count(),
  ]);

  return {
    categoriesCount,
    websitesCount,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <AuthGuard>
      <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          管理概览
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          欢迎使用 AcNavs 管理后台
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              分类总数
            </CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.categoriesCount}</div>
            <p className="text-xs text-muted-foreground">
              网站分类数量
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              网站总数
            </CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.websitesCount}</div>
            <p className="text-xs text-muted-foreground">
              收录的网站数量
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              平均每分类网站数
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.categoriesCount > 0 
                ? Math.round(stats.websitesCount / stats.categoriesCount * 10) / 10
                : 0
              }
            </div>
            <p className="text-xs text-muted-foreground">
              网站分布情况
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>快速开始</CardTitle>
          <CardDescription>
            开始管理您的网址导航
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">1. 创建分类</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                首先创建网站分类，如&ldquo;搜索引擎&rdquo;、&ldquo;社交媒体&rdquo;等
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">2. 添加网站</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                在分类下添加网站，系统会自动获取网站图标和描述
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </AuthGuard>
  );
}