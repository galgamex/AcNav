'use client';

import { useState, useEffect } from 'react';
import { WebsiteCard } from './WebsiteCard';

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

interface NavigationRecommendedSectionProps {
  className?: string;
  websites: Website[];
}

export function NavigationRecommendedSection({ 
  className = '',
  websites 
}: NavigationRecommendedSectionProps) {
  
  if (websites.length === 0) {
    return (
      <section className={`${className}`}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            推荐专区
          </h2>
          
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">该导航页暂无推荐网站</p>
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
        {websites.map((website) => (
          <WebsiteCard 
            key={website.id} 
            website={{
              ...website,
              name: website.name || '',
              createdAt: new Date(),
              updatedAt: new Date(),
              websiteTags: (website.websiteTags || []).map(wt => ({
                id: 0,
                websiteId: website.id,
                tagId: wt.tag.id,
                createdAt: new Date(),
                updatedAt: new Date(),
                tag: {
                  ...wt.tag,
                  createdAt: new Date(),
                  updatedAt: new Date()
                }
              }))
            }} 
            isRecommended={true}
          />
        ))}
      </div>
    </section>
  );
}
