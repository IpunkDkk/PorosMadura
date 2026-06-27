import { Meilisearch } from 'meilisearch'

const host = process.env.MEILISEARCH_HOST || 'http://localhost:7700'
const apiKey = process.env.MEILISEARCH_API_KEY || ''
const searchEnabled = process.env.MEILISEARCH_ENABLED !== 'false' && Boolean(host)

export const searchClient = new Meilisearch({ host, apiKey })

const POSTS_INDEX = 'posts'
const postsIndexSettings = {
  filterableAttributes: ['categorySlug', 'tags', 'authorSlug', 'isFeatured', 'isBreakingNews'],
  sortableAttributes: ['publishedAt', 'updatedAt'],
  searchableAttributes: ['title', 'excerpt', 'category', 'tags', 'author'],
}
let warnedUnavailable = false

function warnSearchUnavailable(action: string, err: unknown) {
  if (warnedUnavailable) return
  warnedUnavailable = true

  const cause = err instanceof Error ? err.message : String(err)
  console.warn(
    `Meilisearch unavailable; skipped ${action}. Start it with "docker compose up -d meilisearch" or set MEILISEARCH_ENABLED=false. Cause: ${cause}`,
  )
}

async function waitForTask(task: { taskUid?: number; uid?: number } | undefined) {
  const taskUid = task?.taskUid ?? task?.uid
  if (typeof taskUid !== 'number') return
  await searchClient.tasks.waitForTask(taskUid)
}

function mapPostToSearchDocument(post: Record<string, unknown>) {
  const category = typeof post.category === 'object' && post.category
    ? post.category as Record<string, unknown>
    : null
  const author = typeof post.author === 'object' && post.author
    ? post.author as Record<string, unknown>
    : null
  const featuredImage = typeof post.featuredImage === 'object' && post.featuredImage
    ? post.featuredImage as Record<string, unknown>
    : null

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    category: category?.name || post.category || '',
    categorySlug: category?.slug || '',
    tags: Array.isArray(post.tags) ? post.tags.map((t: Record<string, string>) => t.name).filter(Boolean) : [],
    author: author?.name || '',
    authorSlug: author?.slug || '',
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    featuredImage: featuredImage?.url as string || null,
    url: `/${category?.slug || ''}/${post.slug}`,
    isFeatured: post.isFeatured,
    isBreakingNews: post.isBreakingNews,
  }
}

export async function ensurePostsIndex() {
  if (!searchEnabled) return false

  try {
    const index = searchClient.index(POSTS_INDEX)
    await waitForTask(await index.updateSettings(postsIndexSettings))
    return true
  } catch (err) {
    warnSearchUnavailable('post index setup', err)
    return false
  }
}

export async function indexPost(post: Record<string, unknown>) {
  if (!searchEnabled) return

  try {
    await ensurePostsIndex()
    const index = searchClient.index(POSTS_INDEX)
    await waitForTask(await index.addDocuments([mapPostToSearchDocument(post)]))
  } catch (err) {
    warnSearchUnavailable('post indexing', err)
  }
}

export async function indexPosts(posts: Record<string, unknown>[]) {
  if (!searchEnabled || posts.length === 0) return

  try {
    await ensurePostsIndex()
    const index = searchClient.index(POSTS_INDEX)
    await waitForTask(await index.addDocuments(posts.map(mapPostToSearchDocument)))
  } catch (err) {
    warnSearchUnavailable('bulk post indexing', err)
  }
}

export async function clearPostsIndex() {
  if (!searchEnabled) return false

  try {
    await ensurePostsIndex()
    const index = searchClient.index(POSTS_INDEX)
    await waitForTask(await index.deleteAllDocuments())
    return true
  } catch (err) {
    warnSearchUnavailable('post index clearing', err)
    return false
  }
}

export async function removePostFromIndex(postId: string) {
  if (!searchEnabled) return

  try {
    const index = searchClient.index(POSTS_INDEX)
    await waitForTask(await index.deleteDocument(postId))
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
