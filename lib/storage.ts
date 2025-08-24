// 存储键名常量
export const STORAGE_KEYS = {
  THEME: 'theme',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  MOBILE_DRAWER_OPEN: 'mobile_drawer_open',
  NAVIGATION_PAGES: 'navigation_pages',
  SIDEBAR_SETTINGS: 'sidebar_settings',
  LOGO_SETTINGS: 'logo_settings'
};

// 检查是否在浏览器环境
export const isBrowser = typeof window !== 'undefined';

// 从localStorage读取数据
export const getFromLocalStorage = (key: string): string | null => {
  if (!isBrowser) return null;
  
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn(`从localStorage读取${key}失败:`, error);
    return null;
  }
};

// 保存数据到localStorage
export const saveToLocalStorage = (key: string, value: string): void => {
  if (!isBrowser) return;
  
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`保存到localStorage失败:`, error);
  }
};

// 从sessionStorage读取数据
export const getFromSessionStorage = (key: string): string | null => {
  if (!isBrowser) return null;
  
  try {
    return sessionStorage.getItem(key);
  } catch (error) {
    console.warn(`从sessionStorage读取${key}失败:`, error);
    return null;
  }
};

// 保存数据到sessionStorage
export const saveToSessionStorage = (key: string, value: string): void => {
  if (!isBrowser) return;
  
  try {
    sessionStorage.setItem(key, value);
  } catch (error) {
    console.warn(`保存到sessionStorage失败:`, error);
  }
};

// 从localStorage读取JSON数据
export const getJSONFromLocalStorage = <T>(key: string): T | null => {
  const data = getFromLocalStorage(key);
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch (error) {
    console.warn(`解析localStorage中的${key}失败:`, error);
    return null;
  }
};

// 保存JSON数据到localStorage
export const saveJSONToLocalStorage = <T>(key: string, value: T): void => {
  try {
    const jsonString = JSON.stringify(value);
    saveToLocalStorage(key, jsonString);
  } catch (error) {
    console.warn(`保存JSON到localStorage失败:`, error);
  }
};

// 从sessionStorage读取JSON数据
export const getJSONFromSessionStorage = <T>(key: string): T | null => {
  const data = getFromSessionStorage(key);
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch (error) {
    console.warn(`解析sessionStorage中的${key}失败:`, error);
    return null;
  }
};

// 保存JSON数据到sessionStorage
export const saveJSONToSessionStorage = <T>(key: string, value: T): void => {
  try {
    const jsonString = JSON.stringify(value);
    saveToSessionStorage(key, jsonString);
  } catch (error) {
    console.warn(`保存JSON到sessionStorage失败:`, error);
  }
};

// 检查缓存是否过期
export const isCacheExpired = (timestamp: number, maxAge: number): boolean => {
  return Date.now() - timestamp > maxAge;
};

// 缓存配置
export const CACHE_CONFIG = {
  NAVIGATION_PAGES: 24 * 60 * 60 * 1000, // 24小时
  SIDEBAR_SETTINGS: 60 * 60 * 1000, // 1小时
  LOGO_SETTINGS: 60 * 60 * 1000, // 1小时
};

// 读取带缓存的JSON数据
export const getCachedJSONFromLocalStorage = <T>(
  key: string, 
  maxAge: number = CACHE_CONFIG.NAVIGATION_PAGES
): T | null => {
  const cached = getJSONFromLocalStorage<{ data: T; timestamp: number }>(key);
  
  if (!cached || !cached.timestamp || isCacheExpired(cached.timestamp, maxAge)) {
    return null;
  }
  
  return cached.data;
};

// 保存带缓存的JSON数据
export const saveCachedJSONToLocalStorage = <T>(
  key: string, 
  data: T, 
  maxAge: number = CACHE_CONFIG.NAVIGATION_PAGES
): void => {
  const cached = {
    data,
    timestamp: Date.now()
  };
  
  saveJSONToLocalStorage(key, cached);
};

// 清除缓存
export const clearCache = (key: string): void => {
  if (!isBrowser) return;
  
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`清除缓存${key}失败:`, error);
  }
};

// 清除所有缓存
export const clearAllCache = (): void => {
  if (!isBrowser) return;
  
  try {
    Object.values(STORAGE_KEYS).forEach((key: string) => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.warn('清除所有缓存失败:', error);
  }
};
