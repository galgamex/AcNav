import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, getUserProfile } from '@/lib/smms-api';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '没有找到文件' },
        { status: 400 }
      );
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '不支持的文件类型' },
        { status: 400 }
      );
    }

    // 验证文件大小（5MB）
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '文件大小不能超过5MB' },
        { status: 400 }
      );
    }

    // 上传到SM.MS
    const result = await uploadImage(file);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('图片上传失败:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '上传失败',
        success: false 
      },
      { status: 500 }
    );
  }
}

// 获取SM.MS账户信息
export async function GET() {
  try {
    const profile = await getUserProfile();
    
    return NextResponse.json({
      success: true,
      data: {
        username: profile.username,
        role: profile.role,
        diskUsage: profile.disk_usage,
        diskLimit: profile.disk_limit,
        diskUsageRaw: profile.disk_usage_raw,
        diskLimitRaw: profile.disk_limit_raw,
        usagePercentage: Math.round((profile.disk_usage_raw / profile.disk_limit_raw) * 100)
      }
    });

  } catch (error) {
    console.error('获取SM.MS账户信息失败:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '获取账户信息失败',
        success: false 
      },
      { status: 500 }
    );
  }
}
