import { and, asc, count, desc, eq, ilike, inArray, lte, or, sql, type SQL } from 'drizzle-orm'
import { db } from '@/db'
import {
  authors,
  categories,
  pages,
  posts,
  postTags,
  settings,
  tags,
} from '@/db/schema'
import { indexPost } from '@/lib/search'

type CmsResult<T> = {
  docs: T[]
  totalDocs: number
  totalPages: number
  page: number
  limit: number
}

type CmsWhere = Record<string, unknown>

const emptyResult = <T>(page = 1, limit = 10): CmsResult<T> => ({
  docs: [],
  totalDocs: 0,
  totalPages: 0,
  page,
  limit,
})

function toIso(value: Date | string | null | undefined): string | null {
  if (!value) return null
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value.toISOString()
  }
  return value
}

function readEquals(value: unknown): unknown {
  if (!value || typeof value !== 'object') return undefined
  return (value as Record<string, unknown>).equals
}

function readIn(value: unknown): unknown[] | undefined {
  if (!value || typeof value !== 'object') return undefined
  const maybeIn = (value as Record<string, unknown>).in
  return Array.isArray(maybeIn) ? maybeIn : undefined
}

function normalizeId(value: unknown): number | null {
  const parsed = typeof value === 'number' ? value : parseInt(String(value), 10)
  return Number.isFinite(parsed) ? parsed : null
}

function normalizeMedia(media: Record<string, unknown> | null | undefined) {
  if (!media) return null
  return {
    ...media,
    sizes: {
      thumbnail: media.sizesThumbnailUrl ? { url: media.sizesThumbnailUrl } : undefined,
      card: media.sizesCardUrl ? { url: media.sizesCardUrl } : undefined,
      hero: media.sizesHeroUrl ? { url: media.sizesHeroUrl } : undefined,
      og: media.sizesOgUrl ? { url: media.sizesOgUrl } : undefined,
    },
    createdAt: toIso(media.createdAt as Date | string | null),
    updatedAt: toIso(media.updatedAt as Date | string | null),
  }
}

function normalizeSocialLinks(row: Record<string, unknown>) {
  return {
    facebook: row.socialLinksFacebook ? String(row.socialLinksFacebook) : undefined,
    twitter: row.socialLinksTwitter ? String(row.socialLinksTwitter) : undefined,
    instagram: row.socialLinksInstagram ? String(row.socialLinksInstagram) : undefined,
    youtube: row.socialLinksYoutube ? String(row.socialLinksYoutube) : undefined,
  }
}

function normalizePostRow(row: any) {
  return {
    ...row,
    publishedAt: toIso(row.publishedAt),
    scheduledAt: toIso(row.scheduledAt),
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
    featuredImage: normalizeMedia(row.featuredImage),
    ogImage: normalizeMedia(row.ogImage),
    category: row.category || null,
    author: row.author || null,
    tags: Array.isArray(row.postTags)
      ? row.postTags.map((item: any) => item.tag).filter(Boolean)
      : [],
  }
}

async function publishDueScheduledPosts() {
  const now = new Date()
  const duePosts = await db.query.posts.findMany({
    where: and(
      eq(posts.status, 'scheduled'),
      lte(posts.publishedAt, now),
    ),
    limit: 20,
    with: {
      featuredImage: true,
      category: true,
      author: true,
      postTags: {
        with: {
          tag: true,
        },
      },
    },
  })

  if (!duePosts.length) return

  const dueIds = duePosts.map((post) => post.id)
  await db
    .update(posts)
    .set({
      status: 'published',
      scheduledAt: null,
      updatedAt: now,
    })
    .where(inArray(posts.id, dueIds))

  await Promise.all(duePosts.map((post) => {
    const normalized = {
      ...post,
      status: 'published',
      scheduledAt: null,
      updatedAt: now,
      tags: post.postTags.map((item) => item.tag).filter(Boolean),
    }
    return indexPost(normalized as unknown as Record<string, unknown>)
  }))
}

function postSort(sort?: string) {
  if (sort === 'views') return asc(posts.views)
  if (sort === '-views') return desc(posts.views)
  if (sort === 'publishedAt') return asc(posts.publishedAt)
  return desc(posts.publishedAt)
}

function buildPostConditions(where: CmsWhere = {}) {
  const conditions: SQL[] = [
    eq(posts.status, 'published'),
    lte(posts.publishedAt, new Date()),
  ]

  const isFeatured = readEquals(where.isFeatured)
  if (typeof isFeatured === 'boolean') conditions.push(eq(posts.isFeatured, isFeatured))

  const isBreakingNews = readEquals(where.isBreakingNews)
  if (typeof isBreakingNews === 'boolean') conditions.push(eq(posts.isBreakingNews, isBreakingNews))

  const categoryId = normalizeId(readEquals(where.category))
  if (categoryId !== null) conditions.push(eq(posts.categoryId, categoryId))

  const authorId = normalizeId(readEquals(where.author))
  if (authorId !== null) conditions.push(eq(posts.authorId, authorId))

  const tagIds = readIn(where.tags)
    ?.map(normalizeId)
    .filter((id): id is number => id !== null)
  if (tagIds?.length) {
    conditions.push(
      inArray(
        posts.id,
        db.select({ postId: postTags.parentId }).from(postTags).where(inArray(postTags.tagId, tagIds)),
      ),
    )
  }

  const orConditions = Array.isArray(where.or) ? where.or : []
  const searchTerms = orConditions
    .map((condition) => {
      if (!condition || typeof condition !== 'object') return null
      const record = condition as Record<string, unknown>
      return readEquals(record.title) || (record.title as any)?.like || (record.excerpt as any)?.like
    })
    .filter((term): term is string => typeof term === 'string' && term.trim().length > 0)

  if (searchTerms.length > 0) {
    const term = `%${searchTerms[0]}%`
    conditions.push(or(ilike(posts.title, term), ilike(posts.excerpt, term))!)
  }

  return and(...conditions)
}

