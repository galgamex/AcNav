import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentAdmin } from '@/lib/auth-simple';

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 获取主页设置
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
      customLinks: JSON.parse(settings.find(s => s.key === 'home_custom_links')?.value || '[]'),

    };

    return NextResponse.json({ homeSettings });
  } catch (error) {
    console.error('获取主页设置失败:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { homeSettings } = await request.json();

    // 保存各个设置项
    const settingsToSave = [
      { key: 'home_title', value: homeSettings.title },
      { key: 'home_description', value: homeSettings.description },
      { key: 'home_keywords', value: homeSettings.keywords },
      { key: 'home_welcome_message', value: homeSettings.welcomeMessage },
      { key: 'home_show_recommended', value: homeSettings.showRecommended.toString() },
      { key: 'home_sidebar_categories', value: JSON.stringify(homeSettings.sidebarCategories) },
      { key: 'home_custom_links', value: JSON.stringify(homeSettings.customLinks) },

    ];

    // 使用 upsert 来更新或创建设置
    for (const setting of settingsToSave) {
      await prisma.setting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: setting
      });
    }

    return NextResponse.json({ success: true, message: '主页设置保存成功' });
  } catch (error) {
    console.error('保存主页设置失败:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}