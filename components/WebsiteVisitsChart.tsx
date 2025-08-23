'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DailyStats {
  date: string;
  mobileVisits: number;
  desktopVisits: number;
  totalVisits: number;
}

interface TotalStats {
  totalMobileVisits: number;
  totalDesktopVisits: number;
  totalVisits: number;
  averageVisitsPerDay: number;
}

interface WebsiteInfo {
  id: number;
  name: string;
  url: string;
}

interface VisitsData {
  website: WebsiteInfo;
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };
  dailyStats: DailyStats[];
  totalStats: TotalStats;
}

interface WebsiteVisitsChartProps {
  websiteId: number;
  days?: number;
}

// 自定义Tooltip组件 - 使用useCallback优化
const CustomTooltip = React.memo(({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 mb-2">
          {new Date(label).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
        <div className="space-y-1 text-sm">
          <p className="flex items-center">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            移动端访问: <span className="font-medium ml-1">{data.mobileVisits}</span>
          </p>
          <p className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            PC端访问: <span className="font-medium ml-1">{data.desktopVisits}</span>
          </p>
          <div className="border-t pt-1 mt-2">
            <p className="font-medium text-gray-900">
              总访问数: {data.totalVisits}
            </p>
          </div>
        </div>
      </div>
    );
  }
  return null;
});

CustomTooltip.displayName = 'CustomTooltip';

function WebsiteVisitsChart({ websiteId, days = 30 }: WebsiteVisitsChartProps) {
  const [data, setData] = useState<VisitsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // 使用useCallback优化fetchData函数
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/websites/${websiteId}/stats?days=${days}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || '获取数据失败');
      }
      
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error('数据格式错误');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  }, [websiteId, days]);

  // 使用useMemo优化图表数据格式化 - 必须在所有条件返回之前调用
  const chartData = useMemo(() => {
    if (!data) return [];
    return data.dailyStats.map(stat => ({
      ...stat,
      date: new Date(stat.date).toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric'
      })
    }));
  }, [data]);

  // 延迟加载机制 - 避免在页面加载时立即渲染图表
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100); // 延迟100ms后开始加载

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isVisible) {
      fetchData();
    }
  }, [fetchData, isVisible]);

  if (!isVisible || loading) {
    return (
      <Card className="bg-transparent border-transparent shadow-none">
        <CardHeader>
          <CardTitle>访问统计</CardTitle>
          <CardDescription>
            {!isVisible ? '准备加载...' : '加载中...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-transparent border-transparent shadow-none">
        <CardHeader>
          <CardTitle>访问统计</CardTitle>
          <CardDescription>数据加载失败</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-500 mb-2">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                重试
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Card className="bg-transparent border-transparent shadow-none">
      <CardHeader>
        <CardTitle>访问统计</CardTitle>
        <CardDescription>
          {data.website.name} - 最近 {data.period.days} 天的访问数据
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 统计概览 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{data.totalStats.totalVisits}</p>
            <p className="text-sm text-gray-600">总访问数</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{data.totalStats.totalDesktopVisits}</p>
            <p className="text-sm text-gray-600">PC端访问</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{data.totalStats.totalMobileVisits}</p>
            <p className="text-sm text-gray-600">移动端访问</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">{data.totalStats.averageVisitsPerDay}</p>
            <p className="text-sm text-gray-600">日均访问</p>
          </div>
        </div>

        {/* 条形图 - 使用懒加载优化性能 */}
        <div className="h-80">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="mobileVisits" 
                  stackId="a" 
                  fill="#3b82f6" 
                  name="移动端访问"
                  radius={[0, 0, 0, 0]}
                />
                <Bar 
                  dataKey="desktopVisits" 
                  stackId="a" 
                  fill="#10b981" 
                  name="PC端访问"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              暂无访问数据
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// 使用React.memo优化组件性能
export default React.memo(WebsiteVisitsChart);