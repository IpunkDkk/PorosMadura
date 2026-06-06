# PorosMadura Phase 4 — Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** Meilisearch for full-text search, Redis caching, R2/S3 storage adapter, production Docker Compose, deploy config

---

### Task 4.1: Meilisearch Setup

**Files:**
- Create: `src/lib/search.ts`
- Create: `src/hooks/syncPostToSearch.ts`

- [ ] **Step 1: Create Meilisearch client**

```ts
// src/lib/search.ts
import { MeiliSearch } from 'meilisearch'

const host = process.env.MEILISEARCH_HOST || 'http://localhost:7700'
const apiKey = process.env.MEILISEARCH_API_KEY || ''

export const searchClient = new MeiliSearch({ host, apiKey })

const POSTS_INDEX = 'posts'

export async function indexPost(post: Record<string, unknown>) {
  try {
    const index = searchClient.index(POSTS_INDEX)
    await index.addDocuments([{
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      contentPlainText: post.contentPlainText || '',
      category: typeof post.category === 'object' ? (post.category as Record<string, unknown>)?.name : post.category,
      categorySlug: typeof post.category === 'object' ? (post.category as Record<string, unknown>)?.slug : '',
      tags: Array.isArray(post.tags) ? post.tags.map((t: Record<string, string>) => t.name).filter(Boolean) : [],
      author: typeof post.author === 'object' ? (post.author as Record<string, unknown>)?.name : '',
      authorSlug: typeof post.author === 'object' ? (post.author as Record<string, unknown>)?.slug : '',
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      featuredImage: typeof post.featuredImage === 'object'
        ? (post.featuredImage as Record<string, unknown>)?.url as string
        : null,
      url: `/${typeof post.category === 'object' ? (post.category as Record<string, unknown>)?.slug : ''}/${post.slug}`,
      isFeatured: post.isFeatured,
      isBreakingNews: post.isBreakingNews,
    }])
  } catch (err) {
    console.error('Failed to index post to Meilisearch:', err)
  }
}

export async function removePostFromIndex(postId: string) {
  try {
    const index = searchClient.index(POSTS_INDEX)
    await index.deleteDocument(postId)
  } catch (err) {
    console.error('Failed to remove post from Meilisearch:', err)
  }
}

export async function searchPosts(query: string, options?: {
  category?: string
  page?: number
  limit?: number
}) {
  try {
    const index = searchClient.index(POSTS_INDEX)
    const filters: string[] = []
    if (options?.category) {
      filters.push(`categorySlug = "${options.category}"`)
    }

    const result = await index.search(query, {
      filter: filters.length > 0 ? filters.join(' AND ') : undefined,
      page: options?.page || 1,
      hitsPerPage: options?.limit || 10,
      sort: ['publishedAt:desc'],
    })

    return {
      items: result.hits,
      total: result.totalHits || 0,
      page: result.page || 1,
      limit: result.hitsPerPage || 10,
    }
  } catch (err) {
    console.error('Search failed:', err)
    return { items: [], total: 0, page: 1, limit: 10 }
  }
}
```

- [ ] **Step 2: Create sync-to-search Payload hook**

```ts
// src/hooks/syncPostToSearch.ts
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

export const syncPostToSearch: CollectionAfterChangeHook = async ({ doc, operation }) => {
  const shouldIndex = doc.status === 'published' &&
    doc.publishedAt &&
    new Date(doc.publishedAt) <= new Date() &&
    doc.allowIndex !== false

  if (shouldIndex) {
    const { indexPost } = await import('@/lib/search')
    await indexPost(doc)
  } else if (operation === 'update' && doc.status !== 'published') {
    const { removePostFromIndex } = await import('@/lib/search')
    await removePostFromIndex(doc.id)
  }

  return doc
}

export const removePostFromSearch: CollectionAfterDeleteHook = async ({ doc }) => {
  const { removePostFromIndex } = await import('@/lib/search')
  await removePostFromIndex(doc.id)
}
```

- [ ] **Step 3: Apply hooks to Posts collection**

