'use client';

import { useEffect, useState } from 'react';
import { Home, ChevronRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { CategoryIcon } from './CategoryIcon';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SidebarCategory {
  id: string;
  name: string;
  categoryId?: number;
  isCustom: boolean;
  parentId?: number;
  children?: SidebarCategory[];
  icon?: string | null;
  iconUrl?: string | null;
}

interface CustomLink {
  id: string;
  name: string;
  url: string;
  description?: string;
}

interface HomeSettings {
  sidebarCategories: SidebarCategory[];
  customLinks: CustomLink[];
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const [homeSettings, setHomeSettings] = useState<HomeSettings>({
    sidebarCategories: [],
    customLinks: []
  });
  const [loading, setLoading] = useState(true);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<number>>(new Set());

  // 构建层级分类结构
  function buildHierarchicalSidebarCategories(categories: any[], selectedCategoryIds: number[]): SidebarCategory[] {
    const categoryMap = new Map<number, SidebarCategory>();
    const rootCategories: SidebarCategory[] = [];
    
    // 只处理选中的分类
    const selectedCategories = categories.filter(cat => selectedCategoryIds.includes(cat.id));
    
    // 创建分类映射
    selectedCategories.forEach(cat => {
      categoryMap.set(cat.id, {
        id: cat.id.toString(),
        name: cat.name,
        categoryId: cat.id,
        isCustom: false,
        parentId: cat.parentId,
        children: [],
        icon: cat.icon,
        iconUrl: cat.iconUrl
      });
    });
    
    // 构建层级结构
    selectedCategories.forEach(cat => {
      const category = categoryMap.get(cat.id)!;
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        const parent = categoryMap.get(cat.parentId)!;
        parent.children!.push(category);
      } else {
        rootCategories.push(category);
      }
    });
    
    return rootCategories;
  }

  // 获取主页设置
  const fetchHomeSettings = async () => {
    try {
      setLoading(true);
      
      // 获取主页设置
      const homeResponse = await fetch('/api/admin/home-settings');
      if (homeResponse.ok) {
        const homeData = await homeResponse.json();
        
        // 构建层级分类结构
        const categoriesResponse = await fetch('/api/categories');
        const categoriesData = await categoriesResponse.json();
        const hierarchicalCategories = buildHierarchicalSidebarCategories(
          categoriesData.categories || [],
          homeData.homeSettings.sidebarCategories.map((cat: any) => cat.categoryId).filter(Boolean)
        );
        
        setHomeSettings({
          ...homeData.homeSettings,
          sidebarCategories: hierarchicalCategories
        });
        
        // 设置默认折叠状态
        const initCollapsed = new Set<number>();
        hierarchicalCategories.forEach((category: SidebarCategory) => {
          if (category.children && category.children.length > 0 && category.categoryId) {
            initCollapsed.add(category.categoryId);
          }
        });
        setCollapsedCategories(initCollapsed);
      } else {
        // 如果没有设置，使用默认值
        const categoriesResponse = await fetch('/api/categories');
        const categoriesData = await categoriesResponse.json();
        
        const defaultSettings: HomeSettings = {
          sidebarCategories: categoriesData.categories?.map((cat: any) => ({
            id: cat.id.toString(),
            name: cat.name,
            categoryId: cat.id,
            isCustom: false,
            parentId: cat.parentId,
            children: []
          })) || [],
          customLinks: []
        };
        
        setHomeSettings(defaultSettings);
      }
    } catch (error) {
      console.error('获取主页设置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeSettings();
  }, []);

  // 阻止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // 返回首页的处理函数
  const handleGoHome = () => {
    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onClose();
  };

  // 处理分类点击 - 用于定位而不是筛选
  const handleCategoryClick = (category: SidebarCategory) => {
    if (category.categoryId) {
      // 判断是否为子分类（有parentId的为子分类）
      const isSubCategory = category.parentId !== undefined && category.parentId !== null;
      
      // 发送自定义事件通知MainContent组件
      const event = new CustomEvent('sidebarCategoryClick', {
        detail: {
          categoryId: category.categoryId,
          isSubCategory: isSubCategory
        }
      });
      window.dispatchEvent(event);
      
      if (isSubCategory) {
        // 如果是子分类，不直接滚动，让MainContent处理
        onClose();
        return;
      }
      
      // 如果是父分类，滚动到对应分类
      const categoryElement = document.getElementById(`category-${category.categoryId}`);
      if (categoryElement) {
        categoryElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    onClose();
  };

  // 处理自定义链接点击
  const handleCustomLinkClick = (link: CustomLink) => {
    if (link.url.startsWith('http')) {
      window.open(link.url, '_blank');
    } else {
      // 对于内部链接，保持原有的路由跳转逻辑
    }
    onClose();
  };

  // 切换分类折叠状态
  const toggleCategoryCollapse = (categoryId: number) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(categoryId)) {
      newCollapsed.delete(categoryId);
    } else {
      newCollapsed.add(categoryId);
    }
    setCollapsedCategories(newCollapsed);
  };

  // 递归渲染分类
  const renderCategory = (category: SidebarCategory, depth: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isCollapsedCategory = category.categoryId ? collapsedCategories.has(category.categoryId) : false;
    const paddingLeft = depth * 16; // 每层缩进16px

    return (
      <div key={category.id}>
        {/* 父分类 */}
        <div className="flex items-center" style={{ marginLeft: `${paddingLeft}px` }}>
          <button
            onClick={() => {
              if (hasChildren && category.categoryId) {
                toggleCategoryCollapse(category.categoryId);
              } else {
                handleCategoryClick(category);
              }
            }}
            className="flex-1 text-left py-3 px-4 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-between"
          >
            <div className="flex items-center">
              <CategoryIcon
                icon={category.icon}
                iconUrl={category.iconUrl}
                name={category.name}
                size={16}
                className="mr-2 text-gray-600 dark:text-gray-400"
              />
              <span className="text-sm font-medium">{category.name}</span>
            </div>
            {hasChildren && (
              <span className="text-gray-500 dark:text-gray-400 ml-2">
                {isCollapsedCategory ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
              </span>
            )}
          </button>
        </div>
        
        {/* 子分类 */}
        {hasChildren && (
          <div 
            className={`ml-2 overflow-hidden transition-all duration-300 ease-in-out ${
              isCollapsedCategory ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'
            }`}
          >
            {category.children?.map((child) => renderCategory(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* 背景遮罩 */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 md:hidden ${
          isOpen ? 'bg-opacity-50 pointer-events-auto' : 'bg-opacity-0 pointer-events-none'
        }`}
        style={{ top: '48px' }}
        onClick={onClose}
      />
      
      {/* 抽屉内容 */}
      <div className={`fixed left-0 w-80 max-w-[85vw] bg-white dark:bg-gray-800 z-50 transform transition-transform duration-300 ease-in-out md:hidden overflow-y-auto ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`} style={{ top: '48px', height: 'calc(100vh - 48px)' }}>
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <Link href="/" className="flex items-center" onClick={onClose}>
            <img 
              src="/logo.png" 
              alt="网站Logo" 
              className="w-8 h-8 mr-3 cursor-pointer hover:opacity-80 transition-opacity"
              title="返回首页"
            />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              导航分类
            </h2>
          </Link>
          
        </div>



        {/* 移动端导航内容 */}
        <div className="py-2">
          {loading ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <p className="text-sm">加载中...</p>
            </div>
          ) : (
            <>
              {/* 分类列表 */}
              {homeSettings.sidebarCategories.map((category) => renderCategory(category))}
              
              {/* 自定义链接 */}
              {homeSettings.customLinks.length > 0 && (
                <>
                  <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 px-4">自定义链接</p>
                  </div>
                  {homeSettings.customLinks.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => handleCustomLinkClick(link)}
                      className="w-full text-left py-3 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                    >
                      <span className="text-sm font-medium">{link.name}</span>
                      {link.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{link.description}</p>
                      )}
                    </button>
                  ))}
                </>
              )}
              
              {/* 如果没有任何内容 */}
              {homeSettings.sidebarCategories.length === 0 && homeSettings.customLinks.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <p className="text-sm">暂无分类，请在后台添加</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}