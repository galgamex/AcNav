import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CacheService } from '@/lib/redis';

// GET /api/navigation-pages - 获取所有导航页
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const isActive = searchParams.get('isActive');
    
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }
    
    const [navigationPages, total] = await Promise.all([
      prisma.navigationPage.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.navigationPage.count({ where }),
    ]);
    
    return NextResponse.json({
      navigationPages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('获取导航页失败:', error);
    return NextResponse.json(
      { error: '获取导航页失败' },
      { status: 500 }
    );
  }
}

// POST /api/navigation-pages - 创建新导航页
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      slug,
      title,
      description,
      keywords,
      isActive = true,
      sidebarCategories,
      headerCategories,
    } = body;
    
    // 验证必填字段
    if (!name || !slug || !title) {
      return NextResponse.json(
        { error: '名称、路径标识符和SEO标题为必填项' },
        { status: 400 }
      );
    }
    
    // 检查slug是否已存在
    const existingPage = await prisma.navigationPage.findUnique({
      where: { slug },
    });
    
    if (existingPage) {
      return NextResponse.json(
        { error: '路径标识符已存在' },
        { status: 400 }
      );
    }
    
    // 创建导航页
    const navigationPage = await prisma.navigationPage.create({
      data: {
        name,
        slug,
        title,
        description,
        keywords,
        isActive,
        sidebarCategories: sidebarCategories ? JSON.stringify(sidebarCategories) : null,
        headerCategories: headerCategories ? JSON.stringify(headerCategories) : null,
      },
    });
    
    // 清除相关缓存
    await CacheService.del('navigationPages');
    
    return NextResponse.json(navigationPage, { status: 201 });
  } catch (error) {
    console.error('创建导航页失败:', error);
    return NextResponse.json(
      { error: '创建导航页失败' },
      { status: 500 }
    );
  }
}