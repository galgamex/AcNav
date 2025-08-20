'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';

interface SidebarProps {
  isCollapsed?: boolean;
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

// 构建层级侧边栏分类的辅助函数
function buildHierarchicalSidebarCategories(categories: any[], selectedCategoryIds: number[]): SidebarCategory[] {
  const result: SidebarCategory[] = [];
  
  categories.forEach(category => {
    // 检查当前分类是否被选中
    const isSelected = selectedCategoryIds.includes(category.id);
    
    // 递归处理子分类
    const children = category.children ? buildHierarchicalSidebarCategories(category.children, selectedCategoryIds) : [];
    
    // 如果当前分类被选中或有被选中的子分类，则包含在结果中
    if (isSelected || children.length > 0) {
      result.push({
        id: category.id.toString(),
        name: category.name,
        categoryId: category.id,
        isCustom: false,
        parentId: category.parentId,
        children: children,
        icon: category.icon,
        iconUrl: category.iconUrl
      });
    }
  });
  
  return result;
}

export function Sidebar({ isCollapsed = false }: SidebarProps) {
  const router = useRouter();
  const [homeSettings, setHomeSettings] = useState<HomeSettings>({
    sidebarCategories: [],
    customLinks: []
  });
  const [loading, setLoading] = useState(true);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<number>>(new Set());

  // 获取主页设置
  const fetchHomeSettings = async () => {
    try {
      setLoading(true);
      
      // 获取主页设置
      const response = await fetch('/api/home-settings');
        if (response.ok) {
          const homeData = await response.json();
        
        // 获取所有分类数据来构建层级结构
        const categoriesResponse = await fetch('/api/categories');
        const categoriesData = await categoriesResponse.json();
        const categories = categoriesData.categories || [];
        
        // 构建分类映射
        const categoryMap = new Map();
        categories.forEach((cat: any) => {
          categoryMap.set(cat.id, { ...cat, children: [] });
        });
        
        // 构建层级结构
        const rootCategories: any[] = [];
        categories.forEach((cat: any) => {
          if (cat.parentId) {
            const parent = categoryMap.get(cat.parentId);
            if (parent) {
              parent.children.push(categoryMap.get(cat.id));
            }
          } else {
            rootCategories.push(categoryMap.get(cat.id));
          }
        });
        
        // 转换为侧边栏分类格式，只包含在主页设置中选中的分类
        const selectedCategoryIds = homeData.homeSettings.sidebarCategories.map((sc: any) => sc.categoryId);
        
        // 如果没有配置侧边栏分类，显示所有分类
        let hierarchicalCategories;
        if (selectedCategoryIds.length === 0) {
          // 显示所有分类
          hierarchicalCategories = rootCategories.map((cat: any) => ({
            id: cat.id.toString(),
            name: cat.name,
            categoryId: cat.id,
            isCustom: false,
            parentId: cat.parentId,
            children: cat.children ? cat.children.map((child: any) => ({
              id: child.id.toString(),
              name: child.name,
              categoryId: child.id,
              isCustom: false,
              parentId: child.parentId,
              children: [],
              icon: child.icon,
              iconUrl: child.iconUrl
            })) : [],
            icon: cat.icon,
            iconUrl: cat.iconUrl
          }));
        } else {
          hierarchicalCategories = buildHierarchicalSidebarCategories(rootCategories, selectedCategoryIds);
        }
        
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
          sidebarCategories: categoriesData.map((cat: any) => ({
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

  // 返回首页的处理函数
  const handleGoHome = () => {
    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        return;
      }
      
      // 如果是父分类，滚动到对应分类
      const categoryElement = document.getElementById(`category-${category.categoryId}`);
      if (categoryElement) {
        categoryElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // 处理自定义链接点击
  const handleCustomLinkClick = (link: CustomLink) => {
    if (link.url.startsWith('http')) {
      window.open(link.url, '_blank');
    } else {
      router.push(link.url);
    }
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
    
    return (
      <div key={category.id} className={`${depth > 0 ? 'ml-4' : ''}`}>
        <div className="flex items-center">
          <button
            onClick={() => handleCategoryClick(category)}
            className={`flex-1 flex items-center py-2 px-3 text-sm rounded-lg text-left transition-all duration-200 group ${
              isCollapsed ? 'justify-center px-2' : ''
            } hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400`}
            title={isCollapsed ? category.name : ''}
          >
            {/* 分类图标 */}
            <div className="flex-shrink-0">
              <CategoryIcon 
                icon={category.icon} 
                iconUrl={category.iconUrl}
                name={category.name}
                className="w-5 h-5"
              />
            </div>
            
            {!isCollapsed && (
              <>
                <span className="ml-2 truncate font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {category.name}
                </span>
              </>
            )}
          </button>
          
          {/* 折叠按钮 */}
          {hasChildren && !isCollapsed && (
            <button
              onClick={() => category.categoryId && toggleCategoryCollapse(category.categoryId)}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {isCollapsedCategory ? (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
          )}
        </div>
        
        {/* 子分类 */}
        {hasChildren && !isCollapsed && (
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
    <aside className={`fixed left-0 top-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen overflow-y-auto z-40 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-56'
    }`}>
      {/* Logo和网站标题 */}
      <div className={`flex items-center py-4 border-b border-gray-200 dark:border-gray-700 ${
        isCollapsed ? 'justify-center px-2' : 'justify-start px-6'
      }`}>
        <img 
          src="/logo.png" 
          alt="网站Logo" 
          className="w-10 h-10 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleGoHome}
          title="返回首页"
        />
        {!isCollapsed && (
          <h1 
            className="ml-3 text-xl font-semibold text-gray-900 dark:text-white truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            onClick={handleGoHome}
            title="返回首页"
          >
            导航网站
          </h1>
        )}
      </div>
      <nav className={`space-y-2 p-4`}>
        {loading ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <p className="text-sm">加载中...</p>
          </div>
        ) : (
          <>
             {/* 分类列表 */}
             {homeSettings.sidebarCategories.map((category) => (
               <div key={category.id}>
                 {renderCategory(category, 0)}
               </div>
             ))}
            
            {/* 自定义链接 */}
            {homeSettings.customLinks.length > 0 && (
              <>
                {!isCollapsed && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 px-3">自定义链接</p>
                  </div>
                )}
                {homeSettings.customLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => handleCustomLinkClick(link)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      isCollapsed ? 'text-center' : ''
                    }`}
                    title={isCollapsed ? link.name : link.description}
                  >
                    {isCollapsed ? (
                      <div className="flex justify-center">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">🔗</span>
                      </div>
                    ) : (
                      <span className="text-sm font-medium">{link.name}</span>
                    )}
                  </button>
                ))}
              </>
            )}
            
            {/* 如果没有任何内容 */}
            {homeSettings.sidebarCategories.length === 0 && homeSettings.customLinks.length === 0 && !isCollapsed && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <p className="text-sm">暂无分类，请在后台添加</p>
              </div>
            )}
          </>
        )}
      </nav>
    </aside>
   );
}