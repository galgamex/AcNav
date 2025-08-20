import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CacheService } from '@/lib/redis';

// GET /api/navigation-pages/slug/[slug] - 通过slug获取导航页
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // 尝试从缓存获取
    const cacheKey = `navigationPage:${slug}`;
    const cached = await CacheService.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }
    
    const navigationPage = await prisma.navigationPage.findUnique({
      where: { 
        slug,
        isActive: true, // 只返回启用的导航页
      },
    });
    
    if (!navigationPage) {
      return NextResponse.json(
        { error: '导航页不存在或已禁用' },
        { status: 404 }
      );
    }
    
    // 解析JSON字段并获取分类信息
    const sidebarCategoryIds = navigationPage.sidebarCategories 
      ? JSON.parse(navigationPage.sidebarCategories) 
      : [];
    const headerCategoryIds = navigationPage.headerCategories 
      ? JSON.parse(navigationPage.headerCategories) 
      : [];
    
    // 获取分类详细信息
    const [sidebarCategories, headerCategories] = await Promise.all([
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
    
    const result = {
      ...navigationPage,
      sidebarCategories,
      headerCategories,
    };
    
    // 缓存结果（缓存30分钟）
    await CacheService.set(cacheKey, result, 1800);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('获取导航页失败:', error);
    return NextResponse.json(
      { error: '获取导航页失败' },
      { status: 500 }
    );
  }
}