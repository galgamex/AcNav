'use client';

import { useState, useEffect } from 'react';
import { Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { IconSelector } from './IconSelector';

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  onSuccess: () => void;
  categories?: Category[];
}

export function CategoryForm({ isOpen, onClose, category, onSuccess, categories = [] }: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    iconUrl: category?.iconUrl || '',
    icon: category?.icon || '',
    order: category?.order || 0,
    parentId: category?.parentId || null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 获取可选的父分类（排除当前分类及其子分类）
  const getAvailableParentCategories = () => {
    if (!category) return categories; // 新建分类时，所有分类都可作为父分类
    
    // 编辑分类时，排除自己和自己的子分类
    const excludeIds = new Set([category.id]);
    
    // 递归收集所有子分类ID
    const collectChildIds = (cat: Category) => {
      if (cat.children) {
        cat.children.forEach(child => {
          excludeIds.add(child.id);
          collectChildIds(child);
        });
      }
    };
    
    collectChildIds(category);
    
    return categories.filter(cat => !excludeIds.has(cat.id));
  };

  // 重置表单数据
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: category?.name || '',
        iconUrl: category?.iconUrl || '',
        icon: category?.icon || '',
        order: category?.order || 0,
        parentId: category?.parentId || null,
      });
      setError('');
    }
  }, [isOpen, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const url = category 
        ? `/api/categories/${category.id}` 
        : '/api/categories';
      
      const method = category ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
        setFormData({ name: '', iconUrl: '', icon: '', order: 0, parentId: null });
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
    setFormData({ name: '', iconUrl: '', icon: '', order: 0, parentId: null });
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {category ? '编辑分类' : '添加分类'}
          </DialogTitle>
          <DialogDescription>
            {category ? '修改分类信息' : '创建新的网站分类'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">分类名称 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="请输入分类名称"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentId">父分类</Label>
            <Select
              value={formData.parentId?.toString() || 'none'}
              onValueChange={(value) => setFormData({ ...formData, parentId: value === 'none' ? null : parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择父分类（可选）" />
              </SelectTrigger>
              <SelectContent>
                 <SelectItem value="none">无父分类（顶级分类）</SelectItem>
                 {getAvailableParentCategories().map((cat) => (
                   <SelectItem key={cat.id} value={cat.id.toString()}>
                     {cat.name}
                   </SelectItem>
                 ))}
               </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">分类图标</Label>
            <IconSelector
              value={formData.icon}
              onChange={(iconName) => setFormData({ ...formData, icon: iconName })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="iconUrl">自定义图标URL（可选）</Label>
            <Input
              id="iconUrl"
              value={formData.iconUrl}
              onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
              placeholder="如需使用自定义图标，请输入图标URL"
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
    </Dialog>
  );
}