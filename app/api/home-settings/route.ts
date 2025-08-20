import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 获取主页设置（公开访问，不需要管理员权限）
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: ['home_title', 'home_description', 'home_keywords', 'home_welcome_message', 'home_show_recommended', 'home_sidebar_categories', 'home_custom_links']
        }
      }
    });

    // 转换为对象格式
    const homeSettings = {
      title: settings.find(s => s.key === 'home_title')?.value || 'AcNav 导航站',
      description: settings.find(s => s.key === 'home_description')?.value || '精选优质网站导航',
      keywords: settings.find(s => s.key === 'home_keywords')?.value || '导航,网站,工具',
      welcomeMessage: settings.find(s => s.key === 'home_welcome_message')?.value || '欢迎使用 AcNav 导航站',
      showRecommended: settings.find(s => s.key === 'home_show_recommended')?.value === 'true',
      sidebarCategories: JSON.parse(settings.find(s => s.key === 'home_sidebar_categories')?.value || '[]'),
      customLinks: JSON.parse(settings.find(s => s.key === 'home_custom_links')?.value || '[]')
    };

    return NextResponse.json({ homeSettings });
  } catch (error) {
    console.error('获取主页设置失败:', error);
    return NextResponse.json(
      { error: '获取主页设置失败' },
      { status: 500 }
    );
  }
}