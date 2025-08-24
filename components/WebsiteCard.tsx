'use client';

import { Website } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef } from 'react';

interface WebsiteCardProps {
  website: Website;
  isRecommended?: boolean;
  fromCategory?: boolean;
  categoryId?: number;
  fromNavPage?: string;
}

export function WebsiteCard({ website, isRecommended = false, fromCategory = false, categoryId, fromNavPage }: WebsiteCardProps) {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const [tooltipArrowStyle, setTooltipArrowStyle] = useState({});
  const cardRef = useRef<HTMLDivElement>(null);

  const navigateToDetail = () => {
    let url = `/website/${website.id}`;
    const params = new URLSearchParams();
    
    if (fromCategory && categoryId) {
      params.append('from', 'category');
      params.append('categoryId', categoryId.toString());
    }
    
    if (fromNavPage) {
      params.append('fromNavPage', fromNavPage);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    window.location.href = url;
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = website.url;
  };

  const showTooltip = () => {
    setTooltipVisible(true);
    setTimeout(() => {
      updateTooltipPosition();
    }, 0);
  };

  const hideTooltip = () => {
    setTooltipVisible(false);
  };

  const updateTooltipPosition = () => {
    if (!cardRef.current) return;
    
    const cardRect = cardRef.current.getBoundingClientRect();
    const tooltipHeight = 60;
    const spaceBelow = window.innerHeight - cardRect.bottom;
    
    const absoluteLeft = cardRect.left + cardRect.width / 2;
    
    if (spaceBelow < tooltipHeight) {
      // 上方显示
      setTooltipStyle({
        position: 'fixed',
        top: `${cardRect.top - tooltipHeight - 10}px`,
        left: `${absoluteLeft}px`,
        transform: 'translateX(-50%)',
        zIndex: '9999'
      });
      setTooltipArrowStyle({
        position: 'absolute',
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        borderWidth: '5px 5px 0 5px',
        borderColor: 'rgba(0, 0, 0, 0.8) transparent transparent transparent',
      });
    } else {
      // 下方显示
      setTooltipStyle({
        position: 'fixed',
        top: `${cardRect.bottom + 10}px`,
        left: `${absoluteLeft}px`,
        transform: 'translateX(-50%)',
        zIndex: '9999'
      });
      setTooltipArrowStyle({
        position: 'absolute',
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        borderWidth: '0 5px 5px 5px',
        borderColor: 'transparent transparent rgba(0, 0, 0, 0.8) transparent',
      });
    }
  };

  return (
    <>
      <div 
        ref={cardRef}
        className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 md:p-4 hover:shadow-md transition-all duration-200 cursor-pointer min-h-[80px] ${
          isRecommended 
            ? 'hover:border-yellow-400 dark:hover:border-yellow-500 ring-2 ring-yellow-200 dark:ring-yellow-800' 
            : 'hover:border-blue-300 dark:hover:border-blue-600'
        }`}
        onClick={navigateToDetail}
        onContextMenu={handleContextMenu}
        onMouseOver={showTooltip}
        onMouseLeave={hideTooltip}
      >
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="flex-shrink-0">
            <Image
              src={website.iconUrl || '/icons/default.svg'}
              alt="icon"
              width={40}
              height={40}
              className="w-8 h-8 md:w-10 md:h-10 object-contain rounded"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/icons/default.svg';
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm font-medium text-gray-900 dark:text-white truncate">{website.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{website.description}</p>
          </div>
        </div>
      </div>
      
      {tooltipVisible && (
        <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg" style={tooltipStyle}>
          {website.description}
          <div className="tooltip-arrow" style={tooltipArrowStyle}></div>
        </div>
      )}
    </>
   );
}