export async function getPublishedPosts(args: {
  limit?: number
  page?: number
  sort?: string
  where?: CmsWhere
} = {}) {
  const limit = args.limit || 10
  const page = args.page || 1
  const offset = (page - 1) * limit
  const where = buildPostConditions(args.where)

  try {
    await publishDueScheduledPosts()

    const [rows, totalRows] = await Promise.all([
      db.query.posts.findMany({
        where,
        limit,
        offset,
        orderBy: postSort(args.sort),
        with: {
          featuredImage: true,
          ogImage: true,
          category: true,
          author: true,
          postTags: {
            with: {
              tag: true,
            },
          },
        },
      }),
      db.select({ value: count() }).from(posts).where(where),
    ])

    const totalDocs = totalRows[0]?.value || 0
    return {
      docs: rows.map(normalizePostRow),
      totalDocs,
      totalPages: Math.ceil(totalDocs / limit),
      page,
      limit,
    }
  } catch {
    return emptyResult(page, limit)
  }
}

export async function getPostBySlug(categorySlug: string, postSlug: string) {
  try {
    await publishDueScheduledPosts()

    const post = await db.query.posts.findFirst({
      where: and(
        eq(posts.slug, postSlug),
        eq(posts.status, 'published'),
        lte(posts.publishedAt, new Date()),
      ),
      with: {
        featuredImage: true,
        ogImage: true,
        category: true,
        author: true,
        postTags: { with: { tag: true } },
      },
    })
    if (!post) return null
    const normalized = normalizePostRow(post)
    if (categorySlug && normalized.category?.slug && normalized.category.slug !== categorySlug) return null
    return normalized
  } catch {
    return null
  }
}

export async function getCategoryBySlug(slug: string) {
  try {
    return await db.query.categories.findFirst({
      where: and(eq(categories.slug, slug), eq(categories.isActive, true)),
    }) || null
  } catch {
    return null
  }
}

export async function getTagBySlug(slug: string) {
  try {
    return await db.query.tags.findFirst({
      where: and(eq(tags.slug, slug), eq(tags.isActive, true)),
    }) || null
  } catch {
    return null
  }
}

export async function getAuthorBySlug(slug: string) {
  try {
    const author = await db.query.authors.findFirst({
      where: and(eq(authors.slug, slug), eq(authors.isActive, true)),
      with: {
        avatar: true,
      },
    })
    if (!author) return null
    return {
      ...author,
      avatar: normalizeMedia(author.avatar),
      socialLinks: normalizeSocialLinks(author as Record<string, unknown>),
      createdAt: toIso(author.createdAt),
      updatedAt: toIso(author.updatedAt),
    }
  } catch {
    return null
  }
}

export async function getPageBySlug(slug: string) {
  try {
    const page = await db.query.pages.findFirst({
      where: and(eq(pages.slug, slug), sql`${pages.status}::text = 'published'`),
    })
    if (!page) return null
    return {
      ...page,
      createdAt: toIso(page.createdAt),
      updatedAt: toIso(page.updatedAt),
    }
  } catch {
    return null
  }
}

export async function getActiveCategories() {
  try {
    const docs = await db.query.categories.findMany({
      where: eq(categories.isActive, true),
      orderBy: asc(categories.order),
      limit: 100,
    })
    return {
      docs,
      totalDocs: docs.length,
      totalPages: 1,
      page: 1,
      limit: 100,
    }
  } catch {
    return emptyResult(1, 100)
  }
}

export async function getSiteSettings() {
  try {
    const row = await db.query.settings.findFirst({
      orderBy: desc(settings.updatedAt),
      with: {
        logo: true,
        defaultOgImage: true,
      },
    })
    if (!row) return {}
    return {
      ...row,
      logo: normalizeMedia(row.logo),
      defaultOgImage: normalizeMedia(row.defaultOgImage),
      socialLinks: normalizeSocialLinks(row as Record<string, unknown>),
      createdAt: toIso(row.createdAt),
      updatedAt: toIso(row.updatedAt),
    }
  } catch {
    return {}
  }
}

export async function searchPublishedPostsFallback(args: {
  query: string
  category?: string
  page?: number
  limit?: number
}) {
  const where: CmsWhere = {
    or: [
      { title: { like: args.query } },
      { excerpt: { like: args.query } },
    ],
  }

  if (args.category) {
    const category = await getCategoryBySlug(args.category)
    if (!category) return emptyResult(args.page || 1, args.limit || 10)
    where.category = { equals: (category as Record<string, unknown>).id }
  }

  return getPublishedPosts({
    limit: args.limit || 10,
    page: args.page || 1,
    where,
  })
}
