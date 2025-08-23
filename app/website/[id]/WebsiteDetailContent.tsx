'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Calendar, ChevronRight, ExternalLink, Globe, Home, Plus, Star, Tag as TagIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Category } from '@/types';
import Link from 'next/link';
import WebsiteVisitsChart from '@/components/WebsiteVisitsChart';

interface Website {
  id: number;
  name: string | null;
  url: string;
  iconUrl: string | null;
  description: string | null;
  order: number;
  isRecommended: boolean;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  category: {
    id: number;
    name: string;
    iconUrl: string | null;
  };
}

interface Tag {
  id: number;
  name: string;
  color: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface WebsiteDetailContentProps {
  categories: Category[];
  onWebsiteUpdate: (website: Website) => void;
  loading: boolean;
}

export function WebsiteDetailContent({ categories, onWebsiteUpdate, loading: externalLoading }: WebsiteDetailContentProps) {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [website, setWebsite] = useState<Website | null>(null);
  const [websiteBasicInfo, setWebsiteBasicInfo] = useState<{ categoryId: number; name: string | null } | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddTag, setShowAddTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6');
  const [newTagDescription, setNewTagDescription] = useState('');
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [showTagSelector, setShowTagSelector] = useState(false);
  
  const websiteId = params?.id as string;
  const fromCategory = searchParams?.get('from') === 'category';
  const categoryId = searchParams?.get('categoryId');

  useEffect(() => {
    if (!websiteId) return;

    const fetchWebsite = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/websites/${websiteId}`);
        if (!response.ok) {
          throw new Error('网站不存在');
        }
        const data = await response.json();
        setWebsite(data);
        setWebsiteBasicInfo({
          categoryId: data.categoryId,
          name: data.name
        });
        onWebsiteUpdate(data);
      } catch (error) {
        console.error('获取网站详情失败:', error);
        setError(error instanceof Error ? error.message : '获取网站详情失败');
      } finally {
        setLoading(false);
      }
    };

    const fetchTags = async () => {
      try {
        const response = await fetch(`/api/websites/${websiteId}/tags`);
        if (response.ok) {
          const data = await response.json();
          setTags(data);
        }
      } catch (error) {
        console.error('获取网站标签失败:', error);
      }
    };

    const fetchAvailableTags = async () => {
      try {
        const response = await fetch('/api/tags');
        if (response.ok) {
          const data = await response.json();
          setAvailableTags(data.data || []);
        }
      } catch (error) {
        console.error('获取可用标签失败:', error);
      }
    };

    fetchWebsite();
    fetchTags();
    fetchAvailableTags();
  }, [websiteId]);

  const handleBack = () => {
    if (fromCategory && categoryId) {
      router.push(`/category/${categoryId}`);
    } else {
      router.push('/');
    }
  };

  const handleVisitWebsite = async () => {
    if (website) {
      // 记录访问统计
      try {
        await fetch(`/api/websites/${websiteId}/visit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('记录访问统计失败:', error);
        // 不阻止用户访问网站
      }
      
      // 打开网站
      window.open(website.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    setIsCreatingTag(true);
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newTagName.trim(),
          color: newTagColor,
          description: newTagDescription.trim() || undefined,
        }),
      });

      if (response.ok) {
        const newTag = await response.json();
        setAvailableTags(prev => [...prev, newTag]);
        setNewTagName('');
        setNewTagColor('#3B82F6');
        setNewTagDescription('');
        setShowAddTag(false);
        
        // 自动添加新创建的标签到当前网站
        await handleAddTagToWebsite(newTag.id);
      } else {
        const errorData = await response.json();
        alert(errorData.error || '创建标签失败');
      }
    } catch (error) {
      console.error('创建标签失败:', error);
      alert('创建标签失败');
    } finally {
      setIsCreatingTag(false);
    }
  };

  const handleAddTagToWebsite = async (tagId: number) => {
    setIsAddingTag(true);
    try {
      const response = await fetch('/api/website-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          websiteId: parseInt(websiteId),
          tagId: tagId,
        }),
      });

      if (response.ok) {
        // 重新获取标签
        const tagsResponse = await fetch(`/api/websites/${websiteId}/tags`);
        if (tagsResponse.ok) {
          const data = await tagsResponse.json();
          setTags(data);
        }
        setShowTagSelector(false);
      } else {
        const errorData = await response.json();
        alert(errorData.error || '添加标签失败');
      }
    } catch (error) {
      console.error('添加标签失败:', error);
      alert('添加标签失败');
    } finally {
      setIsAddingTag(false);
    }
  };

  const handleRemoveTag = async (tagId: number) => {
    try {
      const response = await fetch(`/api/website-tags?websiteId=${websiteId}&tagId=${tagId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTags(prev => prev.filter(tag => tag.id !== tagId));
      } else {
        const errorData = await response.json();
        alert(errorData.error || '移除标签失败');
      }
    } catch (error) {
      console.error('移除标签失败:', error);
      alert('移除标签失败');
    }
  };

  const getAvailableTagsForAdd = () => {
    const currentTagIds = new Set(tags.map(tag => tag.id));
    return availableTags.filter(tag => !currentTagIds.has(tag.id));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 获取面包屑导航
  function getBreadcrumbs() {
    const fromCategory = searchParams?.get('from') === 'category';
    const categoryId = searchParams?.get('categoryId');
    const fromNavPage = searchParams?.get('fromNavPage');
    
    // 根据来源确定首页链接
    let homeLink = '/';
    let homeName = '首页';
    
    if (fromNavPage) {
      // 如果是从导航页进入的，首页链接指向对应的导航页
      homeLink = `/nav/${fromNavPage}`;
      homeName = '导航页';
    }
    
    const breadcrumbs = [{ name: homeName, href: homeLink }];
    
    // 优先从URL参数获取分类信息（如果是从分类页面跳转过来的）
    if (fromCategory && categoryId && Array.isArray(categories)) {
      // 找到当前分类
      const currentCategory = categories.find(cat => cat.id === parseInt(categoryId));
      if (currentCategory) {
        // 如果是子分类，先添加父分类
        if (currentCategory.parentId) {
          const parentCategory = categories.find(cat => cat.id === currentCategory.parentId);
          if (parentCategory) {
            breadcrumbs.push({
              name: parentCategory.name,
              href: `/category/${parentCategory.id}`
            });
          }
        }
        
        breadcrumbs.push({
          name: currentCategory.name,
          href: `/category/${currentCategory.id}`
        });
      }
    } 
    // 如果网站数据已加载，从网站的分类信息构建面包屑
    else if (website && Array.isArray(categories)) {
      const websiteCategory = categories.find(cat => cat.id === website.categoryId);
      if (websiteCategory) {
        // 如果是子分类，先添加父分类
        if (websiteCategory.parentId) {
          const parentCategory = categories.find(cat => cat.id === websiteCategory.parentId);
          if (parentCategory) {
            breadcrumbs.push({
              name: parentCategory.name,
              href: `/category/${parentCategory.id}`
            });
          }
        }
        
        breadcrumbs.push({
          name: websiteCategory.name,
          href: `/category/${websiteCategory.id}`
        });
      }
    }
    // 如果既没有URL参数也没有网站数据，但分类数据已加载，尝试从网站基本信息推断分类
    else if (websiteBasicInfo && Array.isArray(categories)) {
      const websiteCategory = categories.find(cat => cat.id === websiteBasicInfo.categoryId);
      if (websiteCategory) {
        // 如果是子分类，先添加父分类
        if (websiteCategory.parentId) {
          const parentCategory = categories.find(cat => cat.id === websiteCategory.parentId);
          if (parentCategory) {
            breadcrumbs.push({
              name: parentCategory.name,
              href: `/category/${parentCategory.id}`
            });
          }
        }
        
        breadcrumbs.push({
          name: websiteCategory.name,
          href: `/category/${websiteCategory.id}`
        });
      }
    }
    
    // 添加网站名称
    if (website) {
      breadcrumbs.push({
        name: website.name || '未命名网站',
        href: '#'
      });
    } else if (websiteBasicInfo) {
      breadcrumbs.push({
        name: websiteBasicInfo.name || '未命名网站',
        href: '#'
      });
    } else {
      // 如果网站数据还在加载中，显示占位符
      breadcrumbs.push({
        name: '加载中...',
        href: '#'
      });
    }
    
    return breadcrumbs;
  }

  return (
    <div className="px-6 py-4">
      {/* 面包屑导航 */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
        {getBreadcrumbs().map((crumb, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && <ChevronRight className="w-4 h-4 mx-2" />}
            {index === getBreadcrumbs().length - 1 ? (
              <span className="text-gray-900 dark:text-white font-medium">{crumb.name}</span>
            ) : (
              <Link 
                href={crumb.href} 
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {crumb.name}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {(externalLoading || loading) ? (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">加载中...</p>
          </div>
        </div>
      ) : (error || !website) ? (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">
              <Globe />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {error || '网站不存在'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              请检查网址是否正确，或返回首页浏览其他内容
            </p>
            <Button onClick={handleBack} className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
            <Button variant="outline" onClick={() => router.push('/')}>
              <Home className="w-4 h-4 mr-2" />
              回到首页
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* 网站详情卡片 */}
          <Card className="mb-6 bg-transparent border-transparent shadow-none">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              {website.iconUrl && (
                <img 
                  src={website.iconUrl} 
                  alt={website.name || '网站图标'}
                  className="w-16 h-16 rounded-lg object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/icons/default.png';
                  }}
                />
              )}
              <div>
                <CardTitle className="text-2xl mb-2">
                  {website.name || '未命名网站'}
                  {website.isRecommended && (
                    <Star className="inline-block w-5 h-5 text-yellow-500 ml-2" fill="currentColor" />
                  )}
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400">
                  {website.description || '暂无描述'}
                </p>
              </div>
            </div>
            <Button onClick={handleVisitWebsite} className="flex items-center space-x-2">
              <ExternalLink className="w-4 h-4" />
              <span>访问网站</span>
            </Button>
          </div>                                                  
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">网址:</span>
              <a 
                href={website.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline break-all"
              >
                {website.url}
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">添加时间:</span>
              <span>{formatDate(website.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 dark:text-gray-400">所属分类:</span>
              <Link 
                href={`/category/${website.category.id}`}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {website.category.name}
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">更新时间:</span>
              <span>{formatDate(website.updatedAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 标签管理 */}
      <Card className="bg-transparent border-transparent shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <TagIcon className="w-5 h-5" />
              <span>标签</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowTagSelector(!showTagSelector)}
                disabled={isAddingTag}
              >
                <Plus className="w-4 h-4 mr-1" />
                添加标签
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAddTag(!showAddTag)}
              >
                <Plus className="w-4 h-4 mr-1" />
                新建标签
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 当前标签 */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">当前标签:</h4>
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <div 
                    key={tag.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border group"
                    style={{
                      backgroundColor: tag.color ? `${tag.color}20` : '#f3f4f6',
                      borderColor: tag.color || '#d1d5db',
                      color: tag.color || '#374151'
                    }}
                  >
                    <span>{tag.name}</span>
                    <button
                      onClick={() => handleRemoveTag(tag.id)}
                      className="ml-2 text-gray-500 hover:text-red-500 transition-colors"
                      title="移除标签"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">暂无标签</p>
            )}
          </div>

          {/* 添加现有标签 */}
          {showTagSelector && (
            <div className="mb-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">选择标签:</h4>
              {getAvailableTagsForAdd().length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {getAvailableTagsForAdd().map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleAddTagToWebsite(tag.id)}
                      disabled={isAddingTag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border hover:bg-opacity-80 transition-colors disabled:opacity-50"
                      style={{
                        backgroundColor: tag.color ? `${tag.color}20` : '#f3f4f6',
                        borderColor: tag.color || '#d1d5db',
                        color: tag.color || '#374151'
                      }}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {tag.name}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">没有可添加的标签</p>
              )}
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowTagSelector(false)}
                >
                  取消
                </Button>
              </div>
            </div>
          )}

          {/* 创建新标签 */}
          {showAddTag && (
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">创建新标签:</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    标签名称 *
                  </label>
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="输入标签名称"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    标签颜色
                  </label>
                  <input
                    type="color"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    className="w-16 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    标签描述
                  </label>
                  <input
                    type="text"
                    value={newTagDescription}
                    onChange={(e) => setNewTagDescription(e.target.value)}
                    placeholder="输入标签描述（可选）"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    onClick={handleCreateTag}
                    disabled={!newTagName.trim() || isCreatingTag}
                    size="sm"
                  >
                    {isCreatingTag ? '创建中...' : '创建标签'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setShowAddTag(false);
                      setNewTagName('');
                      setNewTagColor('#3B82F6');
                      setNewTagDescription('');
                    }}
                  >
                    取消
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

          {/* 访问统计 */}
          <WebsiteVisitsChart websiteId={parseInt(websiteId)} days={30} />
        </>
      )}
    </div>
  );
}