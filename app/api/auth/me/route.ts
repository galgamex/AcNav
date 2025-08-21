import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth-simple';

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      id: admin.id,
      username: admin.username
    });
  } catch (error) {
    console.error('获取管理员信息失败:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}