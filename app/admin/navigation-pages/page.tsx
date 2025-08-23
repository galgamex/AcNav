'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { NavigationPageForm } from '@/components/admin/NavigationPageForm';
import { cn } from '@/lib/utils';

interface NavigationPage {
  id: number;
  name: string;
  slug: string;
  title: string;
  description?: string;
  keywords?: string;
  isActive: boolean;
  sidebarCategories?: string;
  headerCategories?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function PageSettingsPage() {
  const { admin, loading: authLoading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'home' | 'navigation'>('home');
  const [navigationPages, setNavigationPages] = useState<NavigationPage[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<NavigationPage | null>(null);
  const [categories, setCategories] = useState<Array<{ 
    id: number; 
    name: string; 
    parentId?: number;
    children?: Array<{ id: number; name: string; parentId?: number; }>;
  }>>([]);
  
  // 主页设置状态
  const [homeSettings, setHomeSettings] = useState({
    title: '',
    description: '',
    keywords: '',
    welcomeMessage: '',
    showRecommended: true,
    sidebarCategories: [] as Array<{
      id: string;
      name: string;
      categoryId?: number;
      isCustom: boolean;
    }>,
    customLinks: [] as Array<{
      id: string;
      name: string;
      url: string;
      description?: string;
    }>,

  });
  
  // 分类折叠状态
  const [collapsedCategories, setCollapsedCategories] = useState<Set<number>>(new Set());

  const fetchNavigationPages = useCallback(async (page = 1, search = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      const response = await fetch(`/api/navigation-pages?${params}`);
      if (response.ok) {
        const data = await response.json();
        setNavigationPages(data.navigationPages);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('获取导航页失败:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        console.log('分类数据:', data); // 添加调试日志
        
        // 使用API返回的分类数据
        const categoriesData = data.hierarchical || data.categories || data || [];
        console.log('处理后的分类数据:', categoriesData);
        setCategories(categoriesData);
        
        // 初始化时默认折叠所有有子分类的分类
        const initCollapsed = new Set<number>();
        categoriesData.forEach((category: any) => {
          if (category.children && category.children.length > 0) {
            initCollapsed.add(category.id);
          }
        });
        setCollapsedCategories(initCollapsed);
      } else {
        console.error('获取分类失败，状态码:', response.status);
      }
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  }, []);

  const addSidebarCategory = (categoryId?: number, customName?: string) => {
    const newCategory = {
      id: Date.now().toString(),
      name: customName || categories.find(c => c.id === categoryId)?.name || '',
      categoryId,
      isCustom: !categoryId,
    };
    setHomeSettings(prev => ({
      ...prev,
      sidebarCategories: [...prev.sidebarCategories, newCategory]
    }));
  };

  const removeSidebarCategory = (id: string) => {
    setHomeSettings(prev => ({
      ...prev,
      sidebarCategories: prev.sidebarCategories.filter(cat => cat.id !== id)
    }));
  };

  const addCustomLink = () => {
    const newLink = {
      id: Date.now().toString(),
      name: '',
      url: '',
      description: '',
    };
    setHomeSettings(prev => ({
      ...prev,
      customLinks: [...prev.customLinks, newLink]
    }));
  };

  const updateCustomLink = (id: string, field: string, value: string) => {
    setHomeSettings(prev => ({
      ...prev,
      customLinks: prev.customLinks.map(link => 
        link.id === id ? { ...link, [field]: value } : link
      )
    }));
  };

  const removeCustomLink = (id: string) => {
    setHomeSettings(prev => ({
      ...prev,
      customLinks: prev.customLinks.filter(link => link.id !== id)
    }));
  };



  useEffect(() => {
    fetchNavigationPages();
    fetchCategories();
  }, [searchTerm, fetchNavigationPages, fetchCategories]);

  useEffect(() => {
    // 初始加载时获取主页设置
    fetchHomeSettings();
  }, []);

  const handleSearch = () => {
    fetchNavigationPages(1, searchTerm);
  };

  const handlePageChange = (newPage: number) => {
    fetchNavigationPages(newPage, searchTerm);
  };

  const handleEdit = (page: NavigationPage) => {
    setEditingPage(page);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个导航页吗？')) return;

    try {
      const response = await fetch(`/api/navigation-pages/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchNavigationPages(pagination.page, searchTerm);
      } else {
        alert('删除失败');
      }
    } catch (error) {
      console.error('删除导航页失败:', error);
      alert('删除失败');
    }
  };

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    setEditingPage(null);
    fetchNavigationPages(pagination.page, searchTerm);
  };

  const handleCreateNew = () => {
    setEditingPage(null);
    setIsDialogOpen(true);
  };

  const tabs = [
    { id: 'home', label: '主页设置' },
    { id: 'navigation', label: '子导航页设置' },
  ];

  const handleSaveHomeSettings = async () => {
    try {
      const response = await fetch('/api/admin/home-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ homeSettings }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || '主页设置保存成功');
      } else {
        throw new Error('保存失败');
      }
    } catch (error) {
      console.error('保存主页设置失败:', error);
      alert('保存失败');
    }
  };

  const fetchHomeSettings = async () => {
    try {
      const response = await fetch('/api/admin/home-settings');
      if (response.ok) {
        const data = await response.json();
        setHomeSettings(data.homeSettings);
      }
    } catch (error) {
      console.error('获取主页设置失败:', error);
    }
  };

  // 认证检查
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">正在验证身份...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600 mb-4">请先登录管理员账户</p>
          <Button onClick={() => window.location.href = '/admin/login'}>
            前往登录
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      

      {/* Tab 选项卡 */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'home' | 'navigation')}
              className={cn(
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab 内容 */}
      {activeTab === 'home' && (
        <div className="space-y-6">
         

          {/* 侧边栏分类设置 */}
          <Card>
            <CardHeader>
              <CardTitle>侧边栏分类设置</CardTitle>
              <p className="text-sm text-gray-600">选择要在侧边栏显示的分类，支持父子分类层级结构</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium mb-2">选择分类</label>
                {/* 调试信息 */}
                <div className="text-xs text-gray-500 mb-2">
                  分类数量: {categories.length} | 认证状态: {isAuthenticated ? '已认证' : '未认证'}
                </div>
                <div className="max-h-96 overflow-y-auto scrollbar-hide border rounded p-3 space-y-2">
                  {categories.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      暂无分类数据，请检查数据库连接或刷新页面
                    </div>
                  ) : (
                    categories.map((category) => {
                    const isCollapsed = collapsedCategories.has(category.id);
                    const hasChildren = category.children && category.children.length > 0;
                    
                    return (
                      <div key={category.id}>
                        {/* 父分类 */}
                        <div className="flex items-center space-x-2">
                          {hasChildren && (
                            <button
                              onClick={() => {
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
                          <input
                            type="checkbox"
                            id={`category-${category.id}`}
                            checked={homeSettings.sidebarCategories.some(selected => selected.categoryId === category.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                addSidebarCategory(category.id);
                              } else {
                                const selectedCategory = homeSettings.sidebarCategories.find(selected => selected.categoryId === category.id);
                                if (selectedCategory) {
                                  removeSidebarCategory(selectedCategory.id);
                                }
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <label htmlFor={`category-${category.id}`} className="text-sm font-medium cursor-pointer">
                            {category.name}
                          </label>
                          <span className="text-xs text-gray-500">({category.children?.length || 0} 个子分类)</span>
                        </div>
                        
                        {/* 子分类 */}
                         {hasChildren && !isCollapsed && (
                           <div className="ml-6 mt-2 space-y-1">
                             {category.children?.map((child: any) => (
                              <div key={child.id} className="flex items-center space-x-2">
                                <div className="w-4" />
                                <input
                                  type="checkbox"
                                  id={`category-${child.id}`}
                                  checked={homeSettings.sidebarCategories.some(selected => selected.categoryId === child.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      addSidebarCategory(child.id);
                                    } else {
                                      const selectedCategory = homeSettings.sidebarCategories.find(selected => selected.categoryId === child.id);
                                      if (selectedCategory) {
                                        removeSidebarCategory(selectedCategory.id);
                                      }
                                    }
                                  }}
                                  className="rounded border-gray-300"
                                />
                                <label htmlFor={`category-${child.id}`} className="text-sm cursor-pointer text-gray-700">
                                  └ {child.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }))
                  }
                </div>
              </div>
              
              {/* 已选择的分类预览 */}
              {homeSettings.sidebarCategories.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium mb-2">已选择的分类 ({homeSettings.sidebarCategories.length})</label>
                  <div className="flex flex-wrap gap-2">
                    {homeSettings.sidebarCategories.map((category) => (
                      <div key={category.id} className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        <span>{category.name} {category.isCustom && '(自定义)'}</span>
                        <button
                          onClick={() => removeSidebarCategory(category.id)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium mb-2">添加自定义分类</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="输入自定义分类名称"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        if (input.value.trim()) {
                          addSidebarCategory(undefined, input.value.trim());
                          input.value = '';
                        }
                      }
                    }}
                  />
                  <Button
                    onClick={(e) => {
                      const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                      if (input.value.trim()) {
                        addSidebarCategory(undefined, input.value.trim());
                        input.value = '';
                      }
                    }}
                  >
                    添加
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

           <Card>
            <CardHeader>
              <CardTitle>主页SEO设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">页面标题</label>
                <Input
                  value={homeSettings.title}
                  onChange={(e) => setHomeSettings(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="输入主页标题"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">页面描述</label>
                <Input
                  value={homeSettings.description}
                  onChange={(e) => setHomeSettings(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="输入主页描述"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">关键词</label>
                <Input
                  value={homeSettings.keywords}
                  onChange={(e) => setHomeSettings(prev => ({ ...prev, keywords: e.target.value }))}
                  placeholder="输入关键词，用逗号分隔"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">欢迎信息</label>
                <Input
                  value={homeSettings.welcomeMessage}
                  onChange={(e) => setHomeSettings(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                  placeholder="输入主页欢迎信息"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showRecommended"
                  checked={homeSettings.showRecommended}
                  onChange={(e) => setHomeSettings(prev => ({ ...prev, showRecommended: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="showRecommended" className="text-sm font-medium">
                  显示推荐网站区域
                </label>
              </div>
              <Button onClick={handleSaveHomeSettings} className="w-full">
                保存主页设置
              </Button>
            </CardContent>
          </Card>

          {/* 自定义链接设置 */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>自定义链接设置</CardTitle>
                <Button onClick={addCustomLink} size="sm">
                  添加链接
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {homeSettings.customLinks.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  暂无自定义链接
                </div>
              ) : (
                homeSettings.customLinks.map((link) => (
                  <div key={link.id} className="p-4 border rounded space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">链接名称</label>
                          <Input
                            value={link.name}
                            onChange={(e) => updateCustomLink(link.id, 'name', e.target.value)}
                            placeholder="输入链接名称"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">链接地址</label>
                          <Input
                            value={link.url}
                            onChange={(e) => updateCustomLink(link.id, 'url', e.target.value)}
                            placeholder="输入链接地址"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">描述（可选）</label>
                          <Input
                            value={link.description || ''}
                            onChange={(e) => updateCustomLink(link.id, 'description', e.target.value)}
                            placeholder="输入链接描述"
                          />
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeCustomLink(link.id)}
                        className="ml-4"
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'navigation' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">子导航页管理</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleCreateNew}>新建导航页</Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingPage ? '编辑导航页' : '新建导航页'}
                  </DialogTitle>
                </DialogHeader>
                <NavigationPageForm
                  navigationPage={editingPage}
                  onSuccess={handleFormSuccess}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex gap-4">
            <Input
              placeholder="搜索导航页..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={handleSearch}>搜索</Button>
          </div>

          {loading ? (
            <div className="text-center py-8">加载中...</div>
          ) : (
            <div className="space-y-4">
              {navigationPages.map((page) => (
                <Card key={page.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {page.name}
                          <Badge variant={page.isActive ? 'default' : 'secondary'}>
                            {page.isActive ? '启用' : '禁用'}
                          </Badge>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          路径: /{page.slug}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(page)}
                        >
                          编辑
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(page.id)}
                        >
                          删除
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">SEO标题:</span> {page.title}
                      </div>
                      {page.description && (
                        <div>
                          <span className="font-medium">SEO描述:</span> {page.description}
                        </div>
                      )}
                      {page.keywords && (
                        <div>
                          <span className="font-medium">关键词:</span> {page.keywords}
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground">
                        创建时间: {new Date(page.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {navigationPages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  暂无导航页
                </div>
              )}

              {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    disabled={pagination.page <= 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    上一页
                  </Button>
                  <span className="flex items-center px-4">
                    第 {pagination.page} 页，共 {pagination.totalPages} 页
                  </span>
                  <Button
                    variant="outline"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    下一页
                  </Button>
                </div>
              )}
            </div>
          )})
        </div>
      )}


    </div>
  );
}