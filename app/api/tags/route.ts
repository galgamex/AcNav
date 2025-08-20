import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cache, redis } from '@/lib/redis';

const CACHE_KEY = 'tags:all';
const CACHE_TTL = 30 * 60; // 30分钟

// 获取所有标签
export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { websiteTags: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // 缓存结果
    await cache.set('tags:all', tags, 300);

    return NextResponse.json(tags);
  } catch (error) {
    console.error('获取标签失败:', error);
    return NextResponse.json(
      { error: '获取标签失败' },
      { status: 500 }
    );
  }
}

// 创建新标签
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, color, description } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: '标签名称不能为空' },
        { status: 400 }
      );
    }

    // 检查标签是否已存在
    const existingTag = await prisma.tag.findUnique({
      where: { name: name.trim() }
    });

    if (existingTag) {
      return NextResponse.json(
        { error: '标签名称已存在' },
        { status: 400 }
      );
    }

    // 创建新标签
    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        color: color || null,
        description: description || null
      },
      include: {
        _count: {
          select: {
            websiteTags: true
          }
        }
      }
    });

    // 清除缓存
    await redis.del(CACHE_KEY);

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error('创建标签失败:', error);
    return NextResponse.json(
      { error: '创建标签失败' },
      { status: 500 }
    );
  }
}