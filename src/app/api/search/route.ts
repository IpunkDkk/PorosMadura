import { searchPosts } from '@/lib/search'
import { searchPublishedPostsFallback } from '@/lib/payload'
import { getImageSizeUrl } from '@/lib/media'
import { normalizePost } from '@/lib/cms'
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
  if (results.total > 0) {
    return NextResponse.json(results, {
      headers: { 'Cache-Control': 'public, max-age=60' },
    })
  }

  const fallback = await searchPublishedPostsFallback({ query: q, category, page, limit })
  const items = fallback.docs.map(normalizePost).map((post) => ({
    id: String(post.id),
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    category: post.category?.name || null,
    categorySlug: post.category?.slug || '',
    tags: [],
    author: post.author?.name || '',
    authorSlug: post.author?.slug || '',
    publishedAt: post.publishedAt,
    featuredImage: getImageSizeUrl(post.featuredImage as Record<string, unknown> | null | undefined, 'card'),
    url: `/${post.category?.slug || 'uncategorized'}/${post.slug}`,
    isFeatured: Boolean(post.isFeatured),
    isBreakingNews: Boolean(post.isBreakingNews),
  }))

  const fallbackResults = {
    items,
    total: fallback.totalDocs,
    page: fallback.page || page,
    limit,
  }

  return NextResponse.json(fallbackResults, {
    headers: { 'Cache-Control': 'public, max-age=60' },
  })
}
