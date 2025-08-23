'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

// 全局状态接口
interface GlobalState {

  
  // Logo相关状态
  logoSettings: {
    siteName: string;
    logoUrl: string;
    logoText: string;
  };
  
  // Sidebar相关状态
  sidebarSettings: {
    sidebarCategories: Array<{
      id: string;
      name: string;
      categoryId?: number;
      isCustom: boolean;
      parentId?: number | null;
      children?: any[];
      icon?: string;
      iconUrl?: string;
      websiteCount?: number;
    }>;
    customLinks: Array<{
      id: string;
      name: string;
      url: string;
      description?: string;
    }>;
  };
  
  // 主题状态
  isDark: boolean;
  
  // 侧边栏折叠状态
  isSidebarCollapsed: boolean;
  
  // 移动端抽屉状态
  isMobileDrawerOpen: boolean;
  
  // 加载状态
  isLoading: {
    logo: boolean;
    sidebar: boolean;
  };
  
  // 错误状态
  hasError: {
    logo: boolean;
    sidebar: boolean;
  };
}

// 全局状态上下文接口
interface GlobalStateContextType {
  state: GlobalState;
  actions: {

    
    // Logo相关操作
    fetchLogoSettings: (force?: boolean) => Promise<void>;
    
    // Sidebar相关操作
    fetchSidebarSettings: (force?: boolean) => Promise<void>;
    
    // 主题相关操作
    toggleTheme: () => void;
    
      // 侧边栏相关操作
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // 移动端抽屉相关操作
  toggleMobileDrawer: () => void;
  setMobileDrawerOpen: (open: boolean) => void;
    
    // 初始化所有数据
    initializeAllData: () => Promise<void>;
  };
}

// 创建上下文
const GlobalStateContext = createContext<GlobalStateContextType | undefined>(undefined);

// 初始状态
const initialState: GlobalState = {

  logoSettings: {
    siteName: 'AcNavs',
    logoUrl: '/Logo/Logo.png',
    logoText: ''
  },
  sidebarSettings: {
    sidebarCategories: [],
    customLinks: []
  },
  isDark: false,
  isSidebarCollapsed: false,
  isMobileDrawerOpen: false,
  isLoading: {
    logo: true,
    sidebar: true
  },
  hasError: {
    logo: false,
    sidebar: false
  }
};

// 全局状态提供者组件
export function GlobalStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GlobalState>(initialState);
  const dataLoadedRef = useRef({ logo: false, sidebar: false });



  // 获取Logo设置
  const fetchLogoSettings = async (force = false) => {
    // 如果已有数据且不是强制刷新，则跳过
    if (!force && dataLoadedRef.current.logo) {
      return;
    }

    try {
      setState(prev => ({
        ...prev,
        isLoading: { ...prev.isLoading, logo: true },
        hasError: { ...prev.hasError, logo: false }
      }));

      // 直接使用默认Logo设置，不再调用API
      const logoSettings = {
        siteName: 'AcNavs',
        logoUrl: '/Logo/Logo.png',
        logoText: ''
      };
      
      setState(prev => ({
        ...prev,
        logoSettings,
        isLoading: { ...prev.isLoading, logo: false }
      }));
      dataLoadedRef.current.logo = true;
    } catch (error) {
      console.error('获取Logo设置失败:', error);
      setState(prev => ({
        ...prev,
        isLoading: { ...prev.isLoading, logo: false },
        hasError: { ...prev.hasError, logo: true }
      }));
    }
  };

  // 获取侧边栏设置
  const fetchSidebarSettings = async (force = false) => {
    // 如果已有数据且不是强制刷新，则跳过
    if (!force && dataLoadedRef.current.sidebar) {
      return;
    }

    try {
      setState(prev => ({
        ...prev,
        isLoading: { ...prev.isLoading, sidebar: true },
        hasError: { ...prev.hasError, sidebar: false }
      }));

      // 直接使用默认侧边栏设置，不再调用API
      const sidebarSettings = {
        sidebarCategories: [],
        customLinks: []
      };
      
      setState(prev => ({
        ...prev,
        sidebarSettings,
        isLoading: { ...prev.isLoading, sidebar: false }
      }));
      dataLoadedRef.current.sidebar = true;
    } catch (error) {
      console.error('获取侧边栏设置失败:', error);
      setState(prev => ({
        ...prev,
        isLoading: { ...prev.isLoading, sidebar: false },
        hasError: { ...prev.hasError, sidebar: true }
      }));
    }
  };

  // 切换主题
  const toggleTheme = () => {
    const newTheme = !state.isDark;
    setState(prev => ({ ...prev, isDark: newTheme }));
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // 切换侧边栏
  const toggleSidebar = () => {
    setState(prev => ({ ...prev, isSidebarCollapsed: !prev.isSidebarCollapsed }));
  };

  // 设置侧边栏折叠状态
  const setSidebarCollapsed = (collapsed: boolean) => {
    setState(prev => ({ ...prev, isSidebarCollapsed: collapsed }));
  };

  // 切换移动端抽屉
  const toggleMobileDrawer = () => {
    setState(prev => ({ ...prev, isMobileDrawerOpen: !prev.isMobileDrawerOpen }));
  };

  // 设置移动端抽屉状态
  const setMobileDrawerOpen = (open: boolean) => {
    setState(prev => ({ ...prev, isMobileDrawerOpen: open }));
  };

  // 初始化所有数据
  const initializeAllData = async () => {
    await Promise.all([
      fetchLogoSettings(),
      fetchSidebarSettings()
    ]);
  };

  // 初始化主题和数据
  useEffect(() => {
    let isMounted = true;
    
    const initializeApp = async () => {
      // 初始化主题 - 检查当前DOM状态而不是重新计算
      const isCurrentlyDark = document.documentElement.classList.contains('dark');
      
      if (isMounted) {
        setState(prev => ({ ...prev, isDark: isCurrentlyDark }));
        
        // 检查是否已有缓存数据，如果有则设置对应的loading状态为false
        setState(prev => ({
          ...prev,
          isLoading: {
            logo: !dataLoadedRef.current.logo,
            sidebar: !dataLoadedRef.current.sidebar
          }
        }));
        
        // 强制初始化所有数据（第一次加载）
        await Promise.all([
          fetchLogoSettings(true),
          fetchSidebarSettings(true)
        ]);
      }
    };
    
    initializeApp();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleThemeChange = (e: MediaQueryListEvent) => {
      // 只有在没有用户手动设置主题时才跟随系统
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        const shouldBeDark = e.matches;
        setState(prev => ({ ...prev, isDark: shouldBeDark }));
        
        if (shouldBeDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };
    
    mediaQuery.addEventListener('change', handleThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange);
    };
  }, []);

  const contextValue: GlobalStateContextType = {
    state,
    actions: {

      fetchLogoSettings,
      fetchSidebarSettings,
      toggleTheme,
      toggleSidebar,
      setSidebarCollapsed,
      toggleMobileDrawer,
      setMobileDrawerOpen,
      initializeAllData
    }
  };

  return (
    <GlobalStateContext.Provider value={contextValue}>
      {children}
    </GlobalStateContext.Provider>
  );
}

// 自定义Hook
export function useGlobalState() {
  const context = useContext(GlobalStateContext);
  if (context === undefined) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
}
