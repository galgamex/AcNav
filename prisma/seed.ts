import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('开始数据库种子数据初始化...');

  // 创建默认管理员
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: hashedPassword,
    },
  });

  console.log('默认管理员创建完成:', admin);

  // 创建示例分类
  const defaultCategories = [
    { name: '搜索引擎', order: 1 },
    { name: '社交媒体', order: 2 },
    { name: '开发工具', order: 3 },
    { name: '在线工具', order: 4 },
  ];

  for (const categoryData of defaultCategories) {
    await prisma.category.upsert({
      where: { name: categoryData.name },
      update: {},
      create: categoryData,
    });
  }

  console.log('默认分类创建完成');

  // 创建示例网站
  const searchCategory = await prisma.category.findFirst({
    where: { name: '搜索引擎' }
  });

  if (searchCategory) {
    const defaultWebsites = [
      {
        name: 'Google',
        url: 'https://www.google.com',
        description: '全球最大的搜索引擎',
        order: 1,
        isRecommended: true,
        categoryId: searchCategory.id,
      },
      {
        name: 'Baidu',
        url: 'https://www.baidu.com',
        description: '百度搜索',
        order: 2,
        isRecommended: false,
        categoryId: searchCategory.id,
      },
    ];

    for (const websiteData of defaultWebsites) {
      const existingWebsite = await prisma.website.findFirst({
        where: { 
          url: websiteData.url,
          categoryId: websiteData.categoryId
        },
      });

      if (!existingWebsite) {
        await prisma.website.create({
          data: websiteData,
        });
      }
    }

    console.log('示例网站创建完成');
  }

  console.log('数据库种子数据初始化完成！');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });