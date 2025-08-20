import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cache, CacheService } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json([]);
    }

    const searchTerm = query.trim();
    
    // 生成缓存键
    const cacheKey = `search:${searchTerm.toLowerCase()}`;
    
    // 尝试从缓存获取搜索结果
    const cachedResults = await cache.get(cacheKey);
    if (cachedResults) {
      return NextResponse.json(cachedResults);
    }

    // 从数据库搜索
    const websites = await prisma.website.findMany({
      where: {
        OR: [
          {
            name: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            url: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            category: {
              name: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          },
        ],
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        {
          isRecommended: 'desc', // 推荐网站优先
        },
        {
          order: 'asc',
        },
      ],
      take: 20, // 限制结果数量
    });

    // 缓存搜索结果（5分钟）
    await cache.set(cacheKey, websites, 300);

    return NextResponse.json(websites);
  } catch (error) {
    console.error('搜索失败:', error);
    return NextResponse.json(
      { error: '搜索失败' },
      { status: 500 }
    );
  }
}