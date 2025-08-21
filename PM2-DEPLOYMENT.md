# PM2 部署指南

本项目支持使用 PM2 进行生产环境部署。PM2 是一个功能强大的 Node.js 进程管理器，提供负载均衡、自动重启、日志管理等功能。

## 前置要求

- Node.js >= 18.17.0
- npm >= 9.0.0
- PM2 (全局安装)

## 安装 PM2

```bash
# 全局安装 PM2
npm install -g pm2

# 验证安装
pm2 --version
```

## 部署步骤

### 1. 准备项目

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 数据库迁移（如果需要）
npm run db:deploy
```

### 2. 配置环境变量

创建 `.env.production` 文件（或确保 `.env` 文件包含生产环境配置）：

```env
# 数据库配置
DATABASE_URL="your-production-database-url"

# NextAuth 配置
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://your-domain.com"

# Redis 配置（如果使用）
REDIS_URL="your-redis-url"

# 其他配置...
```

### 3. 启动应用

```bash
# 使用 PM2 启动应用
pm2 start ecosystem.config.js

# 或者直接启动
pm2 start npm --name "acnav" -- start
```

### 4. 常用 PM2 命令

```bash
# 查看应用状态
pm2 status
pm2 list

# 查看日志
pm2 logs acnav
pm2 logs acnav --lines 100

# 重启应用
pm2 restart acnav

# 重新加载应用（零停机时间）
pm2 reload acnav

# 停止应用
pm2 stop acnav

# 删除应用
pm2 delete acnav

# 监控应用
pm2 monit
```

## 配置说明

### ecosystem.config.js 配置项

- **name**: 应用名称
- **script**: 启动脚本
- **instances**: 实例数量（1 为单实例，'max' 为使用所有CPU核心）
- **autorestart**: 自动重启
- **max_memory_restart**: 内存限制重启
- **env**: 环境变量配置

### 集群模式（可选）

如果需要使用集群模式以提高性能，可以修改配置：

```javascript
{
  instances: 'max', // 或指定数字，如 4
  exec_mode: 'cluster'
}
```

### 日志管理

日志文件将保存在 `./logs/` 目录下：
- `combined.log`: 合并日志
- `out.log`: 标准输出日志
- `error.log`: 错误日志

## 生产环境优化

### 1. 启用日志轮转

```bash
# 安装 PM2 日志轮转模块
pm2 install pm2-logrotate

# 配置日志轮转
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
```

### 2. 开机自启动

```bash
# 生成启动脚本
pm2 startup

# 保存当前进程列表
pm2 save
```

### 3. 监控和告警

```bash
# 启用 PM2 监控
pm2 monitor

# 或使用 PM2 Plus（需要注册账号）
pm2 link <secret_key> <public_key>
```

## 部署脚本示例

创建 `deploy.sh` 脚本：

```bash
#!/bin/bash

echo "开始部署 AcNav..."

# 拉取最新代码
git pull origin main

# 安装依赖
npm install

# 构建项目
npm run build

# 数据库迁移
npm run db:deploy

# 重启 PM2 应用
pm2 reload acnav

echo "部署完成！"
```

## 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 检查端口占用
   netstat -tulpn | grep :3000
   
   # 修改 ecosystem.config.js 中的端口配置
   ```

2. **内存不足**
   ```bash
   # 增加内存限制
   max_memory_restart: '2G'
   ```

3. **数据库连接问题**
   - 检查 `.env` 文件中的数据库配置
   - 确保数据库服务正在运行
   - 验证网络连接

### 查看详细日志

```bash
# 实时查看日志
pm2 logs acnav --lines 0

# 查看错误日志
pm2 logs acnav --err

# 查看特定时间的日志
pm2 logs acnav --timestamp
```

## 性能优化建议

1. **使用集群模式**：充分利用多核CPU
2. **配置反向代理**：使用 Nginx 作为反向代理
3. **启用缓存**：配置 Redis 缓存
4. **监控资源使用**：定期检查内存和CPU使用情况
5. **日志管理**：定期清理和轮转日志文件

## 安全建议

1. **环境变量**：不要在代码中硬编码敏感信息
2. **防火墙**：只开放必要的端口
3. **HTTPS**：在生产环境中使用 HTTPS
4. **定期更新**：保持依赖项和系统更新

---

更多 PM2 使用方法请参考 [PM2 官方文档](https://pm2.keymetrics.io/docs/)