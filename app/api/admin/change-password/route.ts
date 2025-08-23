import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth-simple';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { cookies } from 'next/headers';

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, '请输入原密码'),
  newPassword: z.string().min(6, '新密码至少6位'),
});

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = changePasswordSchema.parse(body);

    // 从数据库获取完整的admin信息包括passwordHash
    const fullAdmin = await prisma.admin.findUnique({
      where: { id: admin.id }
    });

    if (!fullAdmin) {
      return NextResponse.json({ error: '管理员不存在' }, { status: 404 });
    }

    // 验证原密码
    const isOldPasswordValid = await bcrypt.compare(
      validatedData.oldPassword, 
      fullAdmin.passwordHash
    );
    
    if (!isOldPasswordValid) {
      return NextResponse.json(
        { error: '原密码错误' },
        { status: 400 }
      );
    }

    // 更新密码
    const hashedNewPassword = await bcrypt.hash(validatedData.newPassword, 10);
    await prisma.admin.update({
      where: { id: admin.id },
      data: { passwordHash: hashedNewPassword },
    });

    // 清除用户会话，强制重新登录
    const cookieStore = await cookies();
    cookieStore.delete('admin-session');

    return NextResponse.json({ 
      message: '密码修改成功，请重新登录',
      requireRelogin: true 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('修改密码失败:', error);
    return NextResponse.json(
      { error: '修改密码失败' },
      { status: 500 }
    );
  }
}