'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';
// 移除直接导入SM.MS API

interface ImageUploaderProps {
  onUploadSuccess: (imageUrl: string) => void;
  onUploadError?: (error: string) => void;
  maxSize?: number; // 最大文件大小（MB）
  acceptedTypes?: string[]; // 接受的文件类型
  className?: string;
}

export function ImageUploader({
  onUploadSuccess,
  onUploadError,
  maxSize = 5, // 默认5MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  className = ''
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    url?: string;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!acceptedTypes.includes(file.type)) {
      onUploadError?.('不支持的文件类型');
      return;
    }

    // 验证文件大小
    if (file.size > maxSize * 1024 * 1024) {
      onUploadError?.(`文件大小不能超过 ${maxSize}MB`);
      return;
    }

    setSelectedFile(file);
    setUploadResult(null);

    // 创建预览
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 处理文件拖拽
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      // 直接处理文件，避免类型转换问题
      if (!acceptedTypes.includes(file.type)) {
        onUploadError?.('不支持的文件类型');
        return;
      }

      if (file.size > maxSize * 1024 * 1024) {
        onUploadError?.(`文件大小不能超过 ${maxSize}MB`);
        return;
      }

      setSelectedFile(file);
      setUploadResult(null);

      // 创建预览
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 上传图片
  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // 通过我们的API路由上传到SM.MS
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        setUploadResult({
          success: true,
          message: '上传成功！',
          url: result.data.url
        });

        // 调用成功回调
        onUploadSuccess(result.data.url);
      } else {
        throw new Error(result.error || '上传失败');
      }

    } catch (error) {
      setUploadResult({
        success: false,
        message: error instanceof Error ? error.message : '上传失败'
      });
      onUploadError?.(error instanceof Error ? error.message : '上传失败');
    } finally {
      setIsUploading(false);
    }
  };

  // 清除选择
  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadResult(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          图片上传
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 上传区域 */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            selectedFile
              ? 'border-green-300 bg-green-50 dark:bg-green-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
          }`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {!selectedFile ? (
            <div className="space-y-2">
              <Upload className="w-8 h-8 mx-auto text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                拖拽图片到此处或点击选择文件
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                支持 {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} 格式，最大 {maxSize}MB
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2"
              >
                选择文件
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative inline-block">
                <Image
                  src={previewUrl!}
                  alt="预览"
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover rounded border"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 w-6 h-6"
                  onClick={handleClear}
                  aria-label="删除图片"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}
        </div>

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* 上传按钮 */}
        {selectedFile && !isUploading && (
          <Button
            onClick={handleUpload}
            className="w-full"
            disabled={isUploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            上传到SM.MS
          </Button>
        )}

        {/* 上传进度 */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>上传中...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* 上传结果 */}
        {uploadResult && (
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            uploadResult.success
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
          }`}>
            {uploadResult.success ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="text-sm">{uploadResult.message}</span>
          </div>
        )}

        {/* 成功后的图片URL */}
        {uploadResult?.success && uploadResult.url && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              图片URL:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={uploadResult.url}
                readOnly
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(uploadResult.url!)}
              >
                复制
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
