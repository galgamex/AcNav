import { Category } from '@/types';
import { WebsiteCard } from './WebsiteCard';
import { CategoryIcon } from './CategoryIcon';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

interface CategorySectionProps {
  category: Category;
  activeSubCategoryId?: number;
  onTabChange?: (categoryId: number) => void;
  fromNavPage?: string;
}

export function CategorySection({ category, activeSubCategoryId, onTabChange, fromNavPage }: CategorySectionProps) {
  // 过滤出有网站的子分类 - 使用useMemo优化
  const validSubCategories = useMemo(() => {
    return category.children ? category.children.filter(
      (subCategory) => subCategory.websites && subCategory.websites.length > 0
    ) : [];
  }, [category.children]);
  
  // 使用第一个有效子分类作为默认选中
  const [activeTabId, setActiveTabId] = useState(activeSubCategoryId || (validSubCategories[0]?.id || 0));
  const activeSubCategory = validSubCategories.find(sub => sub.id === activeTabId) || validSubCategories[0];
  
  // 当外部传入的activeSubCategoryId变化时，更新内部状态
  useEffect(() => {
    if (activeSubCategoryId && validSubCategories.some(sub => sub.id === activeSubCategoryId)) {
      setActiveTabId(activeSubCategoryId);
    }
  }, [activeSubCategoryId, validSubCategories]);
  
  // 如果是父分类且有子分类，展示子分类（Tab选项卡形式）
  if (category.children && category.children.length > 0) {
    // 如果没有有效的子分类，返回null
    if (validSubCategories.length === 0) {
      return null;
    }
    
    // Tab切换处理函数
    const handleTabChange = (subCategoryId: number) => {
      setActiveTabId(subCategoryId);
      onTabChange?.(subCategoryId);
    };
    
    return (
      <section className="mb-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center flex-shrink-0">
                <CategoryIcon
                  icon={category.icon}
                  iconUrl={category.iconUrl}
                  name={category.name}
                  size={24}
                  className="mr-3 hidden sm:block"
                />
                {category.name}
              </h2>
              
              {/* Tab选项卡 - 下划线样式，手机端支持左右拖动 */}
              <div className="flex-1 overflow-x-auto scrollbar-hide min-w-0">
                <div className="flex gap-1 min-w-max">
                  {validSubCategories.map((subCategory) => (
                    <button
                      key={subCategory.id}
                      onClick={() => handleTabChange(subCategory.id)}
                      className={`flex items-center px-2 sm:px-3 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                         activeTabId === subCategory.id
                           ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                           : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                       }`}
                    >
                      <CategoryIcon
                        icon={subCategory.icon}
                        iconUrl={subCategory.iconUrl}
                        name={subCategory.name}
                        size={16}
                        className="mr-1 sm:mr-2 flex-shrink-0"
                      />
                      <span className="hidden sm:inline">{subCategory.name}</span>
                      <span className="sm:hidden">{subCategory.name.length > 4 ? subCategory.name.substring(0, 4) + '...' : subCategory.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* 查看更多链接 */}
            <Link 
              href={`/category/${category.id}`}
              className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex-shrink-0 ml-2"
            >
              查看更多
              <ExternalLink className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>

        
        {/* 当前选中Tab的内容 */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {activeSubCategory.websites?.map((website) => (
            <WebsiteCard key={website.id} website={website} fromNavPage={fromNavPage} />
          ))}
        </div>
      </section>
    );
  }
  
  // 如果是叶子分类（没有子分类）且有网站，展示网站
  if (!category.websites || category.websites.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <CategoryIcon
            icon={category.icon}
            iconUrl={category.iconUrl}
            name={category.name}
            size={24}
            className="mr-2"
        />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {category.name}
          </h2>
        </div>
        
        {/* 查看更多链接 - 子分类链接到父分类详情页 */}
        <Link 
          href={`/category/${category.parentId || category.id}`}
          className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          查看更多
          <ExternalLink className="w-4 h-4 ml-1" />
        </Link>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {category.websites.map((website) => (
          <WebsiteCard key={website.id} website={website} fromNavPage={fromNavPage} />
        ))}
      </div>
    </section>
  );
}