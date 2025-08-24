import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/redis';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const websiteId = parseInt(id);
    
    if (isNaN(websiteId)) {
      return NextResponse.json(
        { error: '无效的网站ID' },
        { status: 400 }
      );
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30'); // 默认获取30天的数据
    
    if (days < 1 || days > 365) {
      return NextResponse.json(
        { error: '天数范围必须在1-365之间' },
        { status: 400 }
      );
    }

    // 检查缓存
    const cacheKey = `website_visits_${websiteId}_${days}`;
    const cachedData = await cache.get(cacheKey);
    
    if (cachedData) {
      return NextResponse.json({
        success: true,
        data: typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData,
        cached: true
      });
    }

    // 检查网站是否存在
    const website = await prisma.website.findUnique({
      where: { id: websiteId },
      select: { id: true, name: true, url: true }
    });

    if (!website) {
      return NextResponse.json(
        { error: '网站不存在' },
        { status: 404 }
      );
    }

    // 计算日期范围
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);

    // 获取访问统计数据 - 优化查询
    const visits = await prisma.websiteVisit.findMany({
      where: {
        websiteId: websiteId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        date: true,
        mobileVisits: true,
        desktopVisits: true
      },
      orderBy: {
        date: 'asc'
      }
    });

    // 生成完整的日期序列，包括没有访问记录的日期
    const dateRange: Date[] = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dateRange.push(new Date(d));
    }

    // 将访问数据映射到日期序列
    const visitMap = new Map();
    visits.forEach((visit: { date: Date; mobileVisits: number; desktopVisits: number }) => {
      const dateKey = visit.date.toISOString().split('T')[0];
      visitMap.set(dateKey, visit);
    });

    const statsData = dateRange.map((date: Date) => {
      const dateKey = date.toISOString().split('T')[0];
      const visit = visitMap.get(dateKey);
      
      return {
        date: dateKey,
        mobileVisits: visit?.mobileVisits || 0,
        desktopVisits: visit?.desktopVisits || 0,
        totalVisits: (visit?.mobileVisits || 0) + (visit?.desktopVisits || 0)
      };
    });

    // 计算总计数据
    const totalStats = {
      totalMobileVisits: statsData.reduce((sum, day) => sum + day.mobileVisits, 0),
      totalDesktopVisits: statsData.reduce((sum, day) => sum + day.desktopVisits, 0),
      totalVisits: statsData.reduce((sum, day) => sum + day.totalVisits, 0),
      averageVisitsPerDay: statsData.length > 0 
        ? Math.round(statsData.reduce((sum, day) => sum + day.totalVisits, 0) / statsData.length * 100) / 100
        : 0
    };

    const responseData = {
      website: website,
      period: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        days: days
      },
      dailyStats: statsData,
      totalStats: totalStats
    };

    // 缓存结果（缓存5分钟）
    await cache.set(cacheKey, JSON.stringify(responseData), 300);

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('获取网站访问统计失败:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}