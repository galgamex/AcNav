import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

interface WebsiteLayoutProps {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const website = await prisma.website.findUnique({
      where: { id: parseInt(id) },
      select: {
        name: true,
        description: true,
        url: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!website) {
      return {
        title: '网站不存在 - ACGN导航',
        description: '您访问的网站页面不存在，请返回首页浏览其他内容。',
      };
    }

    const description = website.description 
      ? `${website.description} - 来自${website.category.name}分类的优质网站推荐。`
      : `${website.name} - 来自${website.category.name}分类的优质网站推荐。`;

    return {
      title: `${website.name} - ACGN导航`,
      description: description.length > 160 ? description.substring(0, 157) + '...' : description,
      keywords: `${website.name},${website.category.name},网站推荐,ACGN导航`,
      openGraph: {
        title: `${website.name} - ACGN导航`,
        description: description,
        url: website.url,
        type: 'website',
      },
    };
  } catch (error) {
    return {
      title: '网站详情 - ACGN导航',
      description: '查看网站详细信息和相关推荐。',
    };
  }
}

export default function WebsiteLayout({ children }: WebsiteLayoutProps) {
  return children;
}