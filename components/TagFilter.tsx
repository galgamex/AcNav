'use client';

import { useState, useEffect } from 'react';
import { Tag, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Tag {
  id: number;
  name: string;
  color: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TagFilterProps {
  selectedTags: number[];
  onTagsChange: (tagIds: number[]) => void;
  className?: string;
}

export function TagFilter({ selectedTags, onTagsChange, className = '' }: TagFilterProps) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tags');
      if (response.ok) {
        const tags = await response.json();
        setAllTags(tags);
      } else {
        setError('获取标签失败');
      }
    } catch (error) {
      console.error('获取标签失败:', error);
      setError('获取标签失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTagToggle = (tagId: number) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId];
    onTagsChange(newSelectedTags);
  };

  const clearAllTags = () => {
    onTagsChange([]);
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
        <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
          <Filter className="h-4 w-4" />
          <span className="text-sm">加载标签中...</span>
        </div>
      </div>
    );
  }

  if (error || allTags.length === 0) {
    return null;
  }

  const displayTags = isExpanded ? allTags : allTags.slice(0, 8);
  const hasMoreTags = allTags.length > 8;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">标签筛选</span>
          {selectedTags.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {selectedTags.length}
            </Badge>
          )}
        </div>
        {selectedTags.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllTags}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-3 w-3 mr-1" />
            清除
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {displayTags.map((tag) => {
          const isSelected = selectedTags.includes(tag.id);
          return (
            <button
              key={tag.id}
              onClick={() => handleTagToggle(tag.id)}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                isSelected
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-2 border-blue-300 dark:border-blue-600'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              style={{
                backgroundColor: isSelected && tag.color ? `${tag.color}20` : undefined,
                borderColor: isSelected && tag.color ? tag.color : undefined,
                color: isSelected && tag.color ? tag.color : undefined
              }}
            >
              <Tag className="mr-1 h-3 w-3" />
              {tag.name}
            </button>
          );
        })}
        
        {hasMoreTags && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            {isExpanded ? '收起' : `显示更多 (+${allTags.length - 8})`}
          </Button>
        )}
      </div>
    </div>
  );
}