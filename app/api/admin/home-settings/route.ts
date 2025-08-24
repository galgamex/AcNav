import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 返回默认的首页设置
    const homeSettings = {
      title: 'ACGN导航',
      description: '精选优质网站导航',
      showRecommended: true,
      showCategories: true
    };
    
    return NextResponse.json(homeSettings);
  } catch (error) {
    console.error('获取首页设置失败:', error);
    return NextResponse.json(
      { error: '获取首页设置失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 这里应该保存到数据库，现在只是返回成功
    console.log('更新首页设置:', body);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('更新首页设置失败:', error);
    return NextResponse.json(
      { error: '更新首页设置失败' },
      { status: 500 }
    );
  }
}