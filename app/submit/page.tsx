'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Send, Globe, Tag, FileText, Folder } from 'lucide-react';
import Link from 'next/link';
import { Category } from '@/types';
import { toast } from 'sonner';

interface SubmissionData {
  name: string;
  url: string;
  description: string;
  categoryId: string;
  tags: string;
  contactEmail: string;
}

export default function SubmitPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<SubmissionData>({
    name: '',
    url: '',
    description: '',
    categoryId: '',
    tags: '',
    contactEmail: ''
  });

  // 获取分类列表
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          // 确保data是数组，如果不是则使用空数组
          setCategories(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('获取分类失败:', error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (field: keyof SubmissionData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('请输入网站名称');
      return false;
    }
    if (!formData.url.trim()) {
      toast.error('请输入网站URL');
      return false;
    }
    if (!formData.url.match(/^https?:\/\/.+/)) {
      toast.error('请输入有效的网站URL（以http://或https://开头）');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('请输入网站描述');
      return false;
    }
    if (!formData.categoryId) {
      toast.error('请选择分类');
      return false;
    }
    if (!formData.contactEmail.trim()) {
      toast.error('请输入联系邮箱');
      return false;
    }
    if (!formData.contactEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error('请输入有效的邮箱地址');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('申请提交成功！我们会尽快审核您的申请。');
        // 重置表单
        setFormData({
          name: '',
          url: '',
          description: '',
          categoryId: '',
          tags: '',
          contactEmail: ''
        });
      } else {
        const error = await response.json();
        toast.error(error.message || '提交失败，请稍后重试');
      }
    } catch (error) {
      console.error('提交申请失败:', error);
      toast.error('提交失败，请检查网络连接');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回首页
          </Link>
        </div>

        {/* 主要内容 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Send className="h-6 w-6 mr-3 text-blue-600" />
              申请收录
            </CardTitle>
            <CardDescription>
              欢迎提交您的网站申请收录！请填写以下信息，我们会尽快审核您的申请。
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 网站名称 */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  网站名称 *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="请输入网站名称"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              {/* 网站URL */}
              <div className="space-y-2">
                <Label htmlFor="url" className="flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  网站URL *
                </Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.url}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  required
                />
              </div>

              {/* 网站描述 */}
              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  网站描述 *
                </Label>
                <Textarea
                  id="description"
                  placeholder="请简要描述您的网站内容、特色和用途"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  required
                />
              </div>

              {/* 分类选择 */}
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Folder className="h-4 w-4 mr-2" />
                  所属分类 *
                </Label>
                <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择网站分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(categories) && categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 标签 */}
              <div className="space-y-2">
                <Label htmlFor="tags" className="flex items-center">
                  <Tag className="h-4 w-4 mr-2" />
                  相关标签
                </Label>
                <Input
                  id="tags"
                  type="text"
                  placeholder="请输入相关标签，用逗号分隔（如：工具,设计,开发）"
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  标签有助于用户更好地发现您的网站
                </p>
              </div>

              {/* 联系邮箱 */}
              <div className="space-y-2">
                <Label htmlFor="contactEmail">
                  联系邮箱 *
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  我们会通过此邮箱与您联系审核结果
                </p>
              </div>

              {/* 提交按钮 */}
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      提交中...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      提交申请
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 说明信息 */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>提交申请后，我们会在 1-3 个工作日内完成审核。</p>
          <p>审核通过的网站将会出现在相应的分类页面中。</p>
        </div>
      </div>
    </div>
  );
}