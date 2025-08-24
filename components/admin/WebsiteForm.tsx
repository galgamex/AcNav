'use client';

import { useState, useEffect } from 'react';
import { Website, Category, Tag } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import Image from 'next/image';

interface WebsiteFormProps {
  isOpen: boolean;
  onClose: () => void;
  website?: Website | null;
  categories: Category[];
  tags: Tag[];
  onSuccess: (updatedWebsite?: Website & { category: Category }) => void;
}

export function WebsiteForm({ isOpen, onClose, website, categories, tags, onSuccess }: WebsiteFormProps) {
  const [formData, setFormData] = useState({
    name: website?.name || '',
    url: website?.url || '',
    iconUrl: website?.iconUrl || '',
    description: website?.description || '',
    order: website?.order || 0,
    categoryId: website?.categoryId || (categories[0]?.id || 0),
    isRecommended: website?.isRecommended || false,
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showImageUploader, setShowImageUploader] = useState(false);

  // 当网站数据变化时，更新选中的标签
  useEffect(() => {
    if (website?.websiteTags) {
      setSelectedTags(website.websiteTags.map(wt => wt.tag?.name || '').filter(name => name));
    } else {
      setSelectedTags([]);
      setTagInput('');
    }
  }, [website]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const url = website 
        ? `/api/websites/${website.id}` 
        : '/api/websites';
      
      const method = website ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tagNames: selectedTags
        }),
      });

      if (response.ok) {
        const updatedWebsite = await response.json();
        onSuccess(updatedWebsite);
        setFormData({ 
          name: '', 
          url: '', 
          iconUrl: '', 
          description: '', 
          order: 0, 
          categoryId: categories[0]?.id || 0,
          isRecommended: false
        });
        setSelectedTags([]);
      } else {
        const errorData = await response.json();
        setError(errorData.error || '操作失败');
      }
    } catch (error) {
      console.error('表单提交失败:', error);
      setError('操作失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ 
      name: '', 
      url: '', 
      iconUrl: '', 
      description: '', 
      order: 0, 
      categoryId: categories[0]?.id || 0,
      isRecommended: false
    });
    setSelectedTags([]);
    setError('');
    onClose();
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      setSelectedTags(prev => [...prev, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagName: string) => {
    setSelectedTags(prev => prev.filter(name => name !== tagName));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // 处理图片上传成功
  const handleImageUploadSuccess = (imageUrl: string) => {
    setFormData({ ...formData, iconUrl: imageUrl });
    setShowImageUploader(false);
  };

  // 处理图片上传错误
  const handleImageUploadError = (error: string) => {
    console.error('图片上传失败:', error);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle>
            {website ? '编辑网站' : '添加网站'}
          </DialogTitle>
          <DialogDescription>
            {website ? '修改网站信息' : '创建新的网站链接'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">网站名称</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="请输入网站名称（可选，会自动获取）"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">网站URL *</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">所属分类 *</Label>
            <Select 
              value={formData.categoryId.toString()} 
              onValueChange={(value) => setFormData({ ...formData, categoryId: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="iconUrl">网站图标</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  id="iconUrl"
                  value={formData.iconUrl}
                  onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                  placeholder="图标URL（可选，会自动获取）"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowImageUploader(true)}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  上传
                </Button>
              </div>
              
              {/* 图标预览 */}
              {formData.iconUrl && (
                <div className="flex items-center gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded-md">
                  <ImageIcon className="h-4 w-4 text-gray-500" />
                  <Image
                    src={formData.iconUrl}
                    alt="网站图标"
                    width={24}
                    height={24}
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {formData.iconUrl}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="网站描述（可选，会自动获取）"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="order">排序</Label>
            <Input
              id="order"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              placeholder="排序数字，越小越靠前"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label>标签</Label>
            <div className="space-y-3">
              {/* 标签输入框 */}
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagInputKeyPress}
                  placeholder="输入标签名称，按回车添加"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || selectedTags.includes(tagInput.trim())}
                >
                  添加
                </Button>
              </div>
              
              {/* 已选择的标签 */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map(tagName => (
                    <Badge
                      key={tagName}
                      variant="secondary"
                      className="flex items-center gap-1 px-2 py-1"
                    >
                      <span>{tagName}</span>
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-500"
                        onClick={() => handleRemoveTag(tagName)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* 建议标签（从现有标签中筛选） */}
              {tags.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">建议标签（点击快速添加）</Label>
                  <div className="flex flex-wrap gap-1">
                    {tags
                      .filter(tag => !selectedTags.includes(tag.name))
                      .slice(0, 10)
                      .map(tag => (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-xs"
                          onClick={() => {
                            if (!selectedTags.includes(tag.name)) {
                              setSelectedTags(prev => [...prev, tag.name]);
                            }
                          }}
                        >
                          {tag.name}
                        </Badge>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isRecommended"
              checked={formData.isRecommended}
              onCheckedChange={(checked) => setFormData({ ...formData, isRecommended: !!checked })}
            />
            <Label htmlFor="isRecommended" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              推荐网站
            </Label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              （推荐的网站将显示在首页推荐专区）
            </span>
          </div>

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              取消
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* 图片上传对话框 */}
      <Dialog open={showImageUploader} onOpenChange={setShowImageUploader}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              上传网站图标
            </DialogTitle>
            <DialogDescription>
              选择图片文件上传到SM.MS图床，获取图标URL
            </DialogDescription>
          </DialogHeader>
          
          <ImageUploader
            onUploadSuccess={handleImageUploadSuccess}
            onUploadError={handleImageUploadError}
            maxSize={2}
            acceptedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']}
          />
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowImageUploader(false)}
            >
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}