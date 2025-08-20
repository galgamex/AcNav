'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { TagForm } from './TagForm';
import type { Tag as PrismaTag } from '@prisma/client';

interface TagWithCount extends PrismaTag {
  _count: {
    websiteTags: number;
  };
}

interface TagManagementProps {
  initialTags: TagWithCount[];
}

export function TagManagement({ initialTags }: TagManagementProps) {
  const [tags, setTags] = useState(initialTags);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<PrismaTag | null>(null);
  const router = useRouter();

  const handleCreate = () => {
    setEditingTag(null);
    setIsFormOpen(true);
  };

  const handleEdit = (tag: PrismaTag) => {
    setEditingTag(tag);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个标签吗？删除后将从所有网站中移除此标签。')) {
      return;
    }

    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTags(tags.filter(tag => tag.id !== id));
      } else {
        alert('删除失败');
      }
    } catch (error) {
      console.error('删除标签失败:', error);
      alert('删除失败');
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingTag(null);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">标签列表</h2>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          添加标签
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  标签
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  描述
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  关联网站
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  创建时间
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {tags.map((tag) => (
                <tr key={tag.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Tag className="h-5 w-5 mr-3 flex-shrink-0" style={{ color: tag.color || '#666' }} />
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {tag.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                      {tag.description ? (
                        <span className="line-clamp-2">{tag.description}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {tag._count.websiteTags} 个
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(tag.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(tag)}
                        className="text-gray-600 hover:text-gray-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(tag.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {tags.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border">
          <div className="text-center py-8">
            <Tag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              暂无标签，点击上方按钮添加第一个标签
            </p>
          </div>
        </div>
      )}

      <TagForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        tag={editingTag}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}