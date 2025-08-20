import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/redis';

const CACHE_KEY_PREFIX = 'tag_websites:';
const CACHE_TTL = 1800; // 30分钟

// 获取标签对应的网站列表
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const tagId = parseInt(resolvedParams.id);
    
    if (isNaN(tagId)) {
      return NextResponse.json(
        { error: '无效的标签ID' },
        { status: 400 }
      );
    }

    // 尝试从缓存获取
    const cacheKey = `${CACHE_KEY_PREFIX}${tagId}`;
    try {
      const cachedWebsites = await cache.get(cacheKey);
      if (cachedWebsites) {
        return NextResponse.json(cachedWebsites);
      }
    } catch (cacheError) {
      console.warn('Redis缓存获取失败:', cacheError);
    }

    // 检查标签是否存在
    const tag = await prisma.tag.findUnique({
      where: { id: tagId }
    });

    if (!tag) {
      return NextResponse.json(
        { error: '标签不存在' },
        { status: 404 }
      );
    }

    // 获取标签对应的网站
    const websiteTags = await prisma.websiteTag.findMany({
      where: { tagId },
      include: {
        website: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                iconUrl: true
              }
            }
          }
        }
      },
      orderBy: {
        website: {
          order: 'asc'
        }
      }
    });

    const websites = websiteTags.map(wt => wt.website);

    // 缓存结果
    try {
 // 缓存结果
    await cache.set(cacheKey, websites, CACHE_TTL);
    } catch (cacheError) {
      console.warn('Redis缓存设置失败:', cacheError);
    }

    return NextResponse.json(websites);
  } catch (error) {
    console.error('获取标签网站失败:', error);
    return NextResponse.json(
      { error: '获取标签网站失败' },
      { status: 500 }
    );
  }
}