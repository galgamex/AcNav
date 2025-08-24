import { AuthGuard } from '@/components/admin/AuthGuard';
import { SettingsForm } from '@/components/admin/SettingsForm';

// 强制动态渲染，因为使用了 cookies
export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  return (
    <AuthGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            系统设置
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            管理系统配置和账号设置
          </p>
        </div>

        <SettingsForm />
      </div>
    </AuthGuard>
  );
}