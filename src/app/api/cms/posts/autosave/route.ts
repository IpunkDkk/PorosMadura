import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { authors, postRevisions, posts, postTags } from '@/db/schema'
import { getCmsSession } from '@/lib/cms-auth'

export const dynamic = 'force-dynamic'

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function stringValue(body: Record<string, unknown>, key: string) {
  const value = body[key]
  return typeof value === 'string' ? value.trim() : ''
}

function nullableString(body: Record<string, unknown>, key: string) {
  return stringValue(body, key) || null
}

function numberValue(body: Record<string, unknown>, key: string) {
  const parsed = Number(body[key] || 0)
  return Number.isFinite(parsed) ? parsed : 0
}

function boolValue(body: Record<string, unknown>, key: string) {
  return body[key] === true || body[key] === 'on'
}

function dateValue(body: Record<string, unknown>, key: string) {
  const value = stringValue(body, key)
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

async function uniqueSlug(base: string, postId?: number) {
  const cleanBase = slugify(base) || `draft-${Date.now()}`
  let candidate = cleanBase
  let suffix = 2

  while (true) {
    const existing = await db.query.posts.findFirst({ where: eq(posts.slug, candidate) })
    if (!existing || existing.id === postId) return candidate
    candidate = `${cleanBase}-${suffix}`
    suffix += 1
  }
}

async function getAuthorIdForSession(userId: number, role: string) {
  if (role !== 'author') return null
  const author = await db.query.authors.findFirst({
    where: eq(authors.userId, userId),
  })
  return author?.id || null
}

async function canEditPost(userId: number, role: string, postId: number) {
  if (['admin', 'editor'].includes(role)) return true
  const authorId = await getAuthorIdForSession(userId, role)
  if (!authorId) return false
  const post = await db.query.posts.findFirst({ where: eq(posts.id, postId) })
  return Boolean(post && post.authorId === authorId)
}

async function syncTags(postId: number, tagIds: number[]) {
  const normalizedIds = [...new Set(tagIds.filter((value) => Number.isFinite(value)))]
  await db.delete(postTags).where(eq(postTags.parentId, postId))

  for (const [index, tagId] of normalizedIds.entries()) {
    await db.insert(postTags).values({
      parentId: postId,
      tagId,
      path: 'tags',
      order: index,
    })
  }

  return normalizedIds
}

function snapshotFromData(data: Record<string, unknown>, tagIds: number[]) {
  return {
    ...data,
    tagIds,
    publishedAt: data.publishedAt instanceof Date ? data.publishedAt.toISOString() : null,
    scheduledAt: data.scheduledAt instanceof Date ? data.scheduledAt.toISOString() : null,
    updatedAt: new Date().toISOString(),
  }
}

export async function POST(request: NextRequest) {
  const session = await getCmsSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!['admin', 'editor', 'author'].includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  if (!body) return NextResponse.json({ error: 'Body JSON tidak valid' }, { status: 400 })

  const postId = numberValue(body, 'postId') || numberValue(body, 'autosavePostId')
  if (postId && !(await canEditPost(session.id, session.role, postId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const title = stringValue(body, 'title') || `Draft otomatis ${new Date().toLocaleString('id-ID')}`
  const slug = await uniqueSlug(stringValue(body, 'slug') || title, postId || undefined)
  const forcedAuthorId = await getAuthorIdForSession(session.id, session.role)
  const requestedStatus = stringValue(body, 'status') || 'draft'
  const status = session.role === 'author'
    ? (requestedStatus === 'review' ? 'review' : 'draft')
    : (postId ? requestedStatus : 'draft')
  const publishedAt = dateValue(body, 'publishedAt') || (status === 'published' ? new Date() : null)
  const scheduledAt = status === 'scheduled' ? dateValue(body, 'publishedAt') : null

  const data = {
    title,
    slug,
    excerpt: nullableString(body, 'excerpt'),
    content: stringValue(body, 'content'),
    featuredImageId: numberValue(body, 'featuredImageId') || null,
    categoryId: numberValue(body, 'categoryId') || null,
    authorId: forcedAuthorId ?? (numberValue(body, 'authorId') || null),
    status,
    publishedAt,
    scheduledAt,
    seoTitle: nullableString(body, 'seoTitle'),
    seoDescription: nullableString(body, 'seoDescription'),
    canonicalUrl: nullableString(body, 'canonicalUrl'),
    ogImageId: numberValue(body, 'ogImageId') || null,
    isFeatured: boolValue(body, 'isFeatured'),
    isBreakingNews: boolValue(body, 'isBreakingNews'),
    allowIndex: body.allowIndex !== false,
    sourceName: nullableString(body, 'sourceName'),
    sourceUrl: nullableString(body, 'sourceUrl'),
    readingTime: numberValue(body, 'readingTime'),
    updatedAt: new Date(),
  }
  const tagIds = Array.isArray(body.tagIds)
    ? body.tagIds.map((value) => Number(value)).filter((value) => Number.isFinite(value))
    : []

  const [post] = postId
    ? await db.update(posts).set(data).where(eq(posts.id, postId)).returning({ id: posts.id, slug: posts.slug })
    : await db.insert(posts).values(data).returning({ id: posts.id, slug: posts.slug })

  const savedTagIds = await syncTags(post.id, tagIds)
  await db.insert(postRevisions).values({
    postId: post.id,
    userId: session.id,
    type: 'autosave',
    title: data.title,
    snapshot: snapshotFromData(data, savedTagIds),
  })

  return NextResponse.json({
    success: true,
    postId: post.id,
    slug: post.slug,
    editUrl: `/cms/posts/${post.slug}`,
    savedAt: new Date().toISOString(),
  })
}
