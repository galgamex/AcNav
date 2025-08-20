'use client';

import { useState, useEffect } from 'react';
import { Website, Category, Tag } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import { WebsiteForm } from './WebsiteForm';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface WebsiteManagementProps {
  initialWebsites: (Website & { category: Category })[];
  categories: Category[];
}

export function WebsiteManagement({ initialWebsites, categories }: WebsiteManagementProps) {
  const [websites, setWebsites] = useState(initialWebsites);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<Website | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const router = useRouter();

  // 获取标签数据
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/tags');
        if (response.ok) {
          const data = await response.json();
          setTags(data);
        }
      } catch (error) {
        console.error('获取标签失败:', error);
      }
    };
    fetchTags();
  }, []);

  const handleCreate = () => {
    setEditingWebsite(null);
    setIsFormOpen(true);
  };

  const handleEdit = (website: Website) => {
    setEditingWebsite(website);
    setIsFormOpen(true);
  };

  const handleDelete = async (websiteId: number) => {
    if (!confirm('确定要删除这个网站吗？')) return;

    // 立即从UI中移除，提供即时反馈
    const originalWebsites = websites;
    setWebsites(prevWebsites => prevWebsites.filter(w => w.id !== websiteId));

    try {
      const response = await fetch(`/api/websites/${websiteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // 显示成功消息
        alert('网站删除成功');
      } else {
        // 如果删除失败，恢复原始状态
        setWebsites(originalWebsites);
        const error = await response.json();
        alert(error.error || '删除失败');
      }
    } catch (error) {
      // 如果网络错误，恢复原始状态
      setWebsites(originalWebsites);
      console.error('删除网站失败:', error);
      alert('删除失败，请检查网络连接');
    }
  };

  const handleFormSuccess = (updatedWebsite?: Website & { category: Category }) => {
    setIsFormOpen(false);
    
    if (editingWebsite && updatedWebsite) {
      // 编辑模式：更新本地状态
      setWebsites(prevWebsites => 
        prevWebsites.map(w => w.id === updatedWebsite.id ? updatedWebsite : w)
      );
    } else {
      // 新增模式：刷新页面获取最新数据
      router.refresh();
    }
    
    setEditingWebsite(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">网站列表</h2>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          添加网站
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  网站
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  分类
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  描述
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  排序
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {websites.map((website) => (
                <tr key={website.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Image
                        src={website.iconUrl || '/icons/default.svg'}
                        alt={website.name || '网站'}
                        width={24}
                        height={24}
                        className="mr-3 flex-shrink-0"
                      />
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {website.name || '未命名网站'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {website.category.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                      {website.url}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                      {website.description ? (
                        <span className="line-clamp-2">{website.description}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {website.order}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {website.isRecommended && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        ⭐ 推荐
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.location.href = website.url}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(website)}
                        className="text-gray-600 hover:text-gray-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete(website.id);
                        }}
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

      {websites.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border">
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              暂无网站，点击上方按钮添加第一个网站
            </p>
          </div>
        </div>
      )}

      <WebsiteForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        website={editingWebsite}
        categories={categories}
        tags={tags}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}