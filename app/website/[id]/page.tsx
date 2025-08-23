'use client';

import { useState } from 'react';
import { WebsiteDetailContent } from './WebsiteDetailContent';
import { GlobalLayout } from '@/components/GlobalLayout';
import { Category } from '@/types';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

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

export default function WebsiteDetailPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [website, setWebsite] = useState<Website | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  // 获取分类数据
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          // API返回的数据结构是 { categories: [...], hierarchical: [...] }
          setCategories(data.categories || data);
        }
      } catch (error) {
        console.error('获取分类失败:', error);
      }
    };

    fetchCategories();
  }, []);



  // 处理网站数据更新
  const handleWebsiteUpdate = (websiteData: Website) => {
    setWebsite(websiteData);
    setLoading(false);
  };


  
  // 只有在网站数据加载完成后才显示布局
  if (!website && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="text-xl">网站不存在</div>
        </div>
      </div>
    );
  }

  return (
    <GlobalLayout 
      sidebarMode="website"
      sidebarProps={{
        website,
        categories
      }}
    >
      <WebsiteDetailContent 
        categories={categories} 
        onWebsiteUpdate={handleWebsiteUpdate}
        loading={loading}
      />
    </GlobalLayout>
  );
}