import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NavigationPageLayout } from '@/components/NavigationPageLayout';
import { prisma } from '@/lib/prisma';

interface NavigationPageProps {
  params: Promise<{ slug: string }>;
}

interface NavigationPageData {
  id: number;
  name: string;
  slug: string;
  title: string;
  description?: string;
  keywords?: string;
  isActive: boolean;
  sidebarCategories: Array<{
    id: number;
    name: string;
    icon?: string;
    order: number;
  }>;
  headerCategories: Array<{
    id: number;
    name: string;
    icon?: string;
    order: number;
  }>;
}

async function getNavigationPage(slug: string): Promise<NavigationPageData | null> {
  try {
    const navigationPage = await prisma.navigationPage.findUnique({
      where: { 
        slug,
        isActive: true, // 只返回启用的导航页
      },
    });
    
    if (!navigationPage) {
      return null;
    }
    
    // 解析JSON字段并获取分类信息
    const sidebarCategoryIds = navigationPage.sidebarCategories 
      ? JSON.parse(navigationPage.sidebarCategories) 
      : [];
    const headerCategoryIds = navigationPage.headerCategories 
      ? JSON.parse(navigationPage.headerCategories) 
      : [];
    
    // 获取分类详细信息
    const [sidebarCategoriesData, headerCategoriesData] = await Promise.all([
      sidebarCategoryIds.length > 0 
        ? prisma.category.findMany({
            where: { id: { in: sidebarCategoryIds } },
            orderBy: { order: 'asc' },
          })
        : [],
      headerCategoryIds.length > 0 
        ? prisma.category.findMany({
            where: { id: { in: headerCategoryIds } },
            orderBy: { order: 'asc' },
          })
        : [],
    ]);
    
    // 转换数据格式以匹配接口
    const sidebarCategories = sidebarCategoriesData.map(cat => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon || undefined,
      order: cat.order,
    }));
    
    const headerCategories = headerCategoriesData.map(cat => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon || undefined,
      order: cat.order,
    }));
    
    return {
      id: navigationPage.id,
      name: navigationPage.name,
      slug: navigationPage.slug,
      title: navigationPage.title,
      description: navigationPage.description || undefined,
      keywords: navigationPage.keywords || undefined,
      isActive: navigationPage.isActive,
      sidebarCategories,
      headerCategories,
    };
  } catch (error) {
    console.error('获取导航页失败:', error);
    return null;
  }
}

export async function generateMetadata(
  { params }: NavigationPageProps
): Promise<Metadata> {
  const { slug } = await params;
  const navigationPage = await getNavigationPage(slug);
  
  if (!navigationPage) {
    return {
      title: '页面不存在',
    };
  }
  
  return {
    title: navigationPage.title,
    description: navigationPage.description,
    keywords: navigationPage.keywords,
    openGraph: {
      title: navigationPage.title,
      description: navigationPage.description,
      type: 'website',
    },
  };
}

export default async function NavigationPage({ params }: NavigationPageProps) {
  const { slug } = await params;
  const navigationPage = await getNavigationPage(slug);
  
  if (!navigationPage) {
    notFound();
  }
  
  return (
    <NavigationPageLayout
      navigationPage={navigationPage}
      sidebarCategories={navigationPage.sidebarCategories}
      headerCategories={navigationPage.headerCategories}
    />
  );
}