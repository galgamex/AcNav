import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Prisma客户端配置，包含连接池和性能优化设置
const createPrismaClient = () => {
  // 确定日志级别
  const enableQueryLogging = process.env.ENABLE_QUERY_LOGGING === 'true'
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  let logLevel: Array<'query' | 'info' | 'warn' | 'error'> = ['error']
  
  if (isDevelopment && enableQueryLogging) {
    logLevel = ['query', 'info', 'warn', 'error']
  } else if (isDevelopment) {
    logLevel = ['info', 'warn', 'error']
  }

  return new PrismaClient({
    log: logLevel,
    errorFormat: 'pretty',
    // 连接池和超时配置通过DATABASE_URL参数传递
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// 在开发环境中复用同一个实例以避免热重载时创建过多连接
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// 优雅关闭数据库连接
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
})