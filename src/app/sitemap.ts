import {
  getActiveCategories,
  getPublishedPosts,
} from '@/lib/custom-cms'
import { db } from '@/db'
import { authors, tags } from '@/db/schema'
import { eq } from 'drizzle-orm'
import type { MetadataRoute } from 'next'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://porosmadura.com'

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, priority: 1.0, changeFrequency: 'hourly' as const },
    { url: `${siteUrl}/perusahaan`, priority: 0.5, changeFrequency: 'monthly' as const },
    { url: `${siteUrl}/tentang-kami`, priority: 0.5, changeFrequency: 'monthly' as const },
    { url: `${siteUrl}/susunan-redaksi`, priority: 0.5, changeFrequency: 'monthly' as const },
    { url: `${siteUrl}/kontak`, priority: 0.5, changeFrequency: 'monthly' as const },
    { url: `${siteUrl}/pedoman-media-siber`, priority: 0.3, changeFrequency: 'yearly' as const },
    { url: `${siteUrl}/kebijakan-privasi`, priority: 0.3, changeFrequency: 'yearly' as const },
    { url: `${siteUrl}/disclaimer`, priority: 0.3, changeFrequency: 'yearly' as const },
  ]

  try {
    const { docs: posts } = await getPublishedPosts({
      limit: 1000,
      sort: '-publishedAt',
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

    const { docs: categories } = await getActiveCategories()

    const categoryUrls: MetadataRoute.Sitemap = (categories as Array<Record<string, unknown>>).map((cat) => ({
      url: `${siteUrl}/category/${cat.slug as string}`,
      changeFrequency: 'daily' as const,
      priority: 0.6,
    }))

    const activeTags = await db.query.tags.findMany({
      where: eq(tags.isActive, true),
      limit: 100,
    })

    const tagUrls: MetadataRoute.Sitemap = (activeTags as Array<Record<string, unknown>>).map((tag) => ({
      url: `${siteUrl}/tag/${tag.slug as string}`,
      changeFrequency: 'weekly' as const,
      priority: 0.4,
    }))

    const activeAuthors = await db.query.authors.findMany({
      where: eq(authors.isActive, true),
      limit: 100,
    })

    const authorUrls: MetadataRoute.Sitemap = (activeAuthors as Array<Record<string, unknown>>).map((author) => ({
      url: `${siteUrl}/author/${author.slug as string}`,
      changeFrequency: 'weekly' as const,
      priority: 0.4,
    }))

    return [...staticPages, ...postUrls, ...categoryUrls, ...tagUrls, ...authorUrls]
  } catch {
    // DB queries failed (e.g., during Docker build), return static pages only
    return staticPages
  }
}
