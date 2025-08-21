'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';

interface NavigationSidebarProps {
  isCollapsed?: boolean;
  sidebarCategories: Array<{
    id: number;
    name: string;
    icon?: string;
    order: number;
  }>;
}

interface SidebarCategory {
  id: string;
  name: string;
  categoryId?: number;
  isCustom: boolean;
  parentId?: number | null;
  children?: SidebarCategory[];
  icon?: string;
  iconUrl?: string;
}

function buildHierarchicalSidebarCategories(categories: any[], selectedCategoryIds: number[]): SidebarCategory[] {
  const result: SidebarCategory[] = [];
  
  categories.forEach(category => {
    // 检查当前分类是否被选中
    const isSelected = selectedCategoryIds.includes(category.id);
    
    // 递归处理子分类
    let children: SidebarCategory[] = [];
    if (category.children) {
      children = buildHierarchicalSidebarCategories(category.children, selectedCategoryIds);
    }
    
    // 只有当前分类被明确选中时，才包含在结果中
    if (isSelected) {
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
    } else if (children.length > 0) {
      // 如果当前分类未被选中，但有被选中的子分类，则只包含子分类
      result.push(...children);
    }
  });
  
  return result;
}

export function NavigationSidebar({ 
  isCollapsed = false, 
  sidebarCategories
}: NavigationSidebarProps) {
  const router = useRouter();
  const [processedCategories, setProcessedCategories] = useState<SidebarCategory[]>([]);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  // 处理传入的分类数据
  useEffect(() => {
    const processCategories = async () => {
      try {
        setLoading(true);
        if (!sidebarCategories || sidebarCategories.length === 0) {
          setProcessedCategories([]);
          setLoading(false);
          return;
        }

        // 获取所有分类数据
        const categoriesResponse = await fetch('/api/categories');
        const categoriesData = await categoriesResponse.json();
        
        // API返回包含categories和hierarchical字段的对象
        const allCategories = categoriesData.categories || [];
        
        // 构建分类映射
        const categoryMap = new Map();
        allCategories.forEach((category: any) => {
          categoryMap.set(category.id, category);
        });
        
        // 构建层级结构
        const rootCategories: any[] = [];
        const childrenMap = new Map();
        
        allCategories.forEach((category: any) => {
          if (!category.parentId) {
            rootCategories.push(category);
          } else {
            if (!childrenMap.has(category.parentId)) {
              childrenMap.set(category.parentId, []);
            }
            childrenMap.get(category.parentId).push(category);
          }
        });
        
        // 将传入的分类ID转换为层级结构
        const selectedCategoryIds = sidebarCategories.map(cat => cat.id);
        
        // 只显示用户明确选择的分类，不自动添加父分类
        const hierarchicalCategories = buildHierarchicalSidebarCategories(rootCategories, selectedCategoryIds);
        
        setProcessedCategories(hierarchicalCategories);
        
        // 设置默认折叠状态
        const initCollapsed = new Set<number>();
        hierarchicalCategories.forEach((category: SidebarCategory) => {
          if (category.children && category.children.length > 0 && category.categoryId) {
            initCollapsed.add(category.categoryId);
          }
        });
        setCollapsedCategories(initCollapsed);
        
      } catch (error) {
        console.error('处理分类数据失败:', error);
        setProcessedCategories([]);
      } finally {
        setLoading(false);
      }
    };

    processCategories();
  }, [sidebarCategories]);

  const handleGoHome = () => {
    // 滚动到页面顶部，显示推荐区域
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleCategory = (categoryId: number) => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleCategoryClick = (category: SidebarCategory) => {
    if (category.categoryId) {
      // 判断是否为子分类（有parentId的为子分类）
      const isSubCategory = category.parentId !== undefined && category.parentId !== null;
      
      // 发送自定义事件通知NavigationPageLayout组件
      const event = new CustomEvent('sidebarCategoryClick', {
        detail: {
          categoryId: category.categoryId,
          isSubCategory: isSubCategory
        }
      });
      window.dispatchEvent(event);
      
      if (isSubCategory) {
        // 如果是子分类，不直接滚动，让NavigationPageLayout处理
        return;
      }
      
      // 如果是父分类，滚动到对应分类
      const categoryElement = document.getElementById(`category-${category.categoryId}`);
      if (categoryElement) {
        categoryElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
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
              onClick={() => category.categoryId && toggleCategory(category.categoryId)}
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
          <div className="text-center py-4">
            <div className="text-gray-500 dark:text-gray-400 text-sm">
              加载中...
            </div>
          </div>
        ) : processedCategories.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400 text-sm">
              {!isCollapsed && (
                <>
                  <div className="mb-2">🎯</div>
                  <div>暂无分类配置</div>
                </>
              )}
            </div>
          </div>
        ) : (
          processedCategories.map((category) => renderCategory(category))
        )}
      </nav>
    </aside>
  );
}
