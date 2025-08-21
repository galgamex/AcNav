import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NavigationPageLayout } from '@/components/NavigationPageLayout';

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
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/navigation-pages/slug/${slug}`, {
      cache: 'no-store', // 确保获取最新数据
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
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