In `src/collections/Posts.ts`, add:
```ts
import { syncPostToSearch, removePostFromSearch } from '@/hooks/syncPostToSearch'

export const Posts: CollectionConfig = {
  slug: 'posts',
  hooks: {
    afterChange: [syncPostToSearch],
    afterDelete: [removePostFromSearch],
  },
  // ...
}
```

- [ ] **Step 4: Create search API route**

```ts
// src/app/api/search/route.ts
import { searchPosts } from '@/lib/search'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') || ''
  const category = searchParams.get('category') || undefined
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')

  if (!q.trim()) {
    return NextResponse.json({ items: [], total: 0, page: 1, limit })
  }

  const results = await searchPosts(q, { category, page, limit })
  return NextResponse.json(results, {
    headers: { 'Cache-Control': 'public, max-age=60' },
  })
}
```


### Task 4.2: Redis Cache Setup

**Files:**
- Create: `src/lib/cache.ts`
- Create: `src/hooks/invalidateCache.ts`

- [ ] **Step 1: Create Redis cache client**

```ts
// src/lib/cache.ts
import Redis from 'ioredis'

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

let redis: Redis | null = null

function getRedis(): Redis | null {
  if (redis) return redis
  if (!process.env.REDIS_URL) {
    // Redis not configured, run in no-cache mode
    return null
  }
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
  const client = getRedis()
  if (!client) return null
  try {
    return await client.get(key)
  } catch {
    return null
  }
}

export async function setCache(key: string, value: string, ttlSeconds = 300): Promise<void> {
  const client = getRedis()
  if (!client) return
  try {
    await client.setex(key, ttlSeconds, value)
  } catch {
    // Silently fail
  }
}

export async function invalidateCache(key: string): Promise<void> {
  const client = getRedis()
  if (!client) return
  try {
    await client.del(key)
  } catch {
    // Silently fail
  }
}

export async function invalidateCachePattern(pattern: string): Promise<void> {
  const client = getRedis()
  if (!client) return
  try {
    const keys = await client.keys(pattern)
    if (keys.length > 0) {
      await client.del(...keys)
    }
  } catch {
    // Silently fail
  }
}

// Cache key helpers
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
}
```

- [ ] **Step 2: Create cache invalidation hook**

```ts
// src/hooks/invalidateCache.ts
import type { CollectionAfterChangeHook } from 'payload'
import { invalidateCache } from '@/lib/cache'

export const invalidatePostCache: CollectionAfterChangeHook = async ({ doc }) => {
  if (doc.slug) {
    await invalidateCache(`post:${doc.slug}`)
  }
  await invalidateCache('homepage')
  await invalidateCache('popular-posts')
  await invalidateCache('breaking-news')
  await invalidateCache('featured-posts')
  return doc
}

export const invalidateCategoryCache: CollectionAfterChangeHook = async ({ doc }) => {
  await invalidateCache('homepage')
  if (doc.slug) {
    await invalidateCache(`category:${doc.slug}:*`)
  }
  return doc
}

export const invalidateTagCache: CollectionAfterChangeHook = async ({ doc }) => {
  await invalidateCache('homepage')
  if (doc.slug) {
    await invalidateCache(`tag:${doc.slug}:*`)
  }
  return doc
}
```

- [ ] **Step 3: Add cache hooks to collections**

```ts
// In src/collections/Posts.ts
import { invalidatePostCache } from '@/hooks/invalidateCache'

export const Posts: CollectionConfig = {
  slug: 'posts',
  hooks: {
    afterChange: [syncPostToSearch, invalidatePostCache],
    afterDelete: [removePostFromSearch],
  },
  // ...
}

// In src/collections/Categories.ts
import { invalidateCategoryCache } from '@/hooks/invalidateCache'

export const Categories: CollectionConfig = {
  slug: 'categories',
  hooks: {
    afterChange: [invalidateCategoryCache],
  },
  // ...
}

// In src/collections/Tags.ts
import { invalidateTagCache } from '@/hooks/invalidateCache'

export const Tags: CollectionConfig = {
  slug: 'tags',
  hooks: {
    afterChange: [invalidateTagCache],
  },
  // ...
}
```


