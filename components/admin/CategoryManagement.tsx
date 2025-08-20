'use client';

import { useState } from 'react';
import { Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { CategoryForm } from './CategoryForm';
import { useRouter } from 'next/navigation';

interface CategoryManagementProps {
  initialCategories: (Category & { _count: { websites: number }; children?: (Category & { _count: { websites: number } })[] })[];
}

export function CategoryManagement({ initialCategories }: CategoryManagementProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const router = useRouter();

  // 扁平化所有分类（包括子分类）用于传递给CategoryForm
  const getAllCategories = (cats: (Category & { _count: { websites: number }; children?: (Category & { _count: { websites: number } })[] })[]): Category[] => {
    const result: Category[] = [];
    cats.forEach(cat => {
      result.push(cat);
      if (cat.children) {
        result.push(...getAllCategories(cat.children as (Category & { _count: { websites: number }; children?: (Category & { _count: { websites: number } })[] })[]));
      }
    });
    return result;
  };

  const toggleExpanded = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = async (categoryId: number) => {
    if (!confirm('确定要删除这个分类吗？')) return;

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCategories(categories.filter(c => c.id !== categoryId));
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || '删除失败');
      }
    } catch (error) {
      console.error('删除分类失败:', error);
      alert('删除失败');
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">分类列表</h2>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          添加分类
        </Button>
      </div>

      <div className="space-y-2">
        {categories.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            level={0}
            expandedCategories={expandedCategories}
            onToggleExpanded={toggleExpanded}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {categories.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              暂无分类，点击上方按钮添加第一个分类
            </p>
          </CardContent>
        </Card>
      )}

      <CategoryForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        category={editingCategory}
        onSuccess={handleFormSuccess}
        categories={getAllCategories(categories)}
      />
    </div>
  );
}

// CategoryItem 组件用于递归渲染分类树
interface CategoryItemProps {
  category: Category & { _count: { websites: number }; children?: (Category & { _count: { websites: number } })[] };
  level: number;
  expandedCategories: Set<number>;
  onToggleExpanded: (categoryId: number) => void;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: number) => void;
}

function CategoryItem({
  category,
  level,
  expandedCategories,
  onToggleExpanded,
  onEdit,
  onDelete,
}: CategoryItemProps) {
  const hasChildren = category.children && category.children.length > 0;
  const isExpanded = expandedCategories.has(category.id);
  const paddingLeft = level * 24; // 每级缩进24px

  return (
    <div>
      <Card className="mb-2">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center" style={{ paddingLeft: `${paddingLeft}px` }}>
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 mr-2"
                  onClick={() => onToggleExpanded(category.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
              {!hasChildren && <div className="w-6 mr-2" />}
              {category.iconUrl && (
                <img
                  src={category.iconUrl}
                  alt={category.name}
                  className="w-5 h-5 mr-2"
                />
              )}
              <div>
                <div className="font-medium">{category.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  排序: {category.order} | 网站数: {category._count.websites}
                  {category.parentId && ' | 子分类'}
                </div>
              </div>
            </div>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(category)}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600 hover:text-red-700"
                onClick={() => onDelete(category.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 递归渲染子分类 */}
      {hasChildren && isExpanded && (
        <div className="ml-4">
          {category.children!.map((child) => (
            <CategoryItem
              key={child.id}
              category={child as Category & { _count: { websites: number }; children?: (Category & { _count: { websites: number } })[] }}
              level={level + 1}
              expandedCategories={expandedCategories}
              onToggleExpanded={onToggleExpanded}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}