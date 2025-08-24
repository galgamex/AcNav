import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://acgn.org';
  
  // 静态页面
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/submit`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ];

  try {
    // 获取所有分类
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        updatedAt: true,
      },
    });

    // 获取所有网站
    const websites = await prisma.website.findMany({
      select: {
        id: true,
        updatedAt: true,
      },
    });

    // 获取所有导航页面
    const navigationPages = await prisma.navigationPage.findMany({
      where: { isActive: true },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    // 分类页面
    const categoryPages = categories.map((category) => ({
      url: `${baseUrl}/category/${category.id}`,
      lastModified: category.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    // 网站详情页面
    const websitePages = websites.map((website) => ({
      url: `${baseUrl}/website/${website.id}`,
      lastModified: website.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

    // 导航页面
    const navPages = navigationPages.map((page) => ({
      url: `${baseUrl}/nav/${page.slug}`,
      lastModified: page.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    return [
      ...staticPages,
      ...categoryPages,
      ...websitePages,
      ...navPages,
    ];
  } catch (error) {
    console.error('生成网站地图时出错:', error);
    
    // 如果数据库查询失败，至少返回静态页面
    return staticPages;
  }
}
