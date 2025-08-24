'use client';

import { useGlobalState } from '@/contexts/GlobalStateContext';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  onClick?: () => void;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12'
};

const textSizeClasses = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-2xl'
};

export function Logo({ className = '', onClick, showText = true, size = 'md' }: LogoProps) {
  const { state } = useGlobalState();
  const { logoSettings, isLoading } = state;

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  if ((isLoading.logo && !logoSettings.siteName) || !logoSettings.siteName) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className={`${sizeClasses[size]} bg-gray-200 dark:bg-gray-700 rounded animate-pulse`}></div>
        {showText && (
          <div className="ml-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
        )}
      </div>
    );
  }

  const isVertical = className.includes('flex-col');

  return (
    <div
      className={`flex cursor-pointer hover:opacity-80 transition-opacity ${isVertical ? 'flex-col items-center' : 'items-center'} ${className}`}
      onClick={handleClick}
      title="返回首页"
    >
      {logoSettings.logoText ? (
        <div
          className={`${sizeClasses[size]} flex items-center justify-center bg-blue-600 text-white rounded font-bold ${textSizeClasses[size]} flex-shrink-0`}
        >
          {logoSettings.logoText.charAt(0).toUpperCase()}
        </div>
      ) : (
        <Image
          src={logoSettings.logoUrl}
          alt="网站Logo"
          width={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
          height={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
          className={`${sizeClasses[size]} flex-shrink-0 object-contain`}
          unoptimized={true}
        />
      )}
      {showText && (
        <span className={`${isVertical ? 'mt-4' : 'ml-4'} font-semibold text-gray-900 dark:text-white ${textSizeClasses[size]} ${isVertical ? 'text-center' : 'truncate'} font-fangzheng`}>
          {logoSettings.siteName}
        </span>
      )}
    </div>
  );
}

export default Logo;