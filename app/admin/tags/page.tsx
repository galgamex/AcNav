import { prisma } from '@/lib/prisma';
import { TagManagement } from '@/components/admin/TagManagement';
import { AuthGuard } from '@/components/admin/AuthGuard';

type TagWithCount = {
  id: number;
  name: string;
  color: string | null;
  description: string | null;
  createdAt: Date;
  _count: {
    websiteTags: number;
  };
};

export default async function TagsPage() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          websiteTags: true,
        },
      },
    },
  });

  return (
    <AuthGuard>
      <div className=" mx-auto ">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">标签管理</h1>
          <p className="text-gray-600 mt-2">管理网站标签，为网站添加分类标识</p>
        </div>
        <TagManagement initialTags={tags} />
      </div>
    </AuthGuard>
  );
}