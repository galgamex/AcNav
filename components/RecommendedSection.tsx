'use client';

import { useState, useEffect } from 'react';
import { Website } from '@/types';
import { WebsiteCard } from './WebsiteCard';

interface RecommendedSectionProps {
  className?: string;
}

interface RecommendedResponse {
  websites: Website[];
  count: number;
}

export function RecommendedSection({ className = '' }: RecommendedSectionProps) {
  const [recommendedWebsites, setRecommendedWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendedWebsites = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/recommended');
        
        if (!response.ok) {
          throw new Error('获取推荐网站失败');
        }
        
        const data: RecommendedResponse = await response.json();
        setRecommendedWebsites(data.websites);
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知错误');
        console.error('获取推荐网站失败:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedWebsites();
  }, []);

  if (loading) {
    return null;
  }

  if (error) {
    return (
      <section className={`${className}`}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            推荐专区
          </h2>
         
        </div>
        <div className="text-center py-8">
          <p className="text-red-500 dark:text-red-400">{error}</p>
        </div>
      </section>
    );
  }

  if (recommendedWebsites.length === 0) {
    return (
      <section className={`${className}`}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            推荐专区
          </h2>
          
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">暂无推荐网站</p>
        </div>
      </section>
    );
  }

  return (
    <section className={`${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          推荐专区
        </h2>
        
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {recommendedWebsites.map((website) => (
          <WebsiteCard 
            key={website.id} 
            website={website} 
            isRecommended={true}
          />
        ))}
      </div>
    </section>
  );
}