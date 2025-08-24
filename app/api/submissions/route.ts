import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// 提交申请的数据验证模式
const submissionSchema = z.object({
  name: z.string().min(1, '网站名称不能为空').max(100, '网站名称不能超过100个字符'),
  url: z.string().url('请输入有效的URL'),
  description: z.string().min(1, '网站描述不能为空').max(500, '网站描述不能超过500个字符'),
  categoryId: z.string().transform(val => parseInt(val, 10)),
  tags: z.string().optional(),
  contactEmail: z.string().email('请输入有效的邮箱地址')
});

// 提交收录申请
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证请求数据
    const validatedData = submissionSchema.parse(body);
    
    // 检查分类是否存在
    const category = await prisma.category.findUnique({
      where: { id: validatedData.categoryId }
    });
    
    if (!category) {
      return NextResponse.json(
        { message: '指定的分类不存在' },
        { status: 400 }
      );
    }
    
    // 检查URL是否已经存在（避免重复申请）
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        url: validatedData.url,
        status: { in: ['pending', 'approved'] }
      }
    });
    
    if (existingSubmission) {
      return NextResponse.json(
        { message: '该网站已经提交过申请或已被收录' },
        { status: 400 }
      );
    }
    
    // 检查URL是否已经在网站库中
    const existingWebsite = await prisma.website.findFirst({
      where: { url: validatedData.url }
    });
    
    if (existingWebsite) {
      return NextResponse.json(
        { message: '该网站已经被收录' },
        { status: 400 }
      );
    }
    
    // 创建申请记录
    const submission = await prisma.submission.create({
      data: {
        name: validatedData.name,
        url: validatedData.url,
        description: validatedData.description,
        categoryId: validatedData.categoryId,
        tags: validatedData.tags || null,
        contactEmail: validatedData.contactEmail,
        status: 'pending'
      },
      include: {
        category: true
      }
    });
    
    return NextResponse.json(
      {
        message: '申请提交成功',
        submission: {
          id: submission.id,
          name: submission.name,
          url: submission.url,
          status: submission.status,
          category: submission.category.name,
          createdAt: submission.createdAt
        }
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('提交申请失败:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: '数据验证失败',
          errors: error.errors.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// 获取申请列表（管理员用）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;
    
    // 构建查询条件
    const where: any = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      where.status = status;
    }
    
    // 获取申请列表
    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        include: {
          category: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limit
      }),
      prisma.submission.count({ where })
    ]);
    
    return NextResponse.json({
      submissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('获取申请列表失败:', error);
    return NextResponse.json(
      { message: '服务器内部错误' },
      { status: 500 }
    );
  }
}