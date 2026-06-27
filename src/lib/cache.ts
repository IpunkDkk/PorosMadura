import Redis from 'ioredis'

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
let redis: Redis | null = null

export function getRedisClient(): Redis | null {
  if (redis) return redis
  if (!process.env.REDIS_URL) return null
  try {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        return Math.min(times * 50, 2000)
      },
      lazyConnect: true,
    })
    return redis
  } catch {
    return null
  }
}

export async function getCached(key: string): Promise<string | null> {
  const client = getRedisClient()
  if (!client) return null
  try { return await client.get(key) } catch { return null }
}

export async function setCache(key: string, value: string, ttlSeconds = 300): Promise<void> {
  const client = getRedisClient()
  if (!client) return
  try { await client.setex(key, ttlSeconds, value) } catch { /* silent */ }
}

export async function invalidateCache(key: string): Promise<void> {
  const client = getRedisClient()
  if (!client) return
  try { await client.del(key) } catch { /* silent */ }
}

export async function invalidateCachePattern(pattern: string): Promise<void> {
  const client = getRedisClient()
  if (!client) return
  try {
    const keys = await client.keys(pattern)
    if (keys.length > 0) await client.del(...keys)
  } catch { /* silent */ }
}

export const CacheKeys = {
  homepage: () => 'homepage',
  category: (slug: string, page: number) => `category:${slug}:page:${page}`,
  tag: (slug: string, page: number) => `tag:${slug}:page:${page}`,
  author: (slug: string, page: number) => `author:${slug}:page:${page}`,
  post: (slug: string) => `post:${slug}`,
  popular: () => 'popular-posts',
  breaking: () => 'breaking-news',
  featured: () => 'featured-posts',
  views: (id: string) => `views:post:${id}`,
  ads: (placement: string) => `ads:${placement}`,
}
