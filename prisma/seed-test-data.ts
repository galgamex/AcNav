import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('开始生成测试数据（包含二级分类）...');

  // 创建管理员
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: hashedPassword,
    },
  });

  console.log('管理员创建完成:', admin);

  // 创建一级分类数据
  const primaryCategories = [
    { name: '搜索引擎', order: 1, iconUrl: '/icons/search.svg' },
    { name: '社交媒体', order: 2, iconUrl: '/icons/social.svg' },
    { name: '开发工具', order: 3, iconUrl: '/icons/dev.svg' },
    { name: '在线工具', order: 4, iconUrl: '/icons/tools.svg' },
    { name: '设计资源', order: 5, iconUrl: '/icons/design.svg' },
    { name: '学习教育', order: 6, iconUrl: '/icons/education.svg' },
    { name: '娱乐影音', order: 7, iconUrl: '/icons/entertainment.svg' },
    { name: '购物电商', order: 8, iconUrl: '/icons/shopping.svg' },
    { name: '新闻资讯', order: 9, iconUrl: '/icons/news.svg' },
    { name: '云服务', order: 10, iconUrl: '/icons/cloud.svg' },
  ];

  const createdPrimaryCategories = [];
  for (const categoryData of primaryCategories) {
    const category = await prisma.category.upsert({
      where: { name: categoryData.name },
      update: {},
      create: categoryData,
    });
    createdPrimaryCategories.push(category);
  }

  console.log('一级分类创建完成');

  // 创建二级分类数据
  const secondaryCategories = [
    // 搜索引擎的二级分类
    { name: '综合搜索', parentName: '搜索引擎', order: 1 },
    { name: '学术搜索', parentName: '搜索引擎', order: 2 },
    { name: '图片搜索', parentName: '搜索引擎', order: 3 },
    
    // 社交媒体的二级分类
    { name: '微博平台', parentName: '社交媒体', order: 1 },
    { name: '即时通讯', parentName: '社交媒体', order: 2 },
    { name: '视频社交', parentName: '社交媒体', order: 3 },
    { name: '职业社交', parentName: '社交媒体', order: 4 },
    
    // 开发工具的二级分类
    { name: '代码托管', parentName: '开发工具', order: 1 },
    { name: '在线编辑器', parentName: '开发工具', order: 2 },
    { name: '开发文档', parentName: '开发工具', order: 3 },
    { name: '调试工具', parentName: '开发工具', order: 4 },
    
    // 在线工具的二级分类
    { name: '格式转换', parentName: '在线工具', order: 1 },
    { name: '图片处理', parentName: '在线工具', order: 2 },
    { name: '文本处理', parentName: '在线工具', order: 3 },
    { name: '网络工具', parentName: '在线工具', order: 4 },
    
    // 设计资源的二级分类
    { name: 'UI设计', parentName: '设计资源', order: 1 },
    { name: '图标素材', parentName: '设计资源', order: 2 },
    { name: '图片素材', parentName: '设计资源', order: 3 },
    { name: '字体资源', parentName: '设计资源', order: 4 },
    
    // 学习教育的二级分类
    { name: '在线课程', parentName: '学习教育', order: 1 },
    { name: '编程学习', parentName: '学习教育', order: 2 },
    { name: '语言学习', parentName: '学习教育', order: 3 },
    { name: '技能培训', parentName: '学习教育', order: 4 },
    
    // 娱乐影音的二级分类
    { name: '视频平台', parentName: '娱乐影音', order: 1 },
    { name: '音乐平台', parentName: '娱乐影音', order: 2 },
    { name: '游戏平台', parentName: '娱乐影音', order: 3 },
    { name: '直播平台', parentName: '娱乐影音', order: 4 },
    
    // 购物电商的二级分类
    { name: '综合电商', parentName: '购物电商', order: 1 },
    { name: '跨境电商', parentName: '购物电商', order: 2 },
    { name: '二手交易', parentName: '购物电商', order: 3 },
    { name: '团购优惠', parentName: '购物电商', order: 4 },
    
    // 新闻资讯的二级分类
    { name: '综合新闻', parentName: '新闻资讯', order: 1 },
    { name: '科技资讯', parentName: '新闻资讯', order: 2 },
    { name: '财经新闻', parentName: '新闻资讯', order: 3 },
    { name: '体育新闻', parentName: '新闻资讯', order: 4 },
    
    // 云服务的二级分类
    { name: '云计算', parentName: '云服务', order: 1 },
    { name: '云存储', parentName: '云服务', order: 2 },
    { name: 'CDN服务', parentName: '云服务', order: 3 },
    { name: '数据库服务', parentName: '云服务', order: 4 },
  ];

  const createdSecondaryCategories = [];
  for (const categoryData of secondaryCategories) {
    const parentCategory = createdPrimaryCategories.find(c => c.name === categoryData.parentName);
    if (parentCategory) {
      const category = await prisma.category.upsert({
        where: { name: categoryData.name },
        update: {},
        create: {
          name: categoryData.name,
          order: categoryData.order,
          parentId: parentCategory.id,
        },
      });
      createdSecondaryCategories.push(category);
    }
  }

  console.log('二级分类创建完成');

  // 获取所有分类（包含一级和二级）
  const allCategories = [...createdPrimaryCategories, ...createdSecondaryCategories];

  // 创建标签数据
  const tags = [
    { name: '免费', color: '#10B981', description: '免费使用的工具或服务' },
    { name: '付费', color: '#F59E0B', description: '需要付费的工具或服务' },
    { name: '开源', color: '#3B82F6', description: '开源项目' },
    { name: '热门', color: '#EF4444', description: '热门推荐' },
    { name: 'AI工具', color: '#8B5CF6', description: 'AI相关工具' },
    { name: '移动端', color: '#06B6D4', description: '支持移动端' },
    { name: '桌面端', color: '#84CC16', description: '桌面应用' },
    { name: '在线', color: '#F97316', description: '在线工具' },
    { name: '中文', color: '#EC4899', description: '支持中文' },
    { name: '国外', color: '#6366F1', description: '国外服务' },
  ];

  const createdTags = [];
  for (const tagData of tags) {
    const tag = await prisma.tag.upsert({
      where: { name: tagData.name },
      update: {},
      create: tagData,
    });
    createdTags.push(tag);
  }

  console.log('标签创建完成');

  // 创建网站数据（分配到二级分类）
  const websites = [
    // 综合搜索
    {
      name: 'Google',
      url: 'https://www.google.com',
      description: '全球最大的搜索引擎，提供网页、图片、视频等搜索服务',
      order: 1,
      isRecommended: true,
      categoryName: '综合搜索',
      tags: ['免费', '热门', '国外']
    },
    {
      name: '百度',
      url: 'https://www.baidu.com',
      description: '中国最大的搜索引擎，提供网页、图片、视频等搜索服务',
      order: 2,
      isRecommended: true,
      categoryName: '综合搜索',
      tags: ['免费', '热门', '中文']
    },
    {
      name: 'Bing',
      url: 'https://www.bing.com',
      description: '微软推出的搜索引擎，集成AI功能',
      order: 3,
      isRecommended: false,
      categoryName: '综合搜索',
      tags: ['免费', 'AI工具', '国外']
    },
    
    // 学术搜索
    {
      name: 'Google Scholar',
      url: 'https://scholar.google.com',
      description: '谷歌学术搜索，专门搜索学术文献',
      order: 1,
      isRecommended: true,
      categoryName: '学术搜索',
      tags: ['免费', '国外']
    },
    {
      name: '知网',
      url: 'https://www.cnki.net',
      description: '中国知网，中文学术文献数据库',
      order: 2,
      isRecommended: true,
      categoryName: '学术搜索',
      tags: ['付费', '中文']
    },
    
    // 图片搜索
    {
      name: 'Google Images',
      url: 'https://images.google.com',
      description: '谷歌图片搜索',
      order: 1,
      isRecommended: true,
      categoryName: '图片搜索',
      tags: ['免费', '国外']
    },
    {
      name: 'TinEye',
      url: 'https://tineye.com',
      description: '反向图片搜索引擎',
      order: 2,
      isRecommended: false,
      categoryName: '图片搜索',
      tags: ['免费', '国外']
    },
    
    // 微博平台
    {
      name: '新浪微博',
      url: 'https://weibo.com',
      description: '中国最大的社交媒体平台',
      order: 1,
      isRecommended: true,
      categoryName: '微博平台',
      tags: ['免费', '热门', '移动端', '中文']
    },
    {
      name: 'Twitter',
      url: 'https://twitter.com',
      description: '全球知名的微博社交平台',
      order: 2,
      isRecommended: true,
      categoryName: '微博平台',
      tags: ['免费', '热门', '移动端', '国外']
    },
    
    // 即时通讯
    {
      name: '微信',
      url: 'https://weixin.qq.com',
      description: '腾讯推出的即时通讯软件',
      order: 1,
      isRecommended: true,
      categoryName: '即时通讯',
      tags: ['免费', '热门', '移动端', '中文']
    },
    {
      name: 'WhatsApp',
      url: 'https://www.whatsapp.com',
      description: '全球知名的即时通讯应用',
      order: 2,
      isRecommended: true,
      categoryName: '即时通讯',
      tags: ['免费', '热门', '移动端', '国外']
    },
    
    // 视频社交
    {
      name: 'TikTok',
      url: 'https://www.tiktok.com',
      description: '短视频社交平台',
      order: 1,
      isRecommended: true,
      categoryName: '视频社交',
      tags: ['免费', '热门', '移动端', '国外']
    },
    {
      name: '抖音',
      url: 'https://www.douyin.com',
      description: '中国知名短视频平台',
      order: 2,
      isRecommended: true,
      categoryName: '视频社交',
      tags: ['免费', '热门', '移动端', '中文']
    },
    
    // 职业社交
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com',
      description: '全球最大的职业社交网络',
      order: 1,
      isRecommended: true,
      categoryName: '职业社交',
      tags: ['免费', '国外']
    },
    {
      name: '脉脉',
      url: 'https://maimai.cn',
      description: '中国职场社交平台',
      order: 2,
      isRecommended: false,
      categoryName: '职业社交',
      tags: ['免费', '中文']
    },
    
    // 代码托管
    {
      name: 'GitHub',
      url: 'https://github.com',
      description: '全球最大的代码托管平台',
      order: 1,
      isRecommended: true,
      categoryName: '代码托管',
      tags: ['免费', '开源', '热门', '国外']
    },
    {
      name: 'GitLab',
      url: 'https://gitlab.com',
      description: 'DevOps平台，提供代码托管和CI/CD',
      order: 2,
      isRecommended: false,
      categoryName: '代码托管',
      tags: ['免费', '开源', '国外']
    },
    {
      name: 'Gitee',
      url: 'https://gitee.com',
      description: '中国本土的代码托管平台',
      order: 3,
      isRecommended: false,
      categoryName: '代码托管',
      tags: ['免费', '中文']
    },
    
    // 在线编辑器
    {
      name: 'CodePen',
      url: 'https://codepen.io',
      description: '在线前端代码编辑器和分享平台',
      order: 1,
      isRecommended: true,
      categoryName: '在线编辑器',
      tags: ['免费', '在线', '国外']
    },
    {
      name: 'JSFiddle',
      url: 'https://jsfiddle.net',
      description: '在线JavaScript代码测试工具',
      order: 2,
      isRecommended: false,
      categoryName: '在线编辑器',
      tags: ['免费', '在线', '国外']
    },
    
    // 开发文档
    {
      name: 'MDN',
      url: 'https://developer.mozilla.org',
      description: 'Mozilla开发者网络，Web技术文档',
      order: 1,
      isRecommended: true,
      categoryName: '开发文档',
      tags: ['免费', '热门', '国外']
    },
    {
      name: 'Stack Overflow',
      url: 'https://stackoverflow.com',
      description: '程序员问答社区',
      order: 2,
      isRecommended: true,
      categoryName: '开发文档',
      tags: ['免费', '热门', '国外']
    },
    
    // 调试工具
    {
      name: 'Chrome DevTools',
      url: 'https://developer.chrome.com/docs/devtools',
      description: 'Chrome浏览器开发者工具文档',
      order: 1,
      isRecommended: true,
      categoryName: '调试工具',
      tags: ['免费', '桌面端', '国外']
    },
    {
      name: 'Postman',
      url: 'https://www.postman.com',
      description: 'API开发和测试工具',
      order: 2,
      isRecommended: true,
      categoryName: '调试工具',
      tags: ['免费', '桌面端', '国外']
    },
    
    // 格式转换
    {
      name: 'JSON格式化',
      url: 'https://jsonformatter.org',
      description: '在线JSON格式化和验证工具',
      order: 1,
      isRecommended: true,
      categoryName: '格式转换',
      tags: ['免费', '在线', '国外']
    },
    {
      name: 'Base64编码',
      url: 'https://www.base64encode.org',
      description: '在线Base64编码解码工具',
      order: 2,
      isRecommended: false,
      categoryName: '格式转换',
      tags: ['免费', '在线', '国外']
    },
    
    // 图片处理
    {
      name: 'TinyPNG',
      url: 'https://tinypng.com',
      description: '在线图片压缩工具',
      order: 1,
      isRecommended: true,
      categoryName: '图片处理',
      tags: ['免费', '在线', '国外']
    },
    {
      name: 'Remove.bg',
      url: 'https://www.remove.bg',
      description: '在线图片背景移除工具',
      order: 2,
      isRecommended: true,
      categoryName: '图片处理',
      tags: ['免费', 'AI工具', '在线', '国外']
    },
    
    // 文本处理
    {
      name: '正则表达式测试',
      url: 'https://regex101.com',
      description: '在线正则表达式测试和学习工具',
      order: 1,
      isRecommended: true,
      categoryName: '文本处理',
      tags: ['免费', '在线', '国外']
    },
    {
      name: 'Markdown编辑器',
      url: 'https://dillinger.io',
      description: '在线Markdown编辑器',
      order: 2,
      isRecommended: false,
      categoryName: '文本处理',
      tags: ['免费', '在线', '国外']
    },
    
    // 网络工具
    {
      name: 'Ping测试',
      url: 'https://www.ping.eu',
      description: '在线网络连通性测试工具',
      order: 1,
      isRecommended: false,
      categoryName: '网络工具',
      tags: ['免费', '在线', '国外']
    },
    {
      name: 'IP查询',
      url: 'https://www.whatismyipaddress.com',
      description: '查询IP地址和位置信息',
      order: 2,
      isRecommended: false,
      categoryName: '网络工具',
      tags: ['免费', '在线', '国外']
    },
    
    // UI设计
    {
      name: 'Figma',
      url: 'https://www.figma.com',
      description: '在线UI/UX设计工具',
      order: 1,
      isRecommended: true,
      categoryName: 'UI设计',
      tags: ['免费', '在线', '热门', '国外']
    },
    {
      name: 'Sketch',
      url: 'https://www.sketch.com',
      description: 'Mac平台的UI设计工具',
      order: 2,
      isRecommended: true,
      categoryName: 'UI设计',
      tags: ['付费', '桌面端', '国外']
    },
    
    // 图标素材
    {
      name: 'Feather Icons',
      url: 'https://feathericons.com',
      description: '简洁美观的开源图标库',
      order: 1,
      isRecommended: true,
      categoryName: '图标素材',
      tags: ['免费', '开源', '国外']
    },
    {
      name: 'Font Awesome',
      url: 'https://fontawesome.com',
      description: '最受欢迎的图标字体库',
      order: 2,
      isRecommended: true,
      categoryName: '图标素材',
      tags: ['免费', '热门', '国外']
    },
    
    // 图片素材
    {
      name: 'Unsplash',
      url: 'https://unsplash.com',
      description: '免费高质量图片素材网站',
      order: 1,
      isRecommended: true,
      categoryName: '图片素材',
      tags: ['免费', '热门', '国外']
    },
    {
      name: 'Pexels',
      url: 'https://www.pexels.com',
      description: '免费图片和视频素材网站',
      order: 2,
      isRecommended: true,
      categoryName: '图片素材',
      tags: ['免费', '热门', '国外']
    },
    
    // 字体资源
    {
      name: 'Google Fonts',
      url: 'https://fonts.google.com',
      description: '谷歌免费字体库',
      order: 1,
      isRecommended: true,
      categoryName: '字体资源',
      tags: ['免费', '热门', '国外']
    },
    {
      name: 'Font Squirrel',
      url: 'https://www.fontsquirrel.com',
      description: '免费商用字体下载网站',
      order: 2,
      isRecommended: false,
      categoryName: '字体资源',
      tags: ['免费', '国外']
    },
  ];

  // 创建网站和关联标签
  for (const websiteData of websites) {
    const category = allCategories.find(c => c.name === websiteData.categoryName);
    if (!category) continue;

    const existingWebsite = await prisma.website.findFirst({
      where: { 
        url: websiteData.url,
        categoryId: category.id
      },
    });

    if (!existingWebsite) {
      const website = await prisma.website.create({
        data: {
          name: websiteData.name,
          url: websiteData.url,
          description: websiteData.description,
          order: websiteData.order,
          isRecommended: websiteData.isRecommended,
          categoryId: category.id,
        },
      });

      // 关联标签
      for (const tagName of websiteData.tags) {
        const tag = createdTags.find(t => t.name === tagName);
        if (tag) {
          await prisma.websiteTag.create({
            data: {
              websiteId: website.id,
              tagId: tag.id,
            },
          });
        }
      }
    }
  }

  console.log('网站数据创建完成');

  // 创建访问统计数据（最近30天的模拟数据）
  const allWebsites = await prisma.website.findMany();
  const today = new Date();
  
  for (const website of allWebsites) {
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // 生成随机访问数据
      const mobileVisits = Math.floor(Math.random() * 1000) + 50;
      const desktopVisits = Math.floor(Math.random() * 800) + 30;
      
      await prisma.websiteVisit.upsert({
        where: {
          websiteId_date: {
            websiteId: website.id,
            date: date,
          },
        },
        update: {},
        create: {
          websiteId: website.id,
          date: date,
          mobileVisits: mobileVisits,
          desktopVisits: desktopVisits,
        },
      });
    }
  }

  console.log('访问统计数据创建完成');
  console.log('测试数据生成完成（包含二级分类）！');
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