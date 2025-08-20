import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/redis';

const CACHE_KEY_PREFIX = 'website:tags:';
const TAGS_CACHE_KEY = 'tags:all';

// 获取网址的所有标签
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const websiteId = parseInt(resolvedParams.id);
    
    if (isNaN(websiteId)) {
      return NextResponse.json(
        { error: '无效的网址ID' },
        { status: 400 }
      );
    }

    // 尝试从缓存获取
    const cacheKey = `${CACHE_KEY_PREFIX}${websiteId}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // 检查网址是否存在
    const website = await prisma.website.findUnique({
      where: { id: websiteId }
    });

    if (!website) {
      return NextResponse.json(
        { error: '网址不存在' },
        { status: 404 }
      );
    }

    // 获取网址的所有标签
    const websiteTags = await prisma.websiteTag.findMany({
      where: { websiteId },
      include: {
        tag: true
      },
      orderBy: {
        tag: {
          name: 'asc'
        }
      }
    });

    const tags = websiteTags.map(wt => wt.tag);

    // 缓存结果
    await cache.set(cacheKey, tags, 30 * 60);

    return NextResponse.json(tags);
  } catch (error) {
    console.error('获取网址标签失败:', error);
    return NextResponse.json(
      { error: '获取网址标签失败' },
      { status: 500 }
    );
  }
}

// 为网址添加标签
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const websiteId = parseInt(resolvedParams.id);
    
    if (isNaN(websiteId)) {
      return NextResponse.json(
        { error: '无效的网址ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { tagId } = body;

    if (!tagId || isNaN(parseInt(tagId))) {
      return NextResponse.json(
        { error: '无效的标签ID' },
        { status: 400 }
      );
    }

    const tagIdInt = parseInt(tagId);

    // 检查网址是否存在
    const website = await prisma.website.findUnique({
      where: { id: websiteId }
    });

    if (!website) {
      return NextResponse.json(
        { error: '网址不存在' },
        { status: 404 }
      );
    }

    // 检查标签是否存在
    const tag = await prisma.tag.findUnique({
      where: { id: tagIdInt }
    });

    if (!tag) {
      return NextResponse.json(
        { error: '标签不存在' },
        { status: 404 }
      );
    }

    // 检查关联是否已存在
    const existingRelation = await prisma.websiteTag.findUnique({
      where: {
        websiteId_tagId: {
          websiteId,
          tagId: tagIdInt
        }
      }
    });

    if (existingRelation) {
      return NextResponse.json(
        { error: '该标签已添加到此网址' },
        { status: 400 }
      );
    }

    // 创建关联
    const websiteTag = await prisma.websiteTag.create({
      data: {
        websiteId,
        tagId: tagIdInt
      },
      include: {
        tag: true
      }
    });

    // 清除相关缓存
    await cache.del(`${CACHE_KEY_PREFIX}${websiteId}`);
    await cache.del(TAGS_CACHE_KEY);

    return NextResponse.json(websiteTag.tag, { status: 201 });
  } catch (error) {
    console.error('添加网址标签失败:', error);
    return NextResponse.json(
      { error: '添加网址标签失败' },
      { status: 500 }
    );
  }
}

// 从网址移除标签
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const websiteId = parseInt(resolvedParams.id);
    
    if (isNaN(websiteId)) {
      return NextResponse.json(
        { error: '无效的网址ID' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const tagId = searchParams.get('tagId');

    if (!tagId || isNaN(parseInt(tagId))) {
      return NextResponse.json(
        { error: '无效的标签ID' },
        { status: 400 }
      );
    }

    const tagIdInt = parseInt(tagId);

    // 检查关联是否存在
    const existingRelation = await prisma.websiteTag.findUnique({
      where: {
        websiteId_tagId: {
          websiteId,
          tagId: tagIdInt
        }
      }
    });

    if (!existingRelation) {
      return NextResponse.json(
        { error: '该标签未添加到此网址' },
        { status: 404 }
      );
    }

    // 删除关联
    await prisma.websiteTag.delete({
      where: {
        websiteId_tagId: {
          websiteId,
          tagId: tagIdInt
        }
      }
    });

    // 清除相关缓存
    await cache.del(`${CACHE_KEY_PREFIX}${websiteId}`);
    await cache.del(TAGS_CACHE_KEY);

    return NextResponse.json(
      { message: '标签移除成功' },
      { status: 200 }
    );
  } catch (error) {
    console.error('移除网址标签失败:', error);
    return NextResponse.json(
      { error: '移除网址标签失败' },
      { status: 500 }
    );
  }
}