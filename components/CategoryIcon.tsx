'use client'

import React from 'react'
import Image from 'next/image'
import { Folder, LucideProps } from 'lucide-react'

// 动态导入常用图标以减少打包大小
const getIconComponent = async (iconName: string): Promise<React.ComponentType<LucideProps> | null> => {
  try {
    const iconModule = await import('lucide-react')
    return (iconModule as any)[iconName] || null
  } catch {
    return null
  }
}

interface CategoryIconProps {
  icon?: string | null
  iconUrl?: string | null
  name: string
  size?: number
  className?: string
}

export function CategoryIcon({ icon, iconUrl, name, size = 24, className = '' }: CategoryIconProps) {
  const [IconComponent, setIconComponent] = React.useState<React.ComponentType<LucideProps> | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  // 创建固定尺寸的容器以防止布局偏移
  const containerStyle = {
    width: `${size}px`,
    height: `${size}px`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  }

  // 动态加载图标
  React.useEffect(() => {
    if (icon && !IconComponent && !isLoading) {
      setIsLoading(true)
      getIconComponent(icon).then((component) => {
        setIconComponent(() => component)
        setIsLoading(false)
      })
    }
  }, [icon, IconComponent, isLoading])

  // 优先使用 Lucide 图标
  if (icon) {
    if (IconComponent) {
      return (
        <div style={containerStyle} className={className}>
          <IconComponent 
            size={size} 
            aria-label={`${name} 图标`}
          />
        </div>
      )
    }
    
    // 加载中显示默认图标
    if (isLoading) {
      return (
        <div style={containerStyle} className={className}>
          <Folder 
            size={size} 
            aria-label={`${name} 加载中`}
          />
        </div>
      )
    }
  }
  
  // 如果没有 Lucide 图标，使用自定义图标 URL
  if (iconUrl) {
    return (
      <div style={containerStyle} className={className}>
        <Image
          src={iconUrl}
          alt={`${name} 图标`}
          width={size}
          height={size}
        />
      </div>
    )
  }
  
  // 如果都没有，使用默认的文件夹图标
  return (
    <div style={containerStyle} className={className}>
      <Folder 
        size={size} 
        aria-label={`${name} 默认图标`}
      />
    </div>
  )
}

export default CategoryIcon