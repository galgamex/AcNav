import { prisma } from './prisma';
import { CacheService } from './redis';

export interface Category {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Website {
  id: number;
  name: string;
  url: string;
  description?: string;
  icon?: string;
  categoryId: number;
  isRecommended: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: number;
  name: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 获取所有分类
export async function getCategories(): Promise<Category[]> {
  try {
    // 尝试从缓存获取
    const cached = await CacheService.get<Category[]>(CacheService.keys.categories());
    if (cached) {
      return cached;
    }

    // 从数据库获取
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc'
      }
    }) as Category[];

    // 缓存结果
    await CacheService.set(CacheService.keys.categories(), categories, 30 * 60); // 30分钟

    return categories;
  } catch (error) {
    console.error('获取分类失败:', error);
    return [];
  }
}

// 根据分类ID获取网站
export async function getWebsitesByCategory(categoryId: number): Promise<Website[]> {
  try {
    // 尝试从缓存获取
    const cacheKey = CacheService.keys.websitesByCategory(categoryId);
    const cached = await CacheService.get<Website[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // 从数据库获取
    const websites = await prisma.website.findMany({
      where: {
        categoryId: categoryId
      },
      orderBy: {
        name: 'asc'
      }
    }) as Website[];

    // 缓存结果
    await CacheService.set(cacheKey, websites, 30 * 60); // 30分钟

    return websites;
  } catch (error) {
    console.error('获取分类网站失败:', error);
    return [];
  }
}

// 获取推荐网站
export async function getRecommendedWebsites(): Promise<Website[]> {
  try {
    // 尝试从缓存获取
    const cacheKey = CacheService.keys.recommendedWebsites();
    const cached = await CacheService.get<Website[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // 从数据库获取
    const websites = await prisma.website.findMany({
      where: {
        isRecommended: true
      },
      orderBy: {
        name: 'asc'
      }
    }) as Website[];

    // 缓存结果
    await CacheService.set(cacheKey, websites, 30 * 60); // 30分钟

    return websites;
  } catch (error) {
    console.error('获取推荐网站失败:', error);
    return [];
  }
}

// 搜索网站
export async function searchWebsites(query: string): Promise<Website[]> {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    // 尝试从缓存获取
    const cacheKey = CacheService.keys.searchResults(query.toLowerCase());
    const cached = await CacheService.get<Website[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // 从数据库搜索
    const websites = await prisma.website.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            url: {
              contains: query,
              mode: 'insensitive'
            }
          }
        ]
      },
      orderBy: {
        name: 'asc'
      }
    }) as Website[];

    // 缓存结果
    await CacheService.set(cacheKey, websites, 10 * 60); // 10分钟

    return websites;
  } catch (error) {
    console.error('搜索网站失败:', error);
    return [];
  }
}

// 获取所有标签
export async function getTags(): Promise<Tag[]> {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: {
        name: 'asc'
      }
    }) as Tag[];

    return tags;
  } catch (error) {
    console.error('获取标签失败:', error);
    return [];
  }
}

// 根据网站ID获取网站详情
export async function getWebsiteById(id: number): Promise<Website | null> {
  try {
    const website = await prisma.website.findUnique({
      where: {
        id: id
      }
    }) as Website | null;

    return website;
  } catch (error) {
    console.error('获取网站详情失败:', error);
    return null;
  }
}

// 根据分类ID获取分类详情
export async function getCategoryById(id: number): Promise<Category | null> {
  try {
    const category = await prisma.category.findUnique({
      where: {
        id: id
      }
    }) as Category | null;

    return category;
  } catch (error) {
    console.error('获取分类详情失败:', error);
    return null;
  }
}