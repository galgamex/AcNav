'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronDown, ArrowLeft, Home, List, Globe } from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';
import { Logo } from './Logo';
import { Category } from '@/types';
import { useGlobalState } from '@/contexts/GlobalStateContext';

// 侧边栏模式类型
type SidebarMode = 'home' | 'navigation' | 'category' | 'website';

// 通用分类接口
interface SidebarCategory {
  id: string;
  name: string;
  categoryId?: number;
  isCustom: boolean;
  parentId?: number | null;
  children?: SidebarCategory[];
  icon?: string;
  iconUrl?: string;
  websiteCount?: number;
}

// 自定义链接接口
interface CustomLink {
  id: string;
  name: string;
  url: string;
  description?: string;
}

// 主页设置接口
interface HomeSettings {
  sidebarCategories: SidebarCategory[];
  customLinks: CustomLink[];
}

// 网站接口
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

// 分类详情接口
interface CategoryDetail {
  id: number;
  name: string;
  icon?: string;
  iconUrl?: string;
  children: Array<{
    id: number;
    name: string;
    icon?: string;
    iconUrl?: string;
    _count: {
      websites: number;
    };
  }>;
  _count: {
    websites: number;
  };
}

// 统一侧边栏属性接口
interface UnifiedSidebarProps {
  isCollapsed?: boolean;
  mode: SidebarMode;
  
  // 导航页模式专用
  sidebarCategories?: Array<{
    id: number;
    name: string;
    icon?: string;
    order: number;
  }>;
  
  // 分类详情模式专用
  category?: CategoryDetail;
  activeSubCategory?: number | null;
  onSubCategoryChange?: (subCategoryId: number | null) => void;
  
  // 网站详情模式专用
  website?: Website;
  categories?: Category[];
}

