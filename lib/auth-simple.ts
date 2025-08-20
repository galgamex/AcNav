import { cookies } from 'next/headers';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export interface Admin {
  id: number;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getCurrentAdmin(): Promise<Admin | null> {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin-session')?.value;
    
    if (!adminToken) {
      return null;
    }

    // 简单的token验证 - 在生产环境中应该使用JWT或其他安全方案
    const admin = await prisma.admin.findFirst({
      where: {
        id: parseInt(adminToken, 10)
      },
      select: {
        id: true,
        username: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return admin;
  } catch (error) {
    console.error('获取当前管理员失败:', error);
    return null;
  }
}

export async function verifyAdmin(username: string, password: string): Promise<Admin | null> {
  try {
    const admin = await prisma.admin.findUnique({
      where: { username }
    });

    if (!admin) {
      return null;
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
      return null;
    }

    return {
      id: admin.id,
      username: admin.username,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt
    };
  } catch (error) {
    console.error('验证管理员失败:', error);
    return null;
  }
}

export async function changeAdminPassword(adminId: number, oldPassword: string, newPassword: string): Promise<boolean> {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId }
    });

    if (!admin) {
      return false;
    }

    const isValidOldPassword = await bcrypt.compare(oldPassword, admin.passwordHash);
    if (!isValidOldPassword) {
      return false;
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    await prisma.admin.update({
      where: { id: adminId },
      data: { passwordHash: hashedNewPassword }
    });

    return true;
  } catch (error) {
    console.error('修改管理员密码失败:', error);
    return false;
  }
}

export function requireAdmin() {
  return async (req: Request): Promise<Admin | Response> => {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return new Response('未授权', { status: 401 });
    }
    return admin;
  };
}