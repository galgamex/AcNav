'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { CategoryIcon } from '@/components/CategoryIcon';
import { WebsiteCard } from '@/components/WebsiteCard';
import { Button } from '@/components/ui/button';
import { GlobalLayout } from '@/components/GlobalLayout';
import { ArrowLeft, Globe, ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';

interface Website {
  id: number;
  name: string;
  url: string;
  iconUrl?: string;
  description?: string;
  order: number;
  isRecommended: boolean;
  categoryId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface SubCategory {
  id: number;
  name: string;
  icon?: string;
  iconUrl?: string;
  order: number;
  websites: Website[];
  _count: {
    websites: number;
  };
}

interface CategoryDetail {
  id: number;
  name: string;
  icon?: string;
  iconUrl?: string;
  order: number;
  websites: Website[];
  children: SubCategory[];
  _count: {
    websites: number;
  };
}

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [category, setCategory] = useState<CategoryDetail | null>(null);
  const [activeSubCategory, setActiveSubCategory] = useState<number | null>(null);

  // 处理子分类切换
  const handleSubCategoryChange = (subCategoryId: number | null) => {
    setActiveSubCategory(subCategoryId);
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categoryId = parseInt(params.id as string);

  const fetchCategoryDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/categories/${categoryId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && errorData.parentId) {
          // 子分类重定向到父分类
          router.replace(`/category/${errorData.parentId}`);
          return;
        }
        throw new Error(errorData.error || '获取分类详情失败');
      }

      const data = await response.json();
      setCategory(data);
      
      // 如果有子分类，默认选中第一个子分类
      if (data.children && data.children.length > 0) {
        setActiveSubCategory(data.children[0].id);
      }
    } catch (error) {
      console.error('获取分类详情失败:', error);
      setError(error instanceof Error ? error.message : '获取分类详情失败');
    } finally {
      setLoading(false);
    }
  }, [categoryId, router]);

  useEffect(() => {
    if (isNaN(categoryId)) {
      setError('无效的分类ID');
      setLoading(false);
      return;
    }

    fetchCategoryDetail();
  }, [categoryId, fetchCategoryDetail]);

  const getCurrentWebsites = (): Website[] => {
    if (!category) return [];
    
    if (activeSubCategory) {
      const subCategory = category.children.find(child => child.id === activeSubCategory);
      return subCategory?.websites || [];
    }
    
    return category.websites;
  };

  const getCurrentCategoryName = (): string => {
    if (!category) return '';
    
    if (activeSubCategory) {
      const subCategory = category.children.find(child => child.id === activeSubCategory);
      return subCategory?.name || '';
    }
    
    return category.name;
  };

  // 获取热门网站名称
  function getPopularWebsiteNames(): string[] {
    const websites = getCurrentWebsites();
    // 获取前5个网站的名称，如果没有5个就返回所有
    return websites.slice(0, 5).map(website => website.name).filter(Boolean);
  }

  // 获取面包屑导航
  function getBreadcrumbs() {
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
    
    // 添加分类信息
    if (category) {
      // 如果是子分类，先添加父分类
      if (activeSubCategory) {
        breadcrumbs.push({
          name: category.name,
          href: `/category/${category.id}`
        });
        
        const subCategory = category.children.find(child => child.id === activeSubCategory);
        if (subCategory) {
          breadcrumbs.push({
            name: subCategory.name,
            href: '#'
          });
        }
      } else {
        breadcrumbs.push({
          name: category.name,
          href: '#'
        });
      }
    }
    
    return breadcrumbs;
  }





  return (
    <GlobalLayout 
      sidebarMode="category"
      sidebarProps={{
        category,
        activeSubCategory,
        onSubCategoryChange: handleSubCategoryChange
      }}
    >
      <div className=" mx-auto px-6 py-6">
        {loading ? (
          <div className="animate-pulse">
            {/* 面包屑骨架 */}
            <div className="flex items-center space-x-2 mb-6">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
            
            {/* 标题骨架 */}
            <div className="text-center mb-8">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto"></div>
            </div>
            
            {/* Tab骨架 */}
            <div className="flex space-x-8 mb-8 border-b border-gray-200 dark:border-gray-700">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
            
            {/* 网站卡片骨架 */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="text-red-500 text-xl mb-4">{error}</div>
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
              </Button>
            </div>
          </div>
        ) : !category ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Globe className="w-16 h-16 mx-auto mb-4" />
              <div className="text-xl">分类不存在</div>
            </div>
          </div>
        ) : (
          <>
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

            {/* 分类标题 */}
            <div className="text-center mb-8">
              <div className="mb-4">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  {getCurrentCategoryName()}
                </h1>
              </div>
              
              {/* 分类描述 */}
              <div className="text-gray-600 dark:text-gray-400 text-lg max-w-4xl mx-auto">
                <p>
                  {getCurrentCategoryName()}收录 {getCurrentWebsites().length} 款{getCurrentCategoryName()}网站
                  {getPopularWebsiteNames().length > 0 && (
                    <>
                      ，热门的网站有：
                      <span className="font-medium text-gray-900 dark:text-white">
                        {getPopularWebsiteNames().join('、')}
                      </span>
                    </>
                  )}
                  ，会持续更新
                </p>
              </div>
            </div>

            {/* Tab选项卡 - 仅在有子分类时显示，手机端支持左右拖动 */}
            {category.children && category.children.length > 0 && (
              <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
                <nav className="overflow-x-auto scrollbar-hide">
                  <div className="flex space-x-8 min-w-max">
                    <button
                      onClick={() => setActiveSubCategory(null)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                        activeSubCategory === null
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      {category.name} ({category._count.websites})
                    </button>
                    {category.children.map((subCategory) => (
                      <button
                        key={subCategory.id}
                        onClick={() => setActiveSubCategory(subCategory.id)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                          activeSubCategory === subCategory.id
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        {subCategory.name} ({subCategory._count.websites})
                      </button>
                    ))}
                  </div>
                </nav>
              </div>
            )}

            {/* 网站列表 */}
            {getCurrentWebsites().length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {getCurrentWebsites()
                  .filter(website => {
                    // 如果没有选择子分类，显示当前分类的所有网站
                    if (activeSubCategory === null) {
                      return website.categoryId === category.id;
                    }
                    // 如果选择了子分类，只显示该子分类的网站
                    return website.categoryId === activeSubCategory;
                  })
                  .map((website) => (
                  <WebsiteCard key={website.id} website={website} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Globe className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  暂无网站
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {activeSubCategory === null 
                    ? `${category.name} 分类下还没有收录任何网站`
                    : `该子分类下还没有收录任何网站`
                  }
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </GlobalLayout>
  );
}