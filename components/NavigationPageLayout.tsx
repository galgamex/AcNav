'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { NavigationSidebar } from '@/components/NavigationSidebar';
import { NavigationMobileDrawer } from '@/components/NavigationMobileDrawer';
import { SearchBar } from '@/components/SearchBar';
import { NavigationRecommendedSection } from '@/components/NavigationRecommendedSection';
import { CategorySection } from '@/components/CategorySection';

interface Category {
  id: number;
  name: string;
  icon?: string;
  order: number;
}

interface NavigationPageData {
  id: number;
  name: string;
  slug: string;
  title: string;
  description?: string;
  keywords?: string;
  isActive: boolean;
}

interface NavigationPageLayoutProps {
  navigationPage: NavigationPageData;
  sidebarCategories: Category[];
  headerCategories: Category[];
}

interface Website {
  id: number;
  name: string;
  url: string;
  iconUrl?: string;
  description?: string;
  order: number;
  isRecommended: boolean;
  categoryId: number;
  websiteTags: Array<{
    tag: {
      id: number;
      name: string;
      color?: string;
    };
  }>;
}

export function NavigationPageLayout({
  navigationPage,
  sidebarCategories,
  headerCategories,
}: NavigationPageLayoutProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendedWebsites, setRecommendedWebsites] = useState<Website[]>([]);
  const [allCategoriesData, setAllCategoriesData] = useState<any[]>([]);
  const [activeSubCategoryId, setActiveSubCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // 获取推荐网站和完整分类数据
  useEffect(() => {
    if (sidebarCategories && sidebarCategories.length > 0) {
      fetchRecommendedWebsites();
      fetchAllCategoriesData();
    }
  }, [sidebarCategories]);

  const fetchRecommendedWebsites = async () => {
    try {
      // 获取所有推荐网站
      const response = await fetch('/api/recommended');
      if (response.ok) {
        const data = await response.json();
        const allRecommendedWebsites = data.websites || [];
        
        // 获取当前导航页侧边栏配置的分类ID列表
        const sidebarCategoryIds = sidebarCategories.map(cat => cat.id);
        
        // 筛选出属于侧边栏分类的推荐网站
        const filteredRecommendedWebsites = allRecommendedWebsites.filter((website: any) => 
          sidebarCategoryIds.includes(website.categoryId)
        );
        
        setRecommendedWebsites(filteredRecommendedWebsites);
      }
    } catch (error) {
      console.error('获取推荐网站失败:', error);
    }
  };

  const fetchAllCategoriesData = async () => {
    try {
      setLoading(true);
      
      // 获取完整的分类数据（包含网站）
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        // API返回包含categories和hierarchical字段的对象
        const allCategories = data.categories || [];
        
        // 构建分类映射
        const categoryMap = new Map();
        allCategories.forEach((cat: any) => {
          categoryMap.set(cat.id, { ...cat, children: [] });
        });
        
        // 构建层级结构
        const rootCategories: any[] = [];
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
        
        // 过滤出在侧边栏配置中选中的分类（参考MainContent的逻辑）
        const sidebarCategoryIds = sidebarCategories.map(cat => cat.id);
        const filteredCategories = rootCategories.filter(category => 
          sidebarCategoryIds.includes(category.id) || 
          (category.children && category.children.some((child: any) => sidebarCategoryIds.includes(child.id)))
        );
        
        setAllCategoriesData(filteredCategories);
      }
    } catch (error) {
      console.error('获取分类数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理子分类激活
  const handleSubCategoryActivate = (subCategoryId: number) => {
    setActiveSubCategoryId(subCategoryId);
  };

  // 监听侧边栏分类点击事件（参考MainContent的实现）
  useEffect(() => {
    const handleSidebarCategoryClick = (event: CustomEvent) => {
      const { categoryId, isSubCategory } = event.detail;
      if (isSubCategory) {
        setActiveSubCategoryId(categoryId);
        // 滚动到对应的父分类
        const parentCategory = allCategoriesData.find(cat => 
          cat.children && cat.children.some((child: any) => child.id === categoryId)
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
  }, [allCategoriesData]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // 这里可以实现搜索逻辑
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        onToggleSidebar={toggleSidebar}
        onToggleMobileDrawer={() => setIsMobileDrawerOpen(true)}
        isSidebarCollapsed={isSidebarCollapsed}
      />
      
      <div className="flex">
        {/* 桌面端侧边栏 */}
        <div className="hidden md:block">
          <NavigationSidebar 
            isCollapsed={isSidebarCollapsed}
            sidebarCategories={sidebarCategories}
          />
        </div>
        
        {/* 主内容区域 */}
        <main className={`flex-1 ml-0 pt-12 md:pt-16 transition-all duration-300 ${
          isSidebarCollapsed ? 'md:ml-16' : 'md:ml-56'
        }`}>
          <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="mx-auto" style={{maxWidth: '1900px'}}>
              <div className="space-y-8">
                <SearchBar />
                
                {loading ? (
                  <div className="text-center py-20">
                    <div className="text-gray-500 dark:text-gray-400">
                      <p className="text-lg">加载中...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* 推荐区域 */}
                    {sidebarCategories.length > 0 && recommendedWebsites.length > 0 && (
                      <NavigationRecommendedSection websites={recommendedWebsites} />
                    )}
                    
                    {/* 分类区块显示 */}
                    <div className="space-y-12">
                      {allCategoriesData.length > 0 ? (
                        allCategoriesData.map((category) => (
                          <div key={category.id} id={`category-${category.id}`} className="scroll-mt-20">
                            <CategorySection 
                              category={category} 
                              activeSubCategoryId={activeSubCategoryId || undefined}
                              onTabChange={handleSubCategoryActivate}
                            />
                          </div>
                        ))
                      ) : (
                        !loading && (
                          <div className="text-center py-20">
                            <div className="text-gray-500 dark:text-gray-400">
                              <h2 className="text-2xl font-semibold mb-2">暂无分类配置</h2>
                              <p className="text-lg">请在后台为此导航页配置分类</p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      
      <NavigationMobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        sidebarCategories={sidebarCategories}
      />
    </div>
  );
}