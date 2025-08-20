import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth-simple';
import { prisma } from '@/lib/prisma';
import { cache, CacheService } from '@/lib/redis';
import { z } from 'zod';

// 获取单个网站详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const websiteId = parseInt(id);
    if (isNaN(websiteId)) {
      return NextResponse.json({ error: '无效的网站ID' }, { status: 400 });
    }

    const website = await prisma.website.findUnique({
      where: { id: websiteId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            iconUrl: true,
          },
        },
        websiteTags: {
          include: {
            tag: true
          }
        }
      },
    });

    if (!website) {
      return NextResponse.json({ error: '网站不存在' }, { status: 404 });
    }

    return NextResponse.json(website);
  } catch (error) {
    console.error('获取网站详情失败:', error);
    return NextResponse.json(
      { error: '获取网站详情失败' },
      { status: 500 }
    );
  }
}

const updateWebsiteSchema = z.object({
  name: z.string().optional(),
  url: z.string().url('请输入有效的URL').optional(),
  iconUrl: z.string().optional(),
  description: z.string().optional(),
  order: z.number().int().min(0).optional(),
  categoryId: z.number().int().min(1).optional(),
  isRecommended: z.boolean().optional(),
  tagNames: z.array(z.string()).optional(),
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
    const websiteId = parseInt(id);
    if (isNaN(websiteId)) {
      return NextResponse.json({ error: '无效的网站ID' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = updateWebsiteSchema.parse(body);

    // 检查网站是否存在
    const existingWebsite = await prisma.website.findUnique({
      where: { id: websiteId },
    });

    if (!existingWebsite) {
      return NextResponse.json({ error: '网站不存在' }, { status: 404 });
    }

    // 如果更新分类，检查新分类是否存在
    if (validatedData.categoryId && validatedData.categoryId !== existingWebsite.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: validatedData.categoryId },
      });

      if (!category) {
        return NextResponse.json({ error: '目标分类不存在' }, { status: 400 });
      }
    }

    const { tagNames, ...websiteUpdateData } = validatedData;
    
    const updatedWebsite = await prisma.website.update({
      where: { id: websiteId },
      data: websiteUpdateData,
      include: { 
        category: true,
        websiteTags: {
          include: {
            tag: true
          }
        }
      },
    });

    // 更新标签关联
    if (tagNames !== undefined) {
      // 删除现有的标签关联
      await prisma.websiteTag.deleteMany({
        where: { websiteId: websiteId }
      });
      
      // 处理标签：自动创建不存在的标签并建立关联
      if (tagNames.length > 0) {
        const tagIds: number[] = [];
        
        for (const tagName of tagNames) {
          const trimmedName = tagName.trim();
          if (!trimmedName) continue;
          
          // 查找或创建标签
          let tag = await prisma.tag.findFirst({
            where: { name: trimmedName }
          });
          
          if (!tag) {
            // 生成随机颜色
            const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            
            tag = await prisma.tag.create({
              data: {
                name: trimmedName,
                color: randomColor,
                description: `自动创建的标签：${trimmedName}`
              }
            });
          }
          
          tagIds.push(tag.id);
        }
        
        // 创建网站标签关联
        if (tagIds.length > 0) {
          await prisma.websiteTag.createMany({
            data: tagIds.map(tagId => ({
              websiteId: websiteId,
              tagId: tagId
            })),
            skipDuplicates: true
          });
        }
      }
    }

    // 清除相关缓存
    const cachePromises = [
      cache.del(CacheService.keys.categories()),
      cache.del(CacheService.keys.categoryWebsites(existingWebsite.categoryId)),
      cache.del(CacheService.keys.recommended()),
    ];

    // 如果分类发生变化，也清除新分类的缓存
    if (validatedData.categoryId && validatedData.categoryId !== existingWebsite.categoryId) {
      cachePromises.push(
        cache.del(CacheService.keys.categoryWebsites(validatedData.categoryId))
      );
    }

    await Promise.all(cachePromises);

    return NextResponse.json(updatedWebsite);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('更新网站失败:', error);
    return NextResponse.json(
      { error: '更新网站失败' },
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
    const websiteId = parseInt(id);
    if (isNaN(websiteId)) {
      return NextResponse.json({ error: '无效的网站ID' }, { status: 400 });
    }

    // 直接删除网站，同时获取被删除的网站信息用于清除缓存
    const deletedWebsite = await prisma.website.delete({
      where: { id: websiteId },
    });

    // 清除相关缓存
    await Promise.all([
      cache.del(CacheService.keys.categories()),
      cache.del(CacheService.keys.categoryWebsites(deletedWebsite.categoryId)),
      cache.del(CacheService.keys.recommended()),
    ]);

    return NextResponse.json({ message: '网站删除成功' });
  } catch (error: any) {
    // 处理网站不存在的情况
    if (error.code === 'P2025') {
      return NextResponse.json({ error: '网站不存在' }, { status: 404 });
    }
    
    console.error('删除网站失败:', error);
    return NextResponse.json(
      { error: '删除网站失败' },
      { status: 500 }
    );
  }
}