import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { CacheService } from '@/lib/redis';
import { sendApprovalEmail, sendRejectionEmail } from '@/lib/email';

// 更新申请状态的数据验证模式
const updateSubmissionSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
  adminNote: z.string().optional()
});

// 获取单个申请详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { message: '无效的申请ID' },
        { status: 400 }
      );
    }
    
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        category: true
      }
    });
    
    if (!submission) {
      return NextResponse.json(
        { message: '申请不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ submission });
    
  } catch (error) {
    console.error('获取申请详情失败:', error);
    return NextResponse.json(
      { message: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// 更新申请状态（管理员审核）
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { message: '无效的申请ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const validatedData = updateSubmissionSchema.parse(body);
    
    // 检查申请是否存在
    const existingSubmission = await prisma.submission.findUnique({
      where: { id },
      include: { category: true }
    });
    
    if (!existingSubmission) {
      return NextResponse.json(
        { message: '申请不存在' },
        { status: 404 }
      );
    }
    
    // 如果状态改为approved，需要创建网站记录
    if (validatedData.status === 'approved' && existingSubmission.status !== 'approved') {
      // 检查URL是否已经在网站库中
      const existingWebsite = await prisma.website.findFirst({
        where: { url: existingSubmission.url }
      });
      
      if (!existingWebsite) {
        // 获取该分类下最大的order值
        const maxOrderWebsite = await prisma.website.findFirst({
          where: { categoryId: existingSubmission.categoryId },
          orderBy: { order: 'desc' }
        });
        
        const nextOrder = maxOrderWebsite ? maxOrderWebsite.order + 1 : 1;
        
        // 创建网站记录
        await prisma.website.create({
          data: {
            name: existingSubmission.name,
            url: existingSubmission.url,
            description: existingSubmission.description,
            categoryId: existingSubmission.categoryId,
            order: nextOrder
          }
        });
        
        // 清除相关缓存
        await CacheService.del(CacheService.keys.categoryWebsites(existingSubmission.categoryId));
        await CacheService.del(CacheService.keys.websites());
        
        // 如果有标签，创建标签关联
        if (existingSubmission.tags) {
          const tagNames = existingSubmission.tags
            .split(',')
            .map((tag: string) => tag.trim())
            .filter((tag: string) => tag.length > 0);
          
          if (tagNames.length > 0) {
            // 获取刚创建的网站
            const newWebsite = await prisma.website.findFirst({
              where: { url: existingSubmission.url },
              orderBy: { createdAt: 'desc' }
            });
            
            if (newWebsite) {
              // 为每个标签创建或获取标签记录
              for (const tagName of tagNames) {
                let tag = await prisma.tag.findUnique({
                  where: { name: tagName }
                });
                
                if (!tag) {
                  // 创建新标签
                  tag = await prisma.tag.create({
                    data: {
                      name: tagName,
                      color: '#3B82F6' // 默认蓝色
                    }
                  });
                }
                
                // 创建网站-标签关联
                await prisma.websiteTag.create({
                  data: {
                    websiteId: newWebsite.id,
                    tagId: tag.id
                  }
                }).catch(() => {
                  // 忽略重复关联错误
                });
              }
            }
          }
        }
      }
    }
    
    // 更新申请状态
    const updatedSubmission = await prisma.submission.update({
      where: { id },
      data: {
        status: validatedData.status,
        adminNote: validatedData.adminNote || null
      },
      include: {
        category: true
      }
    });

    // 发送邮件通知
    try {
      if (validatedData.status === 'approved') {
        await sendApprovalEmail(updatedSubmission);
      } else if (validatedData.status === 'rejected') {
        await sendRejectionEmail(updatedSubmission, validatedData.adminNote);
      }
    } catch (emailError) {
      console.error('发送邮件通知失败:', emailError);
      // 邮件发送失败不影响审核结果，只记录错误
    }
    
    return NextResponse.json({
      message: '申请状态更新成功',
      submission: updatedSubmission
    });
    
  } catch (error) {
    console.error('更新申请状态失败:', error);
    
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

// 删除申请
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { message: '无效的申请ID' },
        { status: 400 }
      );
    }
    
    // 检查申请是否存在
    const existingSubmission = await prisma.submission.findUnique({
      where: { id }
    });
    
    if (!existingSubmission) {
      return NextResponse.json(
        { message: '申请不存在' },
        { status: 404 }
      );
    }
    
    // 删除申请
    await prisma.submission.delete({
      where: { id }
    });
    
    return NextResponse.json({
      message: '申请删除成功'
    });
    
  } catch (error) {
    console.error('删除申请失败:', error);
    return NextResponse.json(
      { message: '服务器内部错误' },
      { status: 500 }
    );
  }
}