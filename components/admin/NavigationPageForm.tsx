'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Category {
  id: number;
  name: string;
  order: number;
  parentId?: number;
  children?: Category[];
}

interface NavigationPage {
  id: number;
  name: string;
  slug: string;
  title: string;
  description?: string;
  keywords?: string;
  isActive: boolean;
  sidebarCategories?: string;
}

interface NavigationPageFormProps {
  navigationPage?: NavigationPage | null;
  onSuccess: () => void;
}

export function NavigationPageForm({ navigationPage, onSuccess }: NavigationPageFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    title: '',
    description: '',
    keywords: '',
    isActive: true,
    sidebarCategories: [] as number[],
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [collapsedCategories, setCollapsedCategories] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchCategories();
    if (navigationPage) {
      setFormData({
        name: navigationPage.name,
        slug: navigationPage.slug,
        title: navigationPage.title,
        description: navigationPage.description || '',
        keywords: navigationPage.keywords || '',
        isActive: navigationPage.isActive,
        sidebarCategories: navigationPage.sidebarCategories 
          ? JSON.parse(navigationPage.sidebarCategories) 
          : [],
      });
    }
  }, [navigationPage]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        const allCategories = data.categories || data || [];
        
        // 构建层级结构
        const categoryMap = new Map();
        const hierarchicalCategories: Category[] = [];

        // 先创建所有分类的映射
        allCategories.forEach((category: any) => {
          categoryMap.set(category.id, { ...category, children: [] });
        });

        // 构建层级关系
        allCategories.forEach((category: any) => {
          if (category.parentId) {
            const parent = categoryMap.get(category.parentId);
            if (parent) {
              parent.children.push(categoryMap.get(category.id));
            }
          } else {
            hierarchicalCategories.push(categoryMap.get(category.id));
          }
        });

        setCategories(hierarchicalCategories);
        
        // 初始化时默认折叠所有有子分类的分类
        const initCollapsed = new Set<number>();
        hierarchicalCategories.forEach(category => {
          if (category.children && category.children.length > 0) {
            initCollapsed.add(category.id);
          }
        });
        setCollapsedCategories(initCollapsed);
      }
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      name: value,
      slug: !navigationPage ? generateSlug(value) : prev.slug, // 只在新建时自动生成slug
    }));
  };

  const handleCategoryToggle = (categoryId: number) => {
    setFormData(prev => {
      const currentCategories = prev.sidebarCategories;
      const newCategories = currentCategories.includes(categoryId)
        ? currentCategories.filter(id => id !== categoryId)
        : [...currentCategories, categoryId];
      
      return {
        ...prev,
        sidebarCategories: newCategories,
      };
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '导航页名称不能为空';
    }
    
    if (!formData.slug.trim()) {
      newErrors.slug = '路径标识符不能为空';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = '路径标识符只能包含小写字母、数字和连字符';
    }
    
    if (!formData.title.trim()) {
      newErrors.title = 'SEO标题不能为空';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const url = navigationPage 
        ? `/api/navigation-pages/${navigationPage.id}`
        : '/api/navigation-pages';
      
      const method = navigationPage ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        onSuccess();
      } else {
        const errorData = await response.json();
        alert(errorData.error || '操作失败');
      }
    } catch (error) {
      console.error('提交失败:', error);
      alert('提交失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 基本信息 */}
      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">导航页名称 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="输入导航页名称"
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
          </div>
          
          <div>
            <Label htmlFor="slug">路径标识符 *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="输入URL路径标识符"
            />
            <p className="text-sm text-muted-foreground mt-1">
              访问地址将是: /{formData.slug}
            </p>
            {errors.slug && <p className="text-sm text-red-500 mt-1">{errors.slug}</p>}
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, isActive: checked as boolean }))
              }
            />
            <Label htmlFor="isActive">启用导航页</Label>
          </div>
        </CardContent>
      </Card>

      {/* SEO设置 */}
      <Card>
        <CardHeader>
          <CardTitle>SEO设置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">SEO标题 *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="输入页面标题"
            />
            {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
          </div>
          
          <div>
            <Label htmlFor="description">SEO描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="输入页面描述"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="keywords">关键词</Label>
            <Input
              id="keywords"
              value={formData.keywords}
              onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
              placeholder="输入关键词，用逗号分隔"
            />
          </div>
        </CardContent>
      </Card>

      {/* 侧边栏分类配置 */}
      <Card>
        <CardHeader>
          <CardTitle>侧边栏分类设置</CardTitle>
          <p className="text-sm text-gray-600">选择要在侧边栏显示的分类，支持父子分类层级结构</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="block text-sm font-medium mb-2">选择分类</Label>
            <div className="max-h-96 overflow-y-auto scrollbar-hide border rounded p-3 space-y-2">
              {categories.map((category) => {
                const isCollapsed = collapsedCategories.has(category.id);
                const hasChildren = category.children && category.children.length > 0;
                
                return (
                  <div key={category.id}>
                    {/* 父分类 */}
                    <div className="flex items-center space-x-2">
                      {hasChildren && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const newCollapsed = new Set(collapsedCategories);
                            if (isCollapsed) {
                              newCollapsed.delete(category.id);
                            } else {
                              newCollapsed.add(category.id);
                            }
                            setCollapsedCategories(newCollapsed);
                          }}
                          className="text-gray-500 hover:text-gray-700 text-xs w-4 h-4 flex items-center justify-center"
                        >
                          {isCollapsed ? '▶' : '▼'}
                        </button>
                      )}
                      {!hasChildren && <div className="w-4" />}
                      <Checkbox
                        id={`sidebar-category-${category.id}`}
                        checked={formData.sidebarCategories.includes(category.id)}
                        onCheckedChange={() => handleCategoryToggle(category.id)}
                      />
                      <Label htmlFor={`sidebar-category-${category.id}`} className="text-sm font-medium cursor-pointer">
                        {category.name}
                      </Label>
                      <span className="text-xs text-gray-500">({category.children?.length || 0} 个子分类)</span>
                    </div>
                    
                    {/* 子分类 */}
                    {hasChildren && !isCollapsed && (
                      <div className="ml-6 mt-2 space-y-1">
                        {category.children?.map((child) => (
                          <div key={child.id} className="flex items-center space-x-2">
                            <div className="w-4" />
                            <Checkbox
                              id={`sidebar-category-${child.id}`}
                              checked={formData.sidebarCategories.includes(child.id)}
                              onCheckedChange={() => handleCategoryToggle(child.id)}
                            />
                            <Label htmlFor={`sidebar-category-${child.id}`} className="text-sm cursor-pointer text-gray-700">
                              └ {child.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* 已选择的侧边栏分类预览 */}
          {formData.sidebarCategories.length > 0 && (
            <div className="space-y-2">
              <Label className="block text-sm font-medium mb-2">已选择的侧边栏分类 ({formData.sidebarCategories.length})</Label>
              <div className="flex flex-wrap gap-2">
                {formData.sidebarCategories.map((categoryId) => {
                  const findCategoryName = (categories: Category[], id: number): string => {
                    for (const category of categories) {
                      if (category.id === id) return category.name;
                      if (category.children) {
                        const childName = findCategoryName(category.children, id);
                        if (childName) return childName;
                      }
                    }
                    return '未知分类';
                  };
                  
                  return (
                    <div key={categoryId} className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      <span>{findCategoryName(categories, categoryId)}</span>
                      <button
                        onClick={() => handleCategoryToggle(categoryId)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? '保存中...' : (navigationPage ? '更新' : '创建')}
        </Button>
      </div>
    </form>
  );
}