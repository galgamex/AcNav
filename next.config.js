/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用压缩
  compress: true,
  
  // 优化构建输出
  // output: 'standalone', // 在Windows上可能导致权限问题，暂时禁用
  
  // 启用构建优化
  productionBrowserSourceMaps: false,
  
  // 启用实验性功能
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    // 启用优化的包导入
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', 'recharts'],
    // 启用更激进的tree shaking
    // optimizeCss: true, // 暂时禁用，因为缺少critters依赖
  },
  
  // 图片优化配置
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'cdn.sa.net',
      },
    ],
  },
  
  // 启用静态优化
  trailingSlash: false,
  
  // Webpack配置优化
  webpack: (config, { dev, isServer }) => {
    // 生产环境优化
    if (!dev) {
      // 启用更激进的JavaScript压缩
      config.optimization = {
        ...config.optimization,
        minimize: true,
        minimizer: [
          ...config.optimization.minimizer,
        ],
        // 启用模块连接优化
        concatenateModules: true,
        // 启用作用域提升
        sideEffects: false,
        // 启用更好的tree shaking
        usedExports: true,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            // React相关库单独打包
            react: {
              test: /[\/]node_modules[\/](react|react-dom)[\/]/,
              name: 'react',
              chunks: 'all',
              priority: 20,
            },
            // UI组件库单独打包
            ui: {
              test: /[\/]node_modules[\/](@radix-ui|lucide-react)[\/]/,
              name: 'ui',
              chunks: 'all',
              priority: 15,
            },
            // 图表库单独打包
            charts: {
              test: /[\/]node_modules[\/](recharts)[\/]/,
              name: 'charts',
              chunks: 'async',
              priority: 10,
            },
            // 其他第三方库
            vendor: {
              test: /[\/]node_modules[\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 5,
            },
          },
        },
      };
    }
    return config;
  },
  
  async rewrites() {
    return [
      {
        source: '/admin/:path*',
        destination: '/admin/:path*',
      },
    ];
  },
};

module.exports = nextConfig;