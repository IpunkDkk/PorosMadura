import type { BasePayload } from 'payload'
import config from '@/payload.config'
import { getPayload } from 'payload'

let cachedPayload: BasePayload | null = null

export async function getPayloadClient(): Promise<BasePayload> {
  if (!cachedPayload) {
    cachedPayload = await getPayload({ config })
  }
  return cachedPayload!
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
  return result.docs[0] || null
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
