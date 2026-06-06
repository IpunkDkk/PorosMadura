import { Meilisearch } from 'meilisearch'

const host = process.env.MEILISEARCH_HOST || 'http://localhost:7700'
const apiKey = process.env.MEILISEARCH_API_KEY || ''

export const searchClient = new Meilisearch({ host, apiKey })

const POSTS_INDEX = 'posts'

export async function indexPost(post: Record<string, unknown>) {
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
