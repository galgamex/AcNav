import { createClient, RedisClientType } from 'redis';

// Redis客户端实例
let redisInstance: RedisClientType | null = null;

// 初始化Redis连接
export async function initRedis(): Promise<RedisClientType | any> {
  if (redisInstance && redisInstance.isOpen) {
    return redisInstance;
  }

  try {
    const redisConfig: any = {
      url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`,
      database: parseInt(process.env.REDIS_DB || '0')
    };
    
    // 只有在真正有密码时才添加password参数
    if (process.env.REDIS_PASSWORD && process.env.REDIS_PASSWORD.trim() !== '') {
      redisConfig.password = process.env.REDIS_PASSWORD;
    }
    
    redisInstance = createClient(redisConfig);

    redisInstance.on('error', (error: any) => {
      console.error('Redis连接错误:', error);
    });

    redisInstance.on('connect', () => {
      console.log('Redis连接成功');
    });

    redisInstance.on('ready', () => {
      console.log('Redis准备就绪');
    });

    redisInstance.on('close', () => {
      console.log('Redis连接关闭');
      redisInstance = null;
    });

    redisInstance.on('reconnecting', () => {
      console.log('Redis重新连接中...');
    });

    // 连接到Redis
    await redisInstance.connect();
    
  } catch (error) {
    console.error('初始化Redis失败:', error);
    // 如果Redis不可用，返回一个模拟的Redis实例
    return createMockRedis();
  }

  return redisInstance;
}

// 创建模拟Redis实例（当Redis不可用时使用）
function createMockRedis(): any {
  const mockRedis = {
    get: async () => null,
    set: async () => 'OK',
    del: async () => 1,
    exists: async () => 0,
    expire: async () => 1,
    ttl: async () => -1,
    keys: async () => [],
    flushdb: async () => 'OK',
    ping: async () => 'PONG',
    quit: async () => 'OK',
    disconnect: () => {},
    on: () => {},
    off: () => {},
    emit: () => false
  } as any;

  return mockRedis;
}

// 获取Redis客户端实例
export async function getRedisClient(): Promise<RedisClientType | any> {
  if (!redisInstance || !redisInstance.isOpen) {
    return await initRedis();
  }
  return redisInstance;
}

// 导出Redis实例（保持向后兼容）
let _redisClient: RedisClientType | any = null;

// 延迟初始化Redis客户端
export const redisClient = new Proxy({} as any, {
  get(target, prop) {
    if (!_redisClient) {
      _redisClient = createMockRedis();
      // 异步初始化真实的Redis客户端
      initRedis().then(client => {
        _redisClient = client;
      }).catch(() => {
        // 保持使用模拟客户端
      });
    }
    return _redisClient[prop];
  }
});

// 优雅关闭Redis连接
export async function closeRedis(): Promise<void> {
  if (redisInstance) {
    try {
      await redisInstance.quit();
      redisInstance = null;
      console.log('Redis连接已关闭');
    } catch (error) {
      console.error('关闭Redis连接失败:', error);
    }
  }
}

// 检查Redis连接状态
export async function checkRedisConnection(): Promise<boolean> {
  try {
    const client = await getRedisClient();
    const result = await client.ping();
    return result === 'PONG';
  } catch (error) {
    console.error('Redis连接检查失败:', error);
    return false;
  }
}

// Cache service with typed keys
export class CacheService {
  static keys = {
    categories: () => 'categories',
    websites: () => 'websites',
    websitesByCategory: (categoryId: number) => `websites:category:${categoryId}`,
    categoryWebsites: (categoryId: number) => `websites:category:${categoryId}`,
    recommendedWebsites: () => 'websites:recommended',
    recommended: () => 'websites:recommended',
    searchResults: (query: string) => `search:${query}`,
    websiteVisits: (websiteId: number) => `visits:${websiteId}`
  };

  static async get<T>(key: string): Promise<T | null> {
    try {
      const client = await getRedisClient();
      const value = await client.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  static async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      const client = await getRedisClient();
      await client.setEx(key, ttl, JSON.stringify(value))
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  static async del(key: string): Promise<void> {
    try {
      const client = await getRedisClient();
      await client.del(key)
    } catch (error) {
      console.error('Cache del error:', error)
    }
  }

  static async clear(): Promise<void> {
    try {
      const client = await getRedisClient();
      await client.flushAll()
    } catch (error) {
      console.error('Cache clear error:', error)
    }
  }
}

// Export cache instance for backward compatibility
export const cache = {
  get: CacheService.get,
  set: CacheService.set,
  del: CacheService.del,
  clear: CacheService.clear,
};

// Export redis for backward compatibility
export const redis = redisClient;