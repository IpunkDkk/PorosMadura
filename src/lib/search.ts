import { Meilisearch } from 'meilisearch'

const host = process.env.MEILISEARCH_HOST || 'http://localhost:7700'
const apiKey = process.env.MEILISEARCH_API_KEY || ''
const searchEnabled = process.env.MEILISEARCH_ENABLED !== 'false' && Boolean(host)

export const searchClient = new Meilisearch({ host, apiKey })

const POSTS_INDEX = 'posts'
let warnedUnavailable = false

function warnSearchUnavailable(action: string, err: unknown) {
  if (warnedUnavailable) return
  warnedUnavailable = true

  const cause = err instanceof Error ? err.message : String(err)
  console.warn(
    `Meilisearch unavailable; skipped ${action}. Start it with "docker compose up -d meilisearch" or set MEILISEARCH_ENABLED=false. Cause: ${cause}`,
  )
}

export async function indexPost(post: Record<string, unknown>) {
  if (!searchEnabled) return

  try {
    const index = searchClient.index(POSTS_INDEX)
    await index.addDocuments([{
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
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
    warnSearchUnavailable('post indexing', err)
  }
}

export async function removePostFromIndex(postId: string) {
  if (!searchEnabled) return

  try {
    const index = searchClient.index(POSTS_INDEX)
    await index.deleteDocument(postId)
  } catch (err) {
    warnSearchUnavailable('post removal from index', err)
  }
}

export async function searchPosts(query: string, options?: {
  category?: string
  page?: number
  limit?: number
}) {
  if (!searchEnabled) return { items: [], total: 0, page: 1, limit: options?.limit || 10 }

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
    warnSearchUnavailable('search query', err)
    return { items: [], total: 0, page: 1, limit: 10 }
  }
}
