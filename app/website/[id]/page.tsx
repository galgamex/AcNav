import { Layout } from '@/components/Layout';
import { Category } from '@/types';
import { prisma } from '@/lib/prisma';
import { cache, CacheService } from '@/lib/redis';
import { WebsiteDetailContent } from './WebsiteDetailContent';

interface LocalCategory {
  id: number;
  name: string;
  iconUrl: string | null;
  parentId: number | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  websites?: any[];
  children?: any[];
}

interface WebsiteDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

// 转换函数：将LocalCategory转换为Category
const convertToCategory = (localCat: any): Category => ({
  ...localCat,
  iconUrl: localCat.iconUrl || null,
  createdAt: new Date(localCat.createdAt),
  updatedAt: new Date(localCat.updatedAt)
});

// 获取分类数据的函数
const getCategories = async (): Promise<any[]> => {
  try {
    const cacheKey = CacheService.keys.categories();
    const cached = await cache.get(cacheKey);
    
    if (cached && Array.isArray(cached)) {
      return cached as any[];
    }
    
    const categories = await prisma.category.findMany({
      include: {
        websites: {
          orderBy: {
            order: 'asc',
          },
        },
        children: {
          include: {
            websites: {
              orderBy: {
                order: 'asc',
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });
    
    // 确保categories是数组后再缓存
    if (Array.isArray(categories)) {
      await cache.set(cacheKey, categories, 300); // 5分钟缓存
      return categories;
    } else {
      console.warn('数据库返回的分类数据不是数组:', categories);
      return [];
    }
  } catch (error) {
    console.error('获取分类失败:', error);
    return [];
  }
};

export default async function WebsiteDetailPage({ params }: WebsiteDetailPageProps) {
  const resolvedParams = await params;
  const categories = await getCategories();
  
  // 确保categories是数组，如果不是则使用空数组
  const safeCategoriesList = Array.isArray(categories) ? categories : [];
  
  return (
    <Layout 
      showMainContent={false}
    >
      <WebsiteDetailContent categories={safeCategoriesList.map(convertToCategory)} />
    </Layout>
  );
}