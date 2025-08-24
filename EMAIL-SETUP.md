# 邮件通知功能配置指南

## 功能概述

ACGN导航平台现在支持在网站申请审核通过或拒绝时自动发送邮件通知给申请人。这提供了更好的用户体验，让申请人能够及时了解审核结果。

## 邮件通知类型

### 1. 审核通过邮件
- **触发条件**：管理员将申请状态设置为"通过"
- **邮件内容**：
  - 恭喜信息
  - 申请详情（网站名称、URL、分类等）
  - 访问ACGN导航的链接
  - 感谢信息

### 2. 审核拒绝邮件
- **触发条件**：管理员将申请状态设置为"拒绝"
- **邮件内容**：
  - 审核结果通知
  - 申请详情
  - 审核备注（如果管理员有填写）
  - 重新提交申请的建议和链接

## 配置步骤

### 1. 环境变量配置

在 `.env` 文件中添加以下配置：

```env
# 邮件配置
SMTP_HOST="smtp.qq.com"
SMTP_PORT="587"
SMTP_USER="your-email@qq.com"
SMTP_PASS="your-email-authorization-code"
NEXT_PUBLIC_SITE_URL="https://your-domain.com"
```

### 2. 邮箱配置说明

#### 使用QQ邮箱（推荐）

1. **获取授权码**：
   - 登录QQ邮箱
   - 进入"设置" → "账户"
   - 找到"POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务"
   - 开启"POP3/SMTP服务"
   - 获取授权码（不是QQ密码）

2. **配置环境变量**：
   ```env
   SMTP_HOST="smtp.qq.com"
   SMTP_PORT="587"
   SMTP_USER="your-qq-email@qq.com"
   SMTP_PASS="your-authorization-code"
   ```

#### 使用企业邮箱

1. **获取SMTP信息**：
   - 联系企业邮箱管理员获取SMTP服务器信息
   - 获取邮箱账号和密码

2. **配置环境变量**：
   ```env
   SMTP_HOST="smtp.your-company.com"
   SMTP_PORT="587"  # 或465
   SMTP_USER="your-email@your-company.com"
   SMTP_PASS="your-password"
   ```

#### 使用Gmail

1. **开启两步验证**：
   - 登录Google账户
   - 开启两步验证

2. **生成应用专用密码**：
   - 进入"安全性" → "应用专用密码"
   - 生成新的应用专用密码

3. **配置环境变量**：
   ```env
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your-gmail@gmail.com"
   SMTP_PASS="your-app-specific-password"
   ```

### 3. 网站URL配置

设置 `NEXT_PUBLIC_SITE_URL` 为您的网站域名：

```env
# 开发环境
NEXT_PUBLIC_SITE_URL="http://localhost:3001"

# 生产环境
NEXT_PUBLIC_SITE_URL="https://your-domain.com"
```

## 测试邮件功能

### 1. 测试邮件发送

可以通过以下方式测试邮件功能：

1. **提交测试申请**：
   - 访问 `/submit` 页面
   - 填写测试申请信息
   - 提交申请

2. **审核测试申请**：
   - 登录管理员后台
   - 访问"收录申请"页面
   - 审核测试申请（通过或拒绝）
   - 检查是否收到邮件通知

### 2. 检查邮件发送日志

在服务器日志中查看邮件发送状态：

```bash
# 查看应用日志
tail -f logs/app.log

# 查看邮件发送成功日志
grep "邮件发送成功" logs/app.log

# 查看邮件发送失败日志
grep "邮件发送失败" logs/app.log
```

## 故障排除

### 常见问题

1. **邮件发送失败**
   - 检查SMTP配置是否正确
   - 确认邮箱授权码/密码是否正确
   - 检查网络连接是否正常

2. **邮件被标记为垃圾邮件**
   - 配置SPF、DKIM、DMARC记录
   - 使用企业邮箱而不是免费邮箱
   - 避免使用过于营销化的邮件内容

3. **邮件模板显示异常**
   - 检查HTML模板语法
   - 确认邮件客户端支持HTML格式

### 调试模式

在开发环境中，可以启用详细日志：

```env
LOG_LEVEL="debug"
VERBOSE_LOGGING="true"
```

## 邮件模板自定义

邮件模板位于 `lib/email.ts` 文件中，可以根据需要自定义：

- `getApprovalEmailTemplate()` - 审核通过邮件模板
- `getRejectionEmailTemplate()` - 审核拒绝邮件模板

### 自定义样式

邮件模板使用内联CSS样式，确保在不同邮件客户端中都能正常显示。

### 添加品牌元素

可以在邮件模板中添加：
- 网站Logo
- 品牌色彩
- 公司信息
- 社交媒体链接

## 安全注意事项

1. **保护邮箱凭据**：
   - 不要在代码中硬编码邮箱密码
   - 使用环境变量存储敏感信息
   - 定期更换邮箱授权码

2. **邮件发送限制**：
   - 避免发送垃圾邮件
   - 遵守邮件服务商的使用条款
   - 实现邮件发送频率限制

3. **数据保护**：
   - 确保邮件内容不包含敏感信息
   - 遵守相关数据保护法规

## 性能优化

1. **异步发送**：
   - 邮件发送不会阻塞审核流程
   - 邮件发送失败不影响审核结果

2. **错误处理**：
   - 邮件发送失败会记录错误日志
   - 不会影响正常的审核功能

3. **缓存优化**：
   - 邮件模板可以缓存以提高性能
   - 避免重复的模板渲染
