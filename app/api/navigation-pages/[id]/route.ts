import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CacheService } from '@/lib/redis';

// GET /api/navigation-pages/[id] - 获取单个导航页
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '无效的导航页ID' },
        { status: 400 }
      );
    }
    
    const navigationPage = await prisma.navigationPage.findUnique({
      where: { id },
    });
    
    if (!navigationPage) {
      return NextResponse.json(
        { error: '导航页不存在' },
        { status: 404 }
      );
    }
    
    // 解析JSON字段
    const result = {
      ...navigationPage,
      sidebarCategories: navigationPage.sidebarCategories 
        ? JSON.parse(navigationPage.sidebarCategories) 
        : [],
      headerCategories: navigationPage.headerCategories 
        ? JSON.parse(navigationPage.headerCategories) 
        : [],
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('获取导航页失败:', error);
    return NextResponse.json(
      { error: '获取导航页失败' },
      { status: 500 }
    );
  }
}

// PUT /api/navigation-pages/[id] - 更新导航页
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '无效的导航页ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const {
      name,
      slug,
      title,
      description,
      keywords,
      isActive,
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
    
    // 检查导航页是否存在
    const existingPage = await prisma.navigationPage.findUnique({
      where: { id },
    });
    
    if (!existingPage) {
      return NextResponse.json(
        { error: '导航页不存在' },
        { status: 404 }
      );
    }
    
    // 检查slug是否被其他导航页使用
    if (slug !== existingPage.slug) {
      const slugExists = await prisma.navigationPage.findUnique({
        where: { slug },
      });
      
      if (slugExists) {
        return NextResponse.json(
          { error: '路径标识符已存在' },
          { status: 400 }
        );
      }
    }
    
    // 更新导航页
    const navigationPage = await prisma.navigationPage.update({
      where: { id },
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
    await CacheService.del(`navigationPage:${slug}`);
    
    return NextResponse.json(navigationPage);
  } catch (error) {
    console.error('更新导航页失败:', error);
    return NextResponse.json(
      { error: '更新导航页失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/navigation-pages/[id] - 删除导航页
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '无效的导航页ID' },
        { status: 400 }
      );
    }
    
    // 检查导航页是否存在
    const existingPage = await prisma.navigationPage.findUnique({
      where: { id },
    });
    
    if (!existingPage) {
      return NextResponse.json(
        { error: '导航页不存在' },
        { status: 404 }
      );
    }
    
    // 删除导航页
    await prisma.navigationPage.delete({
      where: { id },
    });
    
    // 清除相关缓存
    await CacheService.del('navigationPages');
    await CacheService.del(`navigationPage:${existingPage.slug}`);
    
    return NextResponse.json({ message: '导航页删除成功' });
  } catch (error) {
    console.error('删除导航页失败:', error);
    return NextResponse.json(
      { error: '删除导航页失败' },
      { status: 500 }
    );
  }
}