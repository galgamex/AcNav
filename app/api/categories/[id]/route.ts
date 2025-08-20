import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth-simple';
import { prisma } from '@/lib/prisma';
import { cache, CacheService } from '@/lib/redis';
import { z } from 'zod';

const updateCategorySchema = z.object({
  name: z.string().min(1, '分类名称不能为空').optional(),
  iconUrl: z.string().optional(),
  icon: z.string().optional(),
  order: z.number().int().min(0).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { id } = await params;
    const categoryId = parseInt(id);
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: '无效的分类ID' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = updateCategorySchema.parse(body);

    // 检查分类是否存在
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return NextResponse.json({ error: '分类不存在' }, { status: 404 });
    }

    // 如果更新名称，检查是否与其他分类重名
    if (validatedData.name && validatedData.name !== existingCategory.name) {
      const duplicateCategory = await prisma.category.findUnique({
        where: { name: validatedData.name },
      });

      if (duplicateCategory) {
        return NextResponse.json(
          { error: '分类名称已存在' },
          { status: 400 }
        );
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: validatedData,
    });

    // 清除相关缓存
    await Promise.all([
      cache.del(CacheService.keys.categories()),
      cache.del(CacheService.keys.categoryWebsites(categoryId)),
    ]);

    return NextResponse.json(updatedCategory);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('更新分类失败:', error);
    return NextResponse.json(
      { error: '更新分类失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { id } = await params;
    const categoryId = parseInt(id);
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: '无效的分类ID' }, { status: 400 });
    }

    // 检查分类是否存在
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { websites: true },
    });

    if (!existingCategory) {
      return NextResponse.json({ error: '分类不存在' }, { status: 404 });
    }

    // 检查是否有关联的网站
    if (existingCategory.websites.length > 0) {
      return NextResponse.json(
        { error: '该分类下还有网站，无法删除' },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    // 清除缓存
    await cache.del(CacheService.keys.categories());

    return NextResponse.json({ message: '分类删除成功' });
  } catch (error) {
    console.error('删除分类失败:', error);
    return NextResponse.json(
      { error: '删除分类失败' },
      { status: 500 }
    );
  }
}