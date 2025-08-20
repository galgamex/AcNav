import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/redis';

// 检测设备类型的函数
function detectDeviceType(userAgent: string): 'mobile' | 'desktop' {
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return mobileRegex.test(userAgent) ? 'mobile' : 'desktop';
}

// 获取今天的日期（只包含年月日）
function getTodayDate(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export async function POST(
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

    // 检查网站是否存在
    const website = await prisma.website.findUnique({
      where: { id: websiteId }
    });

    if (!website) {
      return NextResponse.json(
        { error: '网站不存在' },
        { status: 404 }
      );
    }

    // 获取用户代理字符串
    const userAgent = request.headers.get('user-agent') || '';
    const deviceType = detectDeviceType(userAgent);
    const today = getTodayDate();

    // 使用事务来确保数据一致性
    const result = await prisma.$transaction(async (tx) => {
      // 查找今天的访问记录
      let visitRecord = await tx.websiteVisit.findUnique({
        where: {
          websiteId_date: {
            websiteId: websiteId,
            date: today
          }
        }
      });

      if (visitRecord) {
        // 更新现有记录
        const updateData = deviceType === 'mobile' 
          ? { mobileVisits: { increment: 1 } }
          : { desktopVisits: { increment: 1 } };

        visitRecord = await tx.websiteVisit.update({
          where: { id: visitRecord.id },
          data: updateData
        });
      } else {
        // 创建新记录
        const createData = {
          websiteId: websiteId,
          date: today,
          mobileVisits: deviceType === 'mobile' ? 1 : 0,
          desktopVisits: deviceType === 'desktop' ? 1 : 0
        };

        visitRecord = await tx.websiteVisit.create({
          data: createData
        });
      }

      return visitRecord;
    });

    // 清除相关缓存
    const cacheKey = `website_visits_${websiteId}`;
    await cache.del(cacheKey);

    return NextResponse.json({
      success: true,
      data: {
        websiteId: result.websiteId,
        date: result.date,
        mobileVisits: result.mobileVisits,
        desktopVisits: result.desktopVisits,
        totalVisits: result.mobileVisits + result.desktopVisits,
        deviceType: deviceType
      }
    });

  } catch (error) {
    console.error('记录网站访问失败:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}