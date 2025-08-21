import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth-simple';
import { prisma } from '@/lib/prisma';
import { cache, CacheService } from '@/lib/redis';
import { z } from 'zod';
import { generateIconUrl } from '@/lib/utils';
import { fetchWebsiteInfo } from '@/lib/website-scraper';

const createWebsiteSchema = z.object({
  name: z.string().optional(),
  url: z.string().url('请输入有效的URL'),
  iconUrl: z.string().optional(),
  description: z.string().optional(),
  order: z.number().int().min(0),
  categoryId: z.number().int().min(1),
  isRecommended: z.boolean().optional().default(false),
  tagNames: z.array(z.string()).optional().default([]),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (categoryId) {
      // 获取特定分类的网站
      const cacheKey = CacheService.keys.categoryWebsites(parseInt(categoryId));
      const cachedWebsites = await cache.get(cacheKey);
      
      if (cachedWebsites) {
        return NextResponse.json(cachedWebsites);
      }

      const websites = await prisma.website.findMany({
        where: { categoryId: parseInt(categoryId) },
        orderBy: { order: 'asc' },
        include: { category: true },
      });

      const result = { websites };
      await cache.set(cacheKey, result, 1800);
      return NextResponse.json(result);
    }

    // 分页获取所有网站
    const skip = (page - 1) * limit;
    const [websites, total] = await Promise.all([
      prisma.website.findMany({
        skip,
        take: limit,
        orderBy: [{ categoryId: 'asc' }, { order: 'asc' }],
        include: { category: true },
      }),
      prisma.website.count(),
    ]);

    return NextResponse.json({
      data: websites,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('获取网站失败:', error);
    return NextResponse.json(
      { error: '获取网站失败' },
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
    const validatedData = createWebsiteSchema.parse(body);

    // 检查分类是否存在
    const category = await prisma.category.findUnique({
      where: { id: validatedData.categoryId },
    });

    if (!category) {
      return NextResponse.json({ error: '分类不存在' }, { status: 400 });
    }

    // 自动获取网站信息
    const websiteData = { ...validatedData };
    
    try {
      const websiteInfo = await fetchWebsiteInfo(validatedData.url);
      if (!websiteData.name && websiteInfo.title) {
        websiteData.name = websiteInfo.title;
      }
      if (!websiteData.description && websiteInfo.description) {
        websiteData.description = websiteInfo.description;
      }
      if (!websiteData.iconUrl && websiteInfo.iconUrl) {
        websiteData.iconUrl = websiteInfo.iconUrl;
      }
    } catch (error) {
      console.warn('获取网站信息失败，使用默认图标:', error);
      if (!websiteData.iconUrl) {
        websiteData.iconUrl = generateIconUrl(validatedData.url);
      }
    }

    const { tagNames, ...websiteCreateData } = websiteData;
    
    const website = await prisma.website.create({
      data: websiteCreateData,
      include: { 
        category: true,
        websiteTags: {
          include: {
            tag: true
          }
        }
      },
    });

    // 处理标签：自动创建不存在的标签并建立关联
    if (tagNames && tagNames.length > 0) {
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
            websiteId: website.id,
            tagId: tagId
          })),
          skipDuplicates: true
        });
      }
    }

    // 清除相关缓存
    await Promise.all([
      cache.del(CacheService.keys.categories()),
      cache.del(CacheService.keys.categoryWebsites(validatedData.categoryId)),
      cache.del(CacheService.keys.recommended()),
    ]);

    return NextResponse.json(website, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('创建网站失败:', error);
    return NextResponse.json(
      { error: '创建网站失败' },
      { status: 500 }
    );
  }
}