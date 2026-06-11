import type { BasePayload } from 'payload'
import config from '@/payload.config'
import { getPayload } from 'payload'

let cachedPayload: BasePayload | null = null

const mockPayload = {
  find: () => Promise.resolve({ docs: [], totalDocs: 0, totalPages: 0, page: 1, limit: 10 }),
  findGlobal: () => Promise.resolve({}),
  findByID: () => Promise.resolve(null),
  update: () => Promise.resolve({}),
  create: () => Promise.resolve({}),
} as unknown as BasePayload

export async function getPayloadClient(): Promise<BasePayload> {
  if (cachedPayload) return cachedPayload
  try {
    cachedPayload = await getPayload({ config })
    return cachedPayload
  } catch {
    console.warn('[Payload] DB not reachable — using mock client (build only)')
    return mockPayload
  }
}

export async function getPublishedPosts(args: {
  limit?: number
  page?: number
  sort?: string
  where?: Record<string, unknown>
}) {
  const payload = await getPayloadClient()
  return payload.find({
    collection: 'posts',
    limit: args.limit || 10,
    page: args.page || 1,
    sort: args.sort || '-publishedAt',
    where: {
      status: { equals: 'published' },
      publishedAt: { less_than_equal: new Date().toISOString() },
      ...args.where,
    },
    depth: 2,
  })
}

export async function getPostBySlug(categorySlug: string, postSlug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'posts',
    limit: 1,
    where: {
      slug: { equals: postSlug },
      status: { equals: 'published' },
      publishedAt: { less_than_equal: new Date().toISOString() },
    },
    depth: 2,
  })
  const post = result.docs[0] as Record<string, unknown> | undefined
  if (!post) return null

  const category = post.category as Record<string, unknown> | undefined
  if (categorySlug && category?.slug && category.slug !== categorySlug) return null

  return post
}

export async function getCategoryBySlug(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'categories',
    limit: 1,
    where: { slug: { equals: slug }, isActive: { equals: true } },
  })
  return result.docs[0] || null
}

export async function getTagBySlug(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'tags',
    limit: 1,
    where: { slug: { equals: slug }, isActive: { equals: true } },
  })
  return result.docs[0] || null
}

export async function getAuthorBySlug(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'authors',
    limit: 1,
    where: { slug: { equals: slug }, isActive: { equals: true } },
  })
  return result.docs[0] || null
}

export async function getPageBySlug(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'pages',
    limit: 1,
    where: { slug: { equals: slug }, status: { equals: 'published' } },
  })
  return result.docs[0] || null
}

export async function getActiveCategories() {
  const payload = await getPayloadClient()
  return payload.find({
    collection: 'categories',
    limit: 100,
    sort: 'order',
    where: { isActive: { equals: true } },
  })
}

export async function getSiteSettings() {
  const payload = await getPayloadClient()
  return payload.findGlobal({
    slug: 'settings',
    depth: 1,
  })
}

export async function searchPublishedPostsFallback(args: {
  query: string
  category?: string
  page?: number
  limit?: number
}) {
  const where: Record<string, unknown> = {
    or: [
      { title: { like: args.query } },
      { excerpt: { like: args.query } },
    ],
  }

  if (args.category) {
    const category = await getCategoryBySlug(args.category)
    if (!category) return { docs: [], totalDocs: 0, page: args.page || 1, totalPages: 0, limit: args.limit || 10 }
    where.category = { equals: (category as Record<string, unknown>).id }
  }

  return getPublishedPosts({
    limit: args.limit || 10,
    page: args.page || 1,
    where,
  })
}
