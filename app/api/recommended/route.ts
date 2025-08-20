import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cache, CacheService } from '@/lib/redis';

export async function GET() {
  try {
    // 尝试从缓存获取推荐网站
    const cacheKey = CacheService.keys.recommendedWebsites();
    const cachedRecommended = await cache.get(cacheKey);
    
    if (cachedRecommended) {
      return NextResponse.json(cachedRecommended);
    }

    // 获取所有推荐网站
    const recommendedWebsites = await prisma.website.findMany({
      where: {
        isRecommended: true,
      },
      orderBy: {
        order: 'asc',
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const result = {
      websites: recommendedWebsites,
      count: recommendedWebsites.length,
    };

    // 缓存结果（30分钟）
    await cache.set(cacheKey, result, 1800);

    return NextResponse.json(result);
  } catch (error) {
    console.error('获取推荐网站失败:', error);
    return NextResponse.json(
      { error: '获取推荐网站失败' },
      { status: 500 }
    );
  }
}