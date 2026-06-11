import { getPayload } from 'payload'
import config from '@/payload.config'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://porosmadura.com'

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, priority: 1.0, changeFrequency: 'hourly' as const },
    { url: `${siteUrl}/tentang-kami`, priority: 0.5, changeFrequency: 'monthly' as const },
    { url: `${siteUrl}/redaksi`, priority: 0.5, changeFrequency: 'monthly' as const },
    { url: `${siteUrl}/kontak`, priority: 0.5, changeFrequency: 'monthly' as const },
    { url: `${siteUrl}/pedoman-media-siber`, priority: 0.3, changeFrequency: 'yearly' as const },
    { url: `${siteUrl}/privacy-policy`, priority: 0.3, changeFrequency: 'yearly' as const },
    { url: `${siteUrl}/disclaimer`, priority: 0.3, changeFrequency: 'yearly' as const },
  ]

  let payload
  try {
    payload = await getPayload({ config })
  } catch {
    // DB not reachable (e.g., during Docker build), return static pages only
    return staticPages
  }

  const { docs: posts } = await payload.find({
    collection: 'posts',
    limit: 1000,
    where: {
      status: { equals: 'published' },
      publishedAt: { less_than_equal: new Date().toISOString() },
    },
    sort: '-publishedAt',
    depth: 1,
  })

  const postUrls: MetadataRoute.Sitemap = (posts as Array<Record<string, unknown>>).map((post) => {
    const categorySlug = typeof post.category === 'object' ? (post.category as Record<string, string>)?.slug : ''
    return {
      url: `${siteUrl}/${categorySlug}/${post.slug as string}`,
      lastModified: (post.updatedAt as string) || (post.publishedAt as string),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }
  })

  const { docs: categories } = await payload.find({
    collection: 'categories',
    limit: 100,
    where: { isActive: { equals: true } },
  })

  const categoryUrls: MetadataRoute.Sitemap = (categories as Array<Record<string, unknown>>).map((cat) => ({
    url: `${siteUrl}/category/${cat.slug as string}`,
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }))

  const { docs: tags } = await payload.find({
    collection: 'tags',
    limit: 100,
    where: { isActive: { equals: true } },
  })

  const tagUrls: MetadataRoute.Sitemap = (tags as Array<Record<string, unknown>>).map((tag) => ({
    url: `${siteUrl}/tag/${tag.slug as string}`,
    changeFrequency: 'weekly' as const,
    priority: 0.4,
  }))

  const { docs: authors } = await payload.find({
    collection: 'authors',
    limit: 100,
    where: { isActive: { equals: true } },
  })

  const authorUrls: MetadataRoute.Sitemap = (authors as Array<Record<string, unknown>>).map((author) => ({
    url: `${siteUrl}/author/${author.slug as string}`,
    changeFrequency: 'weekly' as const,
    priority: 0.4,
  }))

  return [...staticPages, ...postUrls, ...categoryUrls, ...tagUrls, ...authorUrls]
}
