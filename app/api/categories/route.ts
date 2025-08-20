import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth-simple';
import { prisma } from '@/lib/prisma';
import { cache, CacheService } from '@/lib/redis';
import { z } from 'zod';

const createCategorySchema = z.object({
  name: z.string().min(1, '分类名称不能为空'),
  iconUrl: z.string().optional(),
  icon: z.string().optional(),
  order: z.number().int().min(0),
  parentId: z.number().int().positive().optional().nullable(),
});

export async function GET() {
  try {
    // 尝试从缓存获取
    const cacheKey = CacheService.keys.categories();
    const cachedCategories = await cache.get(cacheKey);
    
    if (cachedCategories) {
      return NextResponse.json(cachedCategories);
    }

    // 使用单次查询获取所有分类数据，避免重复查询
    const allCategories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        websites: {
          orderBy: { order: 'asc' },
        },
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        children: {
          orderBy: { order: 'asc' },
          include: {
            websites: {
              orderBy: { order: 'asc' },
            },
            _count: {
              select: {
                websites: true,
              },
            },
          },
        },
        _count: {
          select: {
            websites: true,
          },
        },
      },
    });

    // 在内存中构建层级结构数据，避免额外的数据库查询
    const topLevelCategories = allCategories.filter(cat => !cat.parentId);

    const result = {
      categories: allCategories, // 扁平化的所有分类
      hierarchical: topLevelCategories, // 层级结构数据（已包含children）
    };

    // 缓存结果
    await cache.set(cacheKey, result, 1800); // 30分钟缓存

    return NextResponse.json(result);
  } catch (error) {
    console.error('获取分类失败:', error);
    return NextResponse.json(
      { error: '获取分类失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createCategorySchema.parse(body);

    // 检查分类名称是否已存在
    const existingCategory = await prisma.category.findUnique({
      where: { name: validatedData.name },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: '分类名称已存在' },
        { status: 400 }
      );
    }

    // 如果指定了父分类，验证父分类是否存在
    if (validatedData.parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: validatedData.parentId },
      });
      
      if (!parentCategory) {
        return NextResponse.json(
          { error: '指定的父分类不存在' },
          { status: 400 }
        );
      }
    }

    const category = await prisma.category.create({
      data: validatedData,
    });

    // 清除缓存
    await cache.del(CacheService.keys.categories());

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('创建分类失败:', error);
    return NextResponse.json(
      { error: '创建分类失败' },
      { status: 500 }
    );
  }
}