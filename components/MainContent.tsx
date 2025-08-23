'use client';

import { useState, useEffect } from 'react';
import { SearchBar } from './SearchBar';
import { CategorySection } from './CategorySection';
import { RecommendedSection } from './RecommendedSection';
import { Website, Category } from '@/types';

interface MainContentProps {
  showHeader?: boolean;
}

export function MainContent({ showHeader = false }: MainContentProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<Website[]>([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [activeSubCategoryId, setActiveSubCategoryId] = useState<number | null>(null);
  const [showRecommended, setShowRecommended] = useState(false);

  // 获取分类和网站数据
  useEffect(() => {
    const fetchCategoriesAndWebsites = async () => {
      try {
        setLoading(true);
        
        // 并行获取主页设置和分类数据以提升性能
        const [homeResponse, categoriesResponse] = await Promise.all([
          fetch('/api/home-settings'),
          fetch('/api/categories')
        ]);

        if (!homeResponse.ok) {
          throw new Error('Failed to fetch home settings');
        }
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories');
        }

        const [homeData, categoriesData] = await Promise.all([
          homeResponse.json(),
          categoriesResponse.json()
        ]);

        const selectedCategoryIds = homeData.homeSettings?.sidebarCategories?.map((sc: any) => sc.categoryId) || [];
        setShowRecommended(homeData.homeSettings?.showRecommended || false);
        // API直接返回分类数组
        const allCategories = Array.isArray(categoriesData) ? categoriesData : (categoriesData.categories || []);
        
        // 构建分类映射
        const categoryMap = new Map();
        allCategories.forEach((cat: any) => {
          categoryMap.set(cat.id, { ...cat, children: [] });
        });
        
        // 构建层级结构
        const rootCategories: Category[] = [];
        allCategories.forEach((cat: any) => {
          if (cat.parentId) {
            const parent = categoryMap.get(cat.parentId);
            if (parent) {
              parent.children.push(categoryMap.get(cat.id));
            }
          } else {
            rootCategories.push(categoryMap.get(cat.id));
          }
        });
        
        // 过滤出在主页设置中选中的分类
        const filteredCategories = rootCategories.filter(category => 
          selectedCategoryIds.includes(category.id) || 
          (category.children && category.children.some((child: Category) => selectedCategoryIds.includes(child.id)))
        );
        
        setCategories(filteredCategories);
      } catch (error) {
        console.error('Error fetching categories and websites:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesAndWebsites();
  }, []);

  // 处理搜索结果
  const handleSearchResults = (results: Website[]) => {
    setSearchResults(results);
    // 只有当有搜索结果或者正在搜索时才进入搜索模式
    setIsSearchMode(results.length > 0);
  };

  // 当搜索框清空时，退出搜索模式
  const handleSearchClear = () => {
    setSearchResults([]);
    setIsSearchMode(false);
  };

  // 处理子分类激活
  const handleSubCategoryActivate = (subCategoryId: number) => {
    setActiveSubCategoryId(subCategoryId);
  };

  // 监听侧边栏分类点击事件
  useEffect(() => {
    const handleSidebarCategoryClick = (event: CustomEvent) => {
      const { categoryId, isSubCategory } = event.detail;
      if (isSubCategory) {
        setActiveSubCategoryId(categoryId);
        // 滚动到对应的父分类
        const parentCategory = categories.find(cat => 
          cat.children && cat.children.some(child => child.id === categoryId)
        );
        if (parentCategory) {
          const categoryElement = document.getElementById(`category-${parentCategory.id}`);
          if (categoryElement) {
            categoryElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      } else {
        setActiveSubCategoryId(null);
      }
    };

    window.addEventListener('sidebarCategoryClick', handleSidebarCategoryClick as EventListener);
    return () => {
      window.removeEventListener('sidebarCategoryClick', handleSidebarCategoryClick as EventListener);
    };
  }, [categories]);



  return (
    <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mx-auto" style={{maxWidth: '1900px'}}>
        {/* 搜索栏 */}
        <div className="mb-8">
          <SearchBar onSearchResults={handleSearchResults} onClear={handleSearchClear} />
        </div>
        
        {/* 主要内容区域 */}
        {loading ? (
          <div className="text-center py-20">
            <div className="text-gray-500 dark:text-gray-400">
              <p className="text-lg">加载中...</p>
            </div>
          </div>
        ) : isSearchMode ? (
          // 搜索功能已禁用
          <div className="text-center py-12">
            <p className="text-gray-500">搜索功能已禁用，当前仅显示分类</p>
          </div>
        ) : (
          // 主要内容显示
          <div className="space-y-12">
            {/* 推荐专区 */}
            {showRecommended && (
              <RecommendedSection className="mb-12" />
            )}
            
            {/* 分类区块显示 */}
            {categories.length > 0 ? (
              categories.map((category) => {
                return (
                  <div key={category.id} id={`category-${category.id}`} className="scroll-mt-20">
                    <CategorySection 
                      category={category} 
                      activeSubCategoryId={activeSubCategoryId || undefined}
                      onTabChange={handleSubCategoryActivate}
                    />
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20">
                <div className="text-gray-500 dark:text-gray-400">
                  <h2 className="text-2xl font-semibold mb-2">暂无分类配置</h2>
                  <p className="text-lg">请在后台添加分类</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}