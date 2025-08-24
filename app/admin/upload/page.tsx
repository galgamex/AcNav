'use client';

import { useState, useEffect } from 'react';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  HardDrive, 
  User, 
  Crown, 
  RefreshCw,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

interface SmmsAccountInfo {
  username: string;
  role: string;
  diskUsage: string;
  diskLimit: string;
  diskUsageRaw: number;
  diskLimitRaw: number;
  usagePercentage: number;
}

export default function UploadPage() {
  const [accountInfo, setAccountInfo] = useState<SmmsAccountInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);

  // 获取账户信息
  const fetchAccountInfo = async () => {
    try {
      const response = await fetch('/api/upload');
      const result = await response.json();
      
      if (result.success) {
        setAccountInfo(result.data);
      } else {
        toast.error('获取账户信息失败');
      }
    } catch (error) {
      console.error('获取账户信息失败:', error);
      toast.error('获取账户信息失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理上传成功
  const handleUploadSuccess = (imageUrl: string) => {
    toast.success('图片上传成功！');
    // 可以在这里添加图片到列表
  };

  // 处理上传错误
  const handleUploadError = (error: string) => {
    toast.error(error);
  };

  // 刷新账户信息
  const handleRefresh = () => {
    setLoading(true);
    fetchAccountInfo();
  };

  useEffect(() => {
    fetchAccountInfo();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          SM.MS 图片管理
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          使用SM.MS图床服务上传和管理图片
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 账户信息 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                账户信息
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : accountInfo ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">用户名:</span>
                    <span className="font-medium">{accountInfo.username}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">账户类型:</span>
                    <Badge variant={accountInfo.role === 'VIP' ? 'default' : 'secondary'}>
                      {accountInfo.role === 'VIP' ? (
                        <Crown className="w-3 h-3 mr-1" />
                      ) : (
                        <User className="w-3 h-3 mr-1" />
                      )}
                      {accountInfo.role}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">存储使用:</span>
                      <span className="font-medium">
                        {accountInfo.diskUsage} / {accountInfo.diskLimit}
                      </span>
                    </div>
                    <Progress value={accountInfo.usagePercentage} className="h-2" />
                    <p className="text-xs text-gray-500">
                      已使用 {accountInfo.usagePercentage}%
                    </p>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => window.open('https://sm.ms', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    访问SM.MS
                  </Button>
                </>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  无法获取账户信息
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 图片上传 */}
        <div className="lg:col-span-2">
          <ImageUploader
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
            maxSize={5}
            acceptedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
          />
        </div>
      </div>

      {/* 使用说明 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            使用说明
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <p>
              <strong>支持格式：</strong>JPG、PNG、GIF、WebP
            </p>
            <p>
              <strong>文件大小：</strong>最大 5MB
            </p>
            <p>
              <strong>上传方式：</strong>拖拽上传或点击选择文件
            </p>
            <p>
              <strong>图片管理：</strong>上传成功后会自动生成图片URL，可直接复制使用
            </p>
            <p>
              <strong>注意事项：</strong>上传的图片会永久保存在SM.MS图床，请确保图片内容合规
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
