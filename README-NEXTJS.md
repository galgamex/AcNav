# ThinNav - Next.js 版本

基于 Next.js 15 + React 19 + TypeScript 重构的极简网址导航系统。

## 🚀 技术栈

- **前端框架**: Next.js 15 + React 19 + TypeScript
- **数据库**: PostgreSQL + Prisma ORM
- **缓存**: Redis
- **UI组件**: Tailwind CSS + shadcn/ui
- **认证**: NextAuth.js
- **部署**: Docker + Docker Compose

## 📦 功能特性

- ✅ 现代化的 React 19 + Next.js 15 架构
- ✅ 类型安全的 TypeScript 开发
- ✅ Prisma ORM 数据库管理
- ✅ Redis 缓存优化性能
- ✅ 响应式设计，支持深色模式
- ✅ 管理后台，支持分类和网站管理
- ✅ 自动获取网站图标和描述
- ✅ 安全的用户认证系统

## 🛠️ 快速开始

### 方式一：Docker Compose（推荐）

```bash
# 克隆项目
git clone <your-repo-url>
cd thinnav-nextjs

# 复制环境变量
cp env.example .env.local

# 启动所有服务
docker-compose -f docker-compose.new.yaml up -d

# 等待服务启动完成，然后访问
# 用户端: http://localhost:3000
# 管理后台: http://localhost:3000/admin
```

### 方式二：本地开发

#### 前置要求
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

#### 安装步骤

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp env.example .env.local
# 编辑 .env.local 文件，配置数据库和 Redis 连接

# 3. 初始化数据库
npx prisma migrate dev
npx prisma db seed

# 4. 启动开发服务器
npm run dev
```

## 🔧 环境变量配置

创建 `.env.local` 文件：

```env
# 数据库配置
DATABASE_URL="postgresql://username:password@localhost:5432/thinnav"

# Redis 配置
REDIS_URL="redis://localhost:6379"

# NextAuth.js 配置
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# 应用配置
NODE_ENV="development"
UPLOAD_DIR="./public/icons"
```

## 📝 数据库管理

```bash
# 生成 Prisma 客户端
npm run db:generate

# 创建迁移
npm run db:migrate

# 部署迁移
npm run db:deploy

# 填充种子数据
npm run db:seed

# 打开数据库管理界面
npm run db:studio
```

## 🏗️ 项目结构

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API 路由
│   │   ├── admin/             # 管理后台页面
│   │   ├── globals.css        # 全局样式
│   │   ├── layout.tsx         # 根布局
│   │   └── page.tsx           # 首页
│   ├── components/            # React 组件
│   │   ├── ui/                # shadcn/ui 基础组件
│   │   └── admin/             # 管理后台组件
│   ├── lib/                   # 工具库
│   │   ├── prisma.ts          # Prisma 客户端
│   │   ├── redis.ts           # Redis 客户端
│   │   ├── auth.ts            # NextAuth 配置
│   │   └── utils.ts           # 工具函数
│   └── types/                 # TypeScript 类型定义
├── prisma/                    # Prisma 配置
├── public/                    # 静态资源
└── docker-compose.new.yaml    # Docker 配置
```

## 🔐 默认账号

- **用户名**: admin
- **密码**: 123456

## 🎯 主要改进

1. **现代化架构**: 使用 Next.js 15 App Router 和 React 19
2. **类型安全**: 全面的 TypeScript 支持
3. **性能优化**: Redis 缓存 + Prisma 查询优化
4. **用户体验**: shadcn/ui 组件库 + 响应式设计
5. **开发体验**: 热重载 + 类型检查 + ESLint

## 📱 访问地址

- **用户端**: http://localhost:3000
- **管理后台**: http://localhost:3000/admin

## 🔄 从旧版本迁移

如果您有旧版本的数据，可以通过以下步骤迁移：

1. 导出旧版本的 SQLite 数据
2. 使用 Prisma 迁移工具导入到 PostgreSQL
3. 运行数据验证脚本

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License