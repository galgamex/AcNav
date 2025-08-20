import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/redis';

const CACHE_KEY = 'tags:all';

// 获取单个标签
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '无效的标签ID' },
        { status: 400 }
      );
    }

    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        websiteTags: {
          include: {
            website: {
              select: {
                id: true,
                name: true,
                url: true,
                iconUrl: true
              }
            }
          }
        },
        _count: {
          select: {
            websiteTags: true
          }
        }
      }
    });

    if (!tag) {
      return NextResponse.json(
        { error: '标签不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(tag);
  } catch (error) {
    console.error('获取标签失败:', error);
    return NextResponse.json(
      { error: '获取标签失败' },
      { status: 500 }
    );
  }
}

// 更新标签
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '无效的标签ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, color, description } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: '标签名称不能为空' },
        { status: 400 }
      );
    }

    // 检查标签是否存在
    const existingTag = await prisma.tag.findUnique({
      where: { id }
    });

    if (!existingTag) {
      return NextResponse.json(
        { error: '标签不存在' },
        { status: 404 }
      );
    }

    // 检查名称是否与其他标签冲突
    if (name.trim() !== existingTag.name) {
      const nameConflict = await prisma.tag.findUnique({
        where: { name: name.trim() }
      });

      if (nameConflict) {
        return NextResponse.json(
          { error: '标签名称已存在' },
          { status: 400 }
        );
      }
    }

    // 更新标签
    const updatedTag = await prisma.tag.update({
      where: { id },
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
    await cache.del(CACHE_KEY);

    return NextResponse.json(updatedTag);
  } catch (error) {
    console.error('更新标签失败:', error);
    return NextResponse.json(
      { error: '更新标签失败' },
      { status: 500 }
    );
  }
}

// 删除标签
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '无效的标签ID' },
        { status: 400 }
      );
    }

    // 检查标签是否存在
    const existingTag = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            websiteTags: true
          }
        }
      }
    });

    if (!existingTag) {
      return NextResponse.json(
        { error: '标签不存在' },
        { status: 404 }
      );
    }

    // 删除标签（关联的WebsiteTag会因为CASCADE自动删除）
    await prisma.tag.delete({
      where: { id }
    });

    // 清除缓存
    await cache.del(CACHE_KEY);

    return NextResponse.json(
      { message: '标签删除成功' },
      { status: 200 }
    );
  } catch (error) {
    console.error('删除标签失败:', error);
    return NextResponse.json(
      { error: '删除标签失败' },
      { status: 500 }
    );
  }
}