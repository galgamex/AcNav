'use client';

import { useEffect } from 'react';
import { X, ChevronRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CategoryIcon } from './CategoryIcon';
import { Logo } from './Logo';

interface NavigationMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
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

export function NavigationMobileDrawer({ 
  isOpen, 
  onClose, 
  sidebarCategories
}: NavigationMobileDrawerProps) {
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

        // 获取所有分类数据来构建完整的层级结构
        const categoriesResponse = await fetch('/api/categories');
        const categoriesData = await categoriesResponse.json();
        const allCategories = categoriesData.categories || [];
        
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
        
        // 将传入的分类ID转换为层级结构
        const selectedCategoryIds = sidebarCategories.map(cat => cat.id);
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
      
      if (isSubCategory) {
        // 如果是子分类，导航到父分类的详情页
        router.push(`/category/${category.parentId}`);
      } else {
        // 如果是父分类，导航到分类详情页
        router.push(`/category/${category.categoryId}`);
      }
    }
    
    // 关闭移动端抽屉
    onClose();
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
            className="flex-1 flex items-center py-3 px-4 text-sm rounded-lg text-left transition-all duration-200 group hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            {/* 分类图标 - 固定位置 */}
            <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
              <CategoryIcon 
                icon={category.icon} 
                iconUrl={category.iconUrl}
                name={category.name}
                className="w-5 h-5"
              />
            </div>
            
            <span className="ml-3 truncate font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {category.name}
            </span>
          </button>
          
          {/* 折叠按钮 */}
          {hasChildren && (
            <button
              onClick={() => category.categoryId && toggleCategory(category.categoryId)}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors mr-2"
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
        {hasChildren && (
          <div 
            className={`ml-4 overflow-hidden transition-all duration-300 ease-in-out ${
              isCollapsedCategory ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'
            }`}
          >
            {category.children?.map((child) => renderCategory(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // 防止背景滚动
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

  return (
    <>
      {/* 遮罩层 */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* 抽屉内容 */}
      <div className={`fixed left-0 top-0 w-80 h-full bg-white dark:bg-gray-800 z-50 transform transition-transform duration-300 md:hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Logo 
              onClick={() => {
                // 滚动到页面顶部，显示推荐区域
                window.scrollTo({ top: 0, behavior: 'smooth' });
                onClose();
              }}
              showText={false}
              size="sm"
              className=""
            />
            <h2 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">
              导航分类
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* 分类列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500 dark:text-gray-400 text-sm">
                加载中...
              </div>
            </div>
          ) : processedCategories.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400">
                <div className="text-2xl mb-2">🎯</div>
                <div className="text-sm">暂无分类配置</div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {processedCategories.map((category) => renderCategory(category))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