### Task 4.3: R2/S3 Storage Adapter

**Files:**
- Create: `src/lib/storage.ts`
- Create: `src/components/media/ImageWithFallback.tsx`

- [ ] **Step 1: Create storage adapter**

```ts
// src/lib/storage.ts
type StorageDriver = 'local' | 's3'

interface StorageConfig {
  driver: StorageDriver
  localDir?: string
  s3?: {
    bucket: string
    accessKeyId: string
    secretAccessKey: string
    region: string
    endpoint: string
    publicUrl: string
  }
}

export function getStorageConfig(): StorageConfig {
  const driver = (process.env.STORAGE_DRIVER as StorageDriver) || 'local'

  if (driver === 's3') {
    return {
      driver: 's3',
      s3: {
        bucket: process.env.S3_BUCKET || '',
        accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        region: process.env.S3_REGION || 'auto',
        endpoint: process.env.S3_ENDPOINT || '',
        publicUrl: process.env.S3_PUBLIC_URL || '',
      },
    }
  }

  return {
    driver: 'local',
    localDir: process.env.LOCAL_UPLOAD_DIR || '../public/media',
  }
}

export function getMediaUrl(filename: string): string {
  const config = getStorageConfig()

  if (config.driver === 's3') {
    const baseUrl = config.s3?.publicUrl || ''
    return `${baseUrl}/${filename.replace(/^\//, '')}`
  }

  // Local
  const baseUrl = process.env.NEXT_PUBLIC_MEDIA_URL || '/media'
  return `${baseUrl}/${filename.replace(/^\//, '')}`
}

export function getMediaConfig() {
  const config = getStorageConfig()

  if (config.driver === 's3') {
    return {
      disableLocalStorage: true,
      disableRevalidate: true,
      handler: async (req: Request) => {
        // Future: handle S3 upload via Payload adapter
        return new Response('S3 upload not yet configured', { status: 501 })
      },
    }
  }

  return {
    disableLocalStorage: false,
    staticDir: config.localDir || '../public/media',
  }
}
```

- [ ] **Step 2: Create ImageWithFallback component**

```tsx
// src/components/media/ImageWithFallback.tsx
'use client'

import { useState } from 'react'
import { getImageSizeUrl } from '@/lib/media'

interface ImageWithFallbackProps {
  src: Record<string, unknown> | string | null | undefined
  alt: string
  size?: 'thumbnail' | 'card' | 'hero' | 'og'
  className?: string
  width?: number
  height?: number
}

export function ImageWithFallback({
  src,
  alt,
  size = 'card',
  className = '',
  width,
  height,
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false)
  const imgSrc = error ? '/og-image.jpg' : getImageSizeUrl(src, size)

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading="lazy"
      onError={() => setError(true)}
    />
  )
}
```

### Task 4.4: Production Docker Compose

**Files:**
- Modify: `docker-compose.yml` (production-ready)

- [ ] **Step 1: Create production docker-compose**

```yaml
services:
  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_DB: porosmadura
      POSTGRES_USER: porosmadura
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - internal

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redisdata:/data
    networks:
      - internal

  meilisearch:
    image: getmeili/meilisearch:v1.10
    restart: always
    environment:
      MEILI_MASTER_KEY: ${MEILISEARCH_API_KEY}
      MEILI_NO_ANALYTICS: "true"
    volumes:
      - meilidata:/meili_data
    networks:
      - internal

  app:
    build: .
    restart: always
    ports:
      - "127.0.0.1:3000:3000"
    env_file: .env.production
    depends_on:
      - postgres
      - redis
    volumes:
      - media:/app/public/media
    networks:
      - internal
      - public

networks:
  internal:
  public:

volumes:
  pgdata:
  redisdata:
  meilidata:
  media:
