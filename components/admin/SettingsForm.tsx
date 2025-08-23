'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export function SettingsForm() {
  const { checkRequireRelogin } = useAuth();
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');







  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('新密码与确认密码不匹配');
      setIsLoading(false);
      return;
    }

    // 确认用户知道修改密码后会需要重新登录
    if (!confirm('修改密码后需要重新登录，是否继续？')) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldPassword: passwords.oldPassword,
          newPassword: passwords.newPassword,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
        setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
        
        // 如果需要重新登录，显示提示并跳转到登录页
        if (data.requireRelogin) {
          toast.success('密码修改成功，请重新登录');
          // 检查认证状态并处理重新登录
          setTimeout(async () => {
            await checkRequireRelogin();
          }, 1000);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || '修改密码失败');
      }
    } catch (error) {
      console.error('修改密码失败:', error);
      setError('修改密码失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">


      {/* 密码修改 */}
      <Card>
        <CardHeader>
          <CardTitle>修改密码</CardTitle>
          <CardDescription>
            更改您的管理员账号密码。修改密码后需要重新登录以确保安全性。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="oldPassword">原密码 *</Label>
              <Input
                id="oldPassword"
                type="password"
                value={passwords.oldPassword}
                onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                placeholder="请输入原密码"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">新密码 *</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                placeholder="请输入新密码（至少6位）"
                minLength={6}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认新密码 *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                placeholder="请再次输入新密码"
                minLength={6}
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {message && (
              <div className="text-sm text-green-600 dark:text-green-400">
                {message}
              </div>
            )}

            <Button type="submit" disabled={isLoading}>
              {isLoading ? '修改中...' : '修改密码'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>系统信息</CardTitle>
          <CardDescription>
            当前系统版本和配置信息
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">版本:</span>
            <span className="text-sm font-medium">2.0.0 (Next.js)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">技术栈:</span>
            <span className="text-sm font-medium">Next.js 15 + React 19</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">数据库:</span>
            <span className="text-sm font-medium">PostgreSQL + Prisma</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">缓存:</span>
            <span className="text-sm font-medium">Redis</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}