'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Admin {
  id: number;
  username: string;
}

export function useAuth() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const adminData = await response.json();
        setAdmin(adminData);
      } else {
        setAdmin(null);
        // 如果未认证，重定向到登录页
        if (response.status === 401) {
          router.push('/admin/login');
        }
      }
    } catch (error) {
      console.error('认证检查失败:', error);
      setAdmin(null);
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setAdmin(null);
      router.push('/admin/login');
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  return {
    admin,
    loading,
    checkAuth,
    logout,
    isAuthenticated: !!admin
  };
}