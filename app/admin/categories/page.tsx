import { prisma } from '@/lib/prisma';
import { CategoryManagement } from '@/components/admin/CategoryManagement';
import { AuthGuard } from '@/components/admin/AuthGuard';

interface Category {
  id: number;
  name: string;
  parentId: number | null;
  order: number;
  iconUrl: string | null;
  icon: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    websites: number;
  };
}

async function getCategories() {
  // 获取所有分类
  const allCategories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: { websites: true },
      },
    },
  });

  // 构建层级结构
  const categoryMap = new Map();
  const topLevelCategories: any[] = [];

  // 先创建所有分类的映射
  allCategories.forEach((category: Category) => {
    categoryMap.set(category.id, { ...category, children: [] });
  });

  // 构建层级关系
  allCategories.forEach((category: Category) => {
    if (category.parentId) {
      const parent = categoryMap.get(category.parentId);
      if (parent) {
        parent.children.push(categoryMap.get(category.id));
      }
    } else {
      topLevelCategories.push(categoryMap.get(category.id));
    }
  });

  return topLevelCategories;
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <AuthGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            分类管理
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            管理网站分类和排序
          </p>
        </div>

        <CategoryManagement initialCategories={categories} />
      </div>
    </AuthGuard>
  );
}