// 构建层级侧边栏分类的辅助函数
function buildHierarchicalSidebarCategories(categories: any[], selectedCategoryIds: number[]): SidebarCategory[] {
  const result: SidebarCategory[] = [];
  
  categories.forEach(category => {
    // 检查当前分类是否被选中
    const isSelected = selectedCategoryIds.includes(category.id);
    
    // 如果当前分类被选中，包含所有子分类
    let children: SidebarCategory[] = [];
    if (isSelected && category.children) {
      // 如果父分类被选中，显示所有子分类
      const convertToSidebarFormat = (cats: any[]): SidebarCategory[] => {
        return cats.map((cat: any) => ({
          id: cat.id.toString(),
          name: cat.name,
          categoryId: cat.id,
          isCustom: false,
          parentId: cat.parentId,
          children: cat.children ? convertToSidebarFormat(cat.children) : [],
          icon: cat.icon,
          iconUrl: cat.iconUrl
        }));
      };
      children = convertToSidebarFormat(category.children);
    } else if (category.children) {
      // 如果父分类未被选中，递归检查子分类
      children = buildHierarchicalSidebarCategories(category.children, selectedCategoryIds);
    }
    
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

// 导航页模式的层级构建函数
function buildNavigationHierarchicalCategories(categories: any[], selectedCategoryIds: number[]): SidebarCategory[] {
  const result: SidebarCategory[] = [];
  
  categories.forEach(category => {
    // 检查当前分类是否被选中
    const isSelected = selectedCategoryIds.includes(category.id);
    
    // 递归处理子分类
    let children: SidebarCategory[] = [];
    if (category.children) {
      children = buildNavigationHierarchicalCategories(category.children, selectedCategoryIds);
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

export function UnifiedSidebar({
  isCollapsed = false,
  mode,
  sidebarCategories,
  category,
  activeSubCategory,
  onSubCategoryChange,
  website,
  categories
}: UnifiedSidebarProps) {
  const router = useRouter();
  const { state } = useGlobalState();
  const [homeSettings, setHomeSettings] = useState<HomeSettings>({
    sidebarCategories: [],
    customLinks: []
  });
  const [processedCategories, setProcessedCategories] = useState<SidebarCategory[]>([]);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [navigationPages, setNavigationPages] = useState<any[]>([]);

  // 获取主页设置（仅在home模式下）
  const fetchHomeSettings = useCallback(async () => {
    try {
      setLoading(true);
      
      // 使用全局状态中的数据
      if (state.sidebarSettings.sidebarCategories.length > 0) {
        setHomeSettings(state.sidebarSettings);
        
        // 设置默认折叠状态
        const initCollapsed = new Set<number>();
        state.sidebarSettings.sidebarCategories.forEach((category: SidebarCategory) => {
          if (category.children && category.children.length > 0 && category.categoryId) {
            initCollapsed.add(category.categoryId);
          }
        });
        setCollapsedCategories(initCollapsed);
        setLoading(false);
        return;
      }
      
      // 如果全局状态中没有数据，则从API获取
      const response = await fetch('/api/home-settings');
      if (response.ok) {
        const homeData = await response.json();
      
        // 获取所有分类数据来构建层级结构
        const categoriesResponse = await fetch('/api/categories');
        const categoriesData = await categoriesResponse.json();
        // API直接返回分类数组
        const allCategories = Array.isArray(categoriesData) ? categoriesData : (categoriesData.categories || []);
        
        // 构建分类映射
        const categoryMap = new Map();
        allCategories.forEach((cat: any) => {
          categoryMap.set(cat.id, { ...cat, children: [] });
        });
        
        // 构建层级结构
        const rootCategories: any[] = [];
        allCategories.forEach((cat: any) => {
          const category = categoryMap.get(cat.id);
          if (cat.parentId) {
            const parent = categoryMap.get(cat.parentId);
            if (parent) {
              parent.children.push(category);
            }
          } else {
            rootCategories.push(categoryMap.get(cat.id));
          }
        });
        
        // 转换为侧边栏分类格式，只包含在主页设置中选中的分类
        const selectedCategoryIds = homeData.homeSettings.sidebarCategories
          .filter((sc: any) => sc.categoryId && sc.name) // 过滤掉无效的分类
          .map((sc: any) => sc.categoryId);
        
        // 如果没有配置侧边栏分类，显示所有分类
        let hierarchicalCategories;
        if (selectedCategoryIds.length === 0) {
          // 递归转换所有分类为侧边栏格式
          const convertToSidebarFormat = (categories: any[]): SidebarCategory[] => {
            return categories.map((cat: any) => ({
              id: cat.id.toString(),
              name: cat.name,
              categoryId: cat.id,
              isCustom: false,
              parentId: cat.parentId,
              children: cat.children ? convertToSidebarFormat(cat.children) : [],
              icon: cat.icon,
              iconUrl: cat.iconUrl
            }));
          };
          
          hierarchicalCategories = convertToSidebarFormat(rootCategories);
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
  }, [state.sidebarSettings]);

  // 处理导航页分类数据（仅在navigation模式下）
  const processNavigationCategories = useCallback(async () => {
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
      const hierarchicalCategories = buildNavigationHierarchicalCategories(rootCategories, selectedCategoryIds);
      
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
  }, [sidebarCategories]);

  // 获取导航页数据（仅在website模式下）
  const fetchNavigationPages = async () => {
    try {
      const response = await fetch('/api/navigation-pages');
      if (response.ok) {
        const data = await response.json();
        // API返回的数据结构是 { navigationPages: [...], pagination: {...} }
        setNavigationPages(data.navigationPages || []);
      }
    } catch (error) {
      console.error('获取导航页失败:', error);
    }
  };

  useEffect(() => {
    // 确保在客户端环境下才执行
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }
    
    if (mode === 'home') {
      fetchHomeSettings();
    } else if (mode === 'navigation') {
      processNavigationCategories();
    } else if (mode === 'website') {
      fetchNavigationPages();
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [mode, sidebarCategories, fetchHomeSettings, processNavigationCategories]);

  // 返回首页的处理函数
  const handleGoHome = () => {
    if (mode === 'home' || mode === 'navigation') {
      // 滚动到页面顶部
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      router.push('/');
    }
  };

  // 返回网站首页的处理函数
  const handleGoToMainHome = () => {
    router.push('/');
  };

  // 处理分类点击
  const handleCategoryClick = (category: SidebarCategory) => {
    if (category.categoryId) {
      if (mode === 'home') {
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
      } else if (mode === 'navigation') {
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
    }
  };

  // 处理分类按钮点击（包括展开/收缩和导航）
  const handleCategoryButtonClick = (category: SidebarCategory) => {
    const hasChildren = category.children && category.children.length > 0;
    
    if (hasChildren && category.categoryId) {
      // 如果有子分类，先处理展开/收缩
      toggleCategoryCollapse(category.categoryId);
    } else {
      // 如果没有子分类，执行原有的导航逻辑
      handleCategoryClick(category);
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

  // 处理返回上一页（分类详情模式）
  const handleGoBack = () => {
    router.back();
  };

  // 处理子分类点击（分类详情模式）
  const handleSubCategoryClick = (subCategoryId: number) => {
    if (onSubCategoryChange) {
      onSubCategoryChange(subCategoryId);
    }
  };

  // 处理返回所属分类列表（网站详情模式）
  const handleGoToCategory = () => {
    if (website) {
      router.push(`/category/${website.categoryId}`);
    }
  };

  // 处理返回导航页（网站详情模式）
  const handleGoToNavigationPage = () => {
    let fromNavPage = null;
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      fromNavPage = urlParams.get('fromNavPage');
    }
    
    if (fromNavPage) {
      // 如果有fromNavPage参数，返回对应的导航页
      router.push(`/nav/${fromNavPage}`);
    } else {
      // 否则判断网站所属分类来决定返回哪个导航页
      if (!Array.isArray(categories)) {
        // 如果categories不是数组，直接返回首页
        router.push('/');
        return;
      }
      
      const websiteCategory = categories.find(cat => cat.id === website?.categoryId);
      if (websiteCategory) {
        // 确保navigationPages是数组且已加载
        if (!Array.isArray(navigationPages) || navigationPages.length === 0) {
          console.warn('导航页数据未加载完成，返回首页');
          router.push('/');
          return;
        }
        
        // 找到分类所属的导航页
        const navPage = navigationPages.find(page => {
          if (!page || !page.sidebarCategories) return false;
          
          try {
            // 解析JSON字符串获取分类ID数组
            const sidebarCategoryIds = JSON.parse(page.sidebarCategories);
            
            // 检查网站的分类ID或其父分类ID是否在导航页的侧边栏分类中
            return sidebarCategoryIds.includes(websiteCategory.id) || 
                   (websiteCategory.parentId && sidebarCategoryIds.includes(websiteCategory.parentId));
          } catch (error) {
            console.error('解析导航页分类配置失败:', error);
            return false;
          }
        });
        
        if (navPage) {
          router.push(`/nav/${navPage.slug}`);
        } else {
          // 如果找不到对应的导航页，返回首页
          router.push('/');
        }
      } else {
        router.push('/');
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
            onClick={() => handleCategoryButtonClick(category)}
            className={`flex-1 flex items-center py-2 px-3 text-sm rounded-lg text-left transition-all duration-200 group hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400`}
            title={isCollapsed ? category.name : ''}
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
            
            {!isCollapsed && (
              <>
                <span className="ml-2 truncate font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {category.name}
                  {category.websiteCount !== undefined && ` (${category.websiteCount})`}
                </span>
                {/* 展开/收缩指示器 */}
                {hasChildren && (
                  <span className="ml-auto text-gray-500 dark:text-gray-400">
                    {isCollapsedCategory ? (
                      <ChevronRight className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </span>
                )}
              </>
            )}
          </button>
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

  // 渲染分类详情模式的子分类
  const renderSubCategory = (subCategory: any) => {
    return (
      <div 
        key={subCategory.id}
        className={`flex items-center py-2 px-3 rounded-lg cursor-pointer ${
          activeSubCategory === subCategory.id 
            ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
        }`}
        onClick={() => handleSubCategoryClick(subCategory.id)}
      >
        <div className="flex items-center flex-1 min-w-0">
          {/* 图标 */}
          <div className="flex-shrink-0 w-5 h-5 mr-3 flex items-center justify-center">
            <CategoryIcon 
              icon={subCategory.icon}
              iconUrl={subCategory.iconUrl}
              name={subCategory.name}
              size={16}
              className="text-gray-600 dark:text-gray-400"
            />
          </div>
          
          {/* 子分类名称 */}
          {!isCollapsed && (
            <span className="text-sm font-medium truncate">
              {subCategory.name} ({subCategory._count.websites})
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <aside className={`fixed left-0 top-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen overflow-y-auto z-40 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-56'
    }`}>
      {/* Logo和网站标题 */}
      <div className={`flex items-center justify-center py-4 border-b border-gray-200 dark:border-gray-700 ${
        isCollapsed ? 'px-2' : 'px-6'
      }`}>
        <Logo 
          onClick={handleGoHome}
          showText={!isCollapsed}
          size="md"
          className="cursor-pointer"
        />
      </div>
      
      {/* 根据模式渲染不同内容 */}
      {mode === 'category' && (
        <>
          {/* 返回按钮 */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-2 py-2">
            <div 
              className="flex items-center py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              onClick={handleGoBack}
            >
              <div className="flex items-center flex-1 min-w-0">
                {/* 图标 - 使用与分类列表相同的固定位置布局 */}
                <div className="flex-shrink-0 w-5 h-5 mr-3 flex items-center justify-center">
                  <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
                
                {/* 返回文字 */}
                {!isCollapsed && (
                  <span className="text-sm font-medium truncate">
                    返回上一页
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* 分类和子分类列表 */}
          <nav className="flex-1 overflow-y-auto py-4">
            {category && category.children && category.children.length > 0 ? (
              <div className="space-y-1 px-2">
                {/* 子分类列表 */}
                {category.children.map((subCategory) => renderSubCategory(subCategory))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500 dark:text-gray-400 text-sm">
                  {!isCollapsed && '暂无分类数据'}
                </div>
              </div>
            )}
          </nav>
        </>
      )}
      
      {mode === 'website' && (
        <>
          {/* 返回按钮区域 */}
          <nav className="space-y-2 p-2">
            {/* 返回所属分类列表 */}
            <button
              onClick={handleGoToCategory}
              className={`w-full flex items-center py-2 px-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
              title={isCollapsed ? '返回分类列表' : ''}
            >
              {/* 图标 - 固定位置 */}
              <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                <List className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              
              {!isCollapsed && (
                <span className="ml-2 text-sm font-medium truncate">
                  返回分类列表
                </span>
              )}
            </button>

            {/* 返回导航页 */}
            <button
              onClick={handleGoToNavigationPage}
              className={`w-full flex items-center py-2 px-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
              title={isCollapsed ? '返回导航页' : ''}
            >
              {/* 图标 - 固定位置 */}
              <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                <Home className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              
              {!isCollapsed && (
                <span className="ml-2 text-sm font-medium truncate">
                  返回导航页
                </span>
              )}
            </button>
          </nav>
        </>
      )}
      
      {(mode === 'home' || mode === 'navigation') && (
        <nav className={`space-y-2 p-2`}>
          {loading ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <p className="text-sm">加载中...</p>
            </div>
          ) : (
            <>
              {/* 分类列表 */}
              {mode === 'home' ? (
                <>
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
              ) : (
                <>
                  {/* 返回网站首页按钮 - 仅在导航页模式显示 */}
                  <button
                    onClick={handleGoToMainHome}
                    className={`flex-1 flex items-center py-2 px-3 text-sm rounded-lg text-left transition-all duration-200 group hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400`}
                    title={isCollapsed ? '返回网站首页' : ''}
                  >
                    {/* 图标 - 固定位置 */}
                    <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                      <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    
                    {!isCollapsed && (
                      <span className="ml-2 truncate font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        返回网站首页
                      </span>
                    )}
                  </button>

                  {processedCategories.length === 0 ? (
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
                </>
              )}
            </>
          )}
        </nav>
      )}
    </aside>
  );
}