```

- [ ] **Step 2: Create .env.production example**

```env
DATABASE_URI=postgres://porosmadura:${POSTGRES_PASSWORD}@postgres:5432/porosmadura
PAYLOAD_SECRET=${PAYLOAD_SECRET}
BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
BETTER_AUTH_URL=https://porosmadura.com
STORAGE_DRIVER=local
NEXT_PUBLIC_MEDIA_URL=/media
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
MEILISEARCH_HOST=http://meilisearch:7700
MEILISEARCH_API_KEY=${MEILISEARCH_API_KEY}
NEXT_PUBLIC_SITE_URL=https://porosmadura.com
```

### Task 4.5: Search Page Integration (full Meilisearch)

**File:** `src/app/(public)/search/page.tsx` (enhance with real results from Task 3.6)

- [ ] **Step 1: Enhance search page with full results display**

```tsx
'use client'

import { Search as SearchIcon } from 'lucide-react'
import { useState } from 'react'

interface SearchResult {
  id: string
  title: string
  slug: string
  excerpt?: string
  url?: string
  publishedAt?: string
  author?: string
  category?: string
  categorySlug?: string
  featuredImage?: string
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=20`)
      const data = await res.json()
      setResults(data.items || [])
      setTotal(data.total || 0)
    } catch {
      setResults([])
      setTotal(0)
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <h1 className="font-heading text-3xl font-black text-poros-navy mb-6">Pencarian</h1>
      <form onSubmit={handleSearch} className="relative mb-8">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari berita..."
          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-poros-red focus:outline-none text-lg"
          autoFocus
        />
      </form>

      {loading && <p className="text-gray-500">Mencari...</p>}

      {searched && !loading && (
        <>
          <p className="text-gray-500 mb-6">
            {total > 0
              ? `Menemukan ${total} hasil untuk "${query}"`
              : `Tidak ditemukan hasil untuk "${query}"`
            }
          </p>
          <div className="flex flex-col gap-6">
            {results.map((item) => (
              <article key={item.id} className="group flex flex-col sm:flex-row gap-4 border-b border-gray-100 pb-6">
                <div className="w-full sm:w-1/4">
                  {item.featuredImage && (
                    <img src={item.featuredImage} alt={item.title}
                      className="w-full aspect-[16/9] object-cover rounded-lg" />
                  )}
                </div>
                <div className="flex-1">
                  {item.category && (
                    <span className="text-poros-red text-xs font-bold uppercase tracking-wider">{item.category}</span>
                  )}
                  <a href={item.url || '#'}>
                    <h3 className="font-heading text-xl font-bold mt-1 group-hover:text-poros-red transition-colors">
                      {item.title}
                    </h3>
                  </a>
                  {item.excerpt && <p className="text-gray-500 mt-2 line-clamp-2">{item.excerpt}</p>}
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                    {item.author && <span>{item.author}</span>}
                    {item.publishedAt && (
                      <>
                        <span>•</span>
                        <span>{new Date(item.publishedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
```

### Task 4.6: Final Integration Test

- [ ] **Step 1: Start all services and verify**

Run: `docker compose up -d`
Expected: All 4 services (postgres, redis, meilisearch, app) running

Run: `docker compose ps`
Expected: All services healthy

- [ ] **Step 2: Verify search works end-to-end**

Publish a test post in admin → then search via:
Run: `curl "http://localhost:3000/api/search?q=test"`
Expected: Returns JSON with matching posts

- [ ] **Step 3: Verify cache invalidation**

Create a post → verify it appears on homepage → unpublish → verify it disappears

- [ ] **Step 4: Verify SEO endpoints**

Run: `curl http://localhost:3000/sitemap.xml`
Expected: Valid sitemap XML

Run: `curl http://localhost:3000/rss.xml`
Expected: Valid RSS feed

Run: `curl http://localhost:3000/robots.txt`
Expected: Valid robots.txt

- [ ] **Step 5: Verify admin login**

Open http://localhost:3000/admin/login
Expected: Custom branded PorosMadura login page

Login with Admin credentials
Expected: Redirected to Payload Admin Panel
