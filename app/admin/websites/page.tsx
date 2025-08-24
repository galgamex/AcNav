import { prisma } from '@/lib/prisma';
import { WebsiteManagement } from '@/components/admin/WebsiteManagement';
import { AuthGuard } from '@/components/admin/AuthGuard';

// 强制动态渲染，因为使用了 cookies
export const dynamic = 'force-dynamic';

async function getWebsitesAndCategories() {
  const [websites, categories] = await Promise.all([
    prisma.website.findMany({
      orderBy: [{ categoryId: 'asc' }, { order: 'asc' }],
      include: { category: true },
    }),
    prisma.category.findMany({
      orderBy: { order: 'asc' },
    }),
  ]);

  return { websites, categories };
}

export default async function WebsitesPage() {
  const { websites, categories } = await getWebsitesAndCategories();

  return (
    <AuthGuard>
      <div className="space-y-6">
       

        <WebsiteManagement 
          initialWebsites={websites} 
          categories={categories}
        />
      </div>
    </AuthGuard>
  );
}