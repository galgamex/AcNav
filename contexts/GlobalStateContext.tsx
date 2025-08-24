'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { 
  STORAGE_KEYS, 
  getFromLocalStorage, 
  getFromSessionStorage, 
  getCachedJSONFromLocalStorage, 
  saveToLocalStorage, 
  saveToSessionStorage, 
  saveCachedJSONToLocalStorage,
  CACHE_CONFIG 
} from '@/lib/storage';

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
  
  // 导航页面状态
  navigationPages: Array<{
    id: number;
    name: string;
    slug: string;
    title: string;
    isActive: boolean;
  }>;
  
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
    navigationPages: boolean;
  };
  
  // 错误状态
  hasError: {
    logo: boolean;
    sidebar: boolean;
    navigationPages: boolean;
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
    
    // 导航页面相关操作
    fetchNavigationPages: (force?: boolean) => Promise<void>;
    
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

// 从存储中读取状态的工具函数
const loadStateFromStorage = () => {
  // 从localStorage读取主题状态
  const theme = getFromLocalStorage(STORAGE_KEYS.THEME);
  const isDark = theme === 'dark' || (!theme && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  // 从localStorage读取侧边栏折叠状态
  const sidebarCollapsed = getFromLocalStorage(STORAGE_KEYS.SIDEBAR_COLLAPSED);
  const isSidebarCollapsed = sidebarCollapsed === 'true';
  
  // 从sessionStorage读取移动端抽屉状态（会话级别）
  const mobileDrawerOpen = getFromSessionStorage(STORAGE_KEYS.MOBILE_DRAWER_OPEN);
  const isMobileDrawerOpen = mobileDrawerOpen === 'true';
  
  // 从localStorage读取导航页面数据（缓存）
  const navigationPages = getCachedJSONFromLocalStorage<any[]>(
    STORAGE_KEYS.NAVIGATION_PAGES, 
    CACHE_CONFIG.NAVIGATION_PAGES
  ) || [];
  
  // 从localStorage读取侧边栏设置（缓存）
  const sidebarSettings = getCachedJSONFromLocalStorage<{
    sidebarCategories: any[];
    customLinks: any[];
  }>(
    STORAGE_KEYS.SIDEBAR_SETTINGS, 
    CACHE_CONFIG.SIDEBAR_SETTINGS
  ) || { sidebarCategories: [], customLinks: [] };
  
  // 从localStorage读取Logo设置（缓存）
  const logoSettings = getCachedJSONFromLocalStorage<{
    siteName: string;
    logoUrl: string;
    logoText: string;
  }>(
    STORAGE_KEYS.LOGO_SETTINGS, 
    CACHE_CONFIG.LOGO_SETTINGS
  ) || { siteName: 'AcMoe导航', logoUrl: '/Logo/Logo.png', logoText: '' };
  
  return {
    isDark,
    isSidebarCollapsed,
    isMobileDrawerOpen,
    navigationPages,
    sidebarSettings,
    logoSettings
  };
};



// 初始状态
const getInitialState = (): GlobalState => {
  const storedState = loadStateFromStorage();
  
  return {
    logoSettings: storedState.logoSettings,
    sidebarSettings: storedState.sidebarSettings,
    navigationPages: storedState.navigationPages,
    isDark: storedState.isDark,
    isSidebarCollapsed: storedState.isSidebarCollapsed,
    isMobileDrawerOpen: storedState.isMobileDrawerOpen,
    isLoading: {
      logo: false, // 如果从存储读取到数据，则不需要加载
      sidebar: false,
      navigationPages: false
    },
    hasError: {
      logo: false,
      sidebar: false,
      navigationPages: false
    }
  };
};

// 全局状态提供者组件
export function GlobalStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GlobalState>(getInitialState);
  const dataLoadedRef = useRef({ logo: false, sidebar: false, navigationPages: false });

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
        siteName: 'AcMoe导航',
        logoUrl: '/Logo/Logo.png',
        logoText: ''
      };
      
      // 保存到localStorage缓存
      saveCachedJSONToLocalStorage(STORAGE_KEYS.LOGO_SETTINGS, logoSettings, CACHE_CONFIG.LOGO_SETTINGS);
      
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
      
      // 保存到localStorage缓存
      saveCachedJSONToLocalStorage(STORAGE_KEYS.SIDEBAR_SETTINGS, sidebarSettings, CACHE_CONFIG.SIDEBAR_SETTINGS);
      
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

  // 获取导航页面
  const fetchNavigationPages = async (force = false) => {
    // 如果已有数据且不是强制刷新，则跳过
    if (!force && dataLoadedRef.current.navigationPages) {
      return;
    }

    try {
      setState(prev => ({
        ...prev,
        isLoading: { ...prev.isLoading, navigationPages: true },
        hasError: { ...prev.hasError, navigationPages: false }
      }));

      const response = await fetch('/api/navigation-pages?isActive=true');
      if (!response.ok) {
        throw new Error('获取导航页面失败');
      }

      const data = await response.json();
      const navigationPages = data.navigationPages || [];
      
      // 保存到localStorage缓存
      saveCachedJSONToLocalStorage(STORAGE_KEYS.NAVIGATION_PAGES, navigationPages, CACHE_CONFIG.NAVIGATION_PAGES);
      
      setState(prev => ({
        ...prev,
        navigationPages,
        isLoading: { ...prev.isLoading, navigationPages: false }
      }));
      dataLoadedRef.current.navigationPages = true;
    } catch (error) {
      console.error('获取导航页面失败:', error);
      setState(prev => ({
        ...prev,
        isLoading: { ...prev.isLoading, navigationPages: false },
        hasError: { ...prev.hasError, navigationPages: true }
      }));
    }
  };

  // 切换主题
  const toggleTheme = () => {
    const newTheme = !state.isDark;
    setState(prev => ({ ...prev, isDark: newTheme }));
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_KEYS.THEME, 'light');
    }
  };

  // 切换侧边栏
  const toggleSidebar = () => {
    const newCollapsed = !state.isSidebarCollapsed;
    setState(prev => ({ ...prev, isSidebarCollapsed: newCollapsed }));
    saveToLocalStorage(STORAGE_KEYS.SIDEBAR_COLLAPSED, newCollapsed.toString());
  };

  // 设置侧边栏折叠状态
  const setSidebarCollapsed = (collapsed: boolean) => {
    setState(prev => ({ ...prev, isSidebarCollapsed: collapsed }));
    saveToLocalStorage(STORAGE_KEYS.SIDEBAR_COLLAPSED, collapsed.toString());
  };

  // 切换移动端抽屉
  const toggleMobileDrawer = () => {
    const newOpen = !state.isMobileDrawerOpen;
    setState(prev => ({ ...prev, isMobileDrawerOpen: newOpen }));
    saveToSessionStorage(STORAGE_KEYS.MOBILE_DRAWER_OPEN, newOpen.toString());
  };

  // 设置移动端抽屉状态
  const setMobileDrawerOpen = (open: boolean) => {
    setState(prev => ({ ...prev, isMobileDrawerOpen: open }));
    saveToSessionStorage(STORAGE_KEYS.MOBILE_DRAWER_OPEN, open.toString());
  };

  // 初始化所有数据
  const initializeAllData = async () => {
    await Promise.all([
      fetchLogoSettings(),
      fetchSidebarSettings(),
      fetchNavigationPages()
    ]);
  };

  // 初始化主题和数据
  useEffect(() => {
    let isMounted = true;
    
    const initializeApp = async () => {
      // 立即应用主题到DOM
      if (state.isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      if (isMounted) {
        // 检查是否已有缓存数据，如果有则设置对应的loading状态为false
        setState(prev => ({
          ...prev,
          isLoading: {
            logo: !dataLoadedRef.current.logo,
            sidebar: !dataLoadedRef.current.sidebar,
            navigationPages: !dataLoadedRef.current.navigationPages
          }
        }));
        
        // 强制初始化所有数据（第一次加载）
        await Promise.all([
          fetchLogoSettings(true),
          fetchSidebarSettings(true),
          fetchNavigationPages(true)
        ]);
      }
    };
    
    initializeApp();
    
    return () => {
      isMounted = false;
    };
  }, []); // 移除 state.isDark 依赖，只在组件挂载时执行一次

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleThemeChange = (e: MediaQueryListEvent) => {
      // 只有在没有用户手动设置主题时才跟随系统
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
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
      fetchNavigationPages,
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
