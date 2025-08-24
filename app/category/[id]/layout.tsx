import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

interface CategoryLayoutProps {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      select: {
        name: true,
        _count: {
          select: {
            websites: true,
          },
        },
      },
    });

    if (!category) {
      return {
        title: '分类不存在 - ACGN导航',
        description: '您访问的分类页面不存在，请返回首页浏览其他内容。',
      };
    }

    return {
      title: `${category.name} - ACGN导航`,
      description: `浏览${category.name}分类下的优质网站，共收录${category._count.websites}个精选网站资源。`,
      keywords: `${category.name},网站导航,${category.name}工具,${category.name}资源,ACGN导航`,
    };
  } catch (error) {
    return {
      title: '分类页面 - ACGN导航',
      description: '浏览分类下的优质网站资源。',
    };
  }
}

export default function CategoryLayout({ children }: CategoryLayoutProps) {
  return children;
}