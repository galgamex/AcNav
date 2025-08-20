# 🚀 快速启动指南

## ⚠️ 重定向问题已修复

我已经修复了 `ERR_TOO_MANY_REDIRECTS` 问题：

1. ✅ 简化了认证系统，移除了复杂的 NextAuth 中间件
2. ✅ 使用基于 Cookie 的简单会话管理
3. ✅ 修复了中间件重定向循环

## 🚀 现在可以正常启动

```bash
# 1. 确保依赖已安装
npm install

# 2. 启动开发服务器
npm run dev
```

## 🌐 访问测试

现在可以正常访问：

- **用户端**: http://localhost:3000 ✅
- **管理后台登录**: http://localhost:3000/admin/login ✅  
- **管理后台**: http://localhost:3000/admin ✅

## 🔐 登录信息

- **用户名**: admin
- **密码**: 123456

## 🎯 测试步骤

1. 访问 http://localhost:3000/admin/login
2. 输入账号密码登录
3. 登录成功后会跳转到管理后台
4. 可以开始管理分类和网站

重定向问题已解决！现在可以正常使用了。🎉