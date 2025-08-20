'use client'

import React from 'react'
import Image from 'next/image'
import * as LucideIcons from 'lucide-react'
import { LucideProps } from 'lucide-react'

interface CategoryIconProps {
  icon?: string | null
  iconUrl?: string | null
  name: string
  size?: number
  className?: string
}

export function CategoryIcon({ icon, iconUrl, name, size = 24, className = '' }: CategoryIconProps) {
  // 优先使用 Lucide 图标
  if (icon) {
    // 动态获取 Lucide 图标组件
    const IconComponent = (LucideIcons as any)[icon] as React.ComponentType<LucideProps>
    
    if (IconComponent) {
      return (
        <IconComponent 
          size={size} 
          className={className}
          aria-label={`${name} 图标`}
        />
      )
    }
  }
  
  // 如果没有 Lucide 图标，使用自定义图标 URL
  if (iconUrl) {
    return (
      <Image
        src={iconUrl}
        alt={`${name} 图标`}
        width={size}
        height={size}
        className={className}
      />
    )
  }
  
  // 如果都没有，使用默认的文件夹图标
  const FolderIcon = LucideIcons.Folder
  return (
    <FolderIcon 
      size={size} 
      className={className}
      aria-label={`${name} 默认图标`}
    />
  )
}

export default CategoryIcon