'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Website } from '@/types';
import { WebsiteCard } from './WebsiteCard';

interface SearchBarProps {
  onSearchResults?: (results: Website[]) => void;
  onClear?: () => void;
}

export function SearchBar({ onSearchResults, onClear }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Website[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // 防抖搜索函数
  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (!term.trim()) {
        setSearchResults([]);
        setShowResults(false);
        onSearchResults?.([]);
        onClear?.();
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
        if (response.ok) {
          const results = await response.json();
          setSearchResults(results);
          setShowResults(true);
          onSearchResults?.(results);
        }
      } catch (error) {
        console.error('搜索失败:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    [onSearchResults, onClear]
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  const handleClear = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
    onSearchResults?.([]);
    onClear?.();
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto mb-12 mt-8">
      {/* 搜索输入框 */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="搜索网站名称、描述或分类..."
          className="block w-full pl-10 pr-12 py-4 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        {isSearching && (
          <div className="absolute inset-y-0 right-8 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* 搜索结果 */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto scrollbar-hide">
          <div className="p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              找到 {searchResults.length} 个结果
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((website) => (
                <WebsiteCard
                  key={website.id}
                  website={website}
                  isRecommended={website.isRecommended}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 无结果提示 */}
      {showResults && searchResults.length === 0 && searchTerm.trim() && !isSearching && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            未找到相关网站
          </div>
        </div>
      )}
    </div>
  );
}

// 防抖函数
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}