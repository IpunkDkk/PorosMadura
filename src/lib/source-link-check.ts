import { createHash } from 'node:crypto'
import { and, desc, eq, inArray, isNotNull, ne, sql } from 'drizzle-orm'
import { db } from '@/db'
import { postSourceChecks, posts } from '@/db/schema'
import { invalidateCachePattern } from '@/lib/cache'
import { removePostFromIndex } from '@/lib/search'

const staleStatusCodes = new Set([404, 410, 451])

type SourcePost = typeof posts.$inferSelect

type SourceCheckResult = {
  statusCode: number | null
  resolvedUrl: string | null
  contentHash: string | null
  reviewReason: string | null
}

export type CheckSourceLinksOptions = {
  limit?: number
  maxAgeHours?: number
  detectContentChanges?: boolean
}

function normalizeHtml(value: string) {
  return value
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function hashContent(value: string) {
  const normalized = normalizeHtml(value)
  if (normalized.length < 200) return null
  return createHash('sha256').update(normalized).digest('hex')
}

function isValidHttpUrl(value: string | null) {
  if (!value) return false
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

async function fetchSource(url: string): Promise<SourceCheckResult> {
  const response = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(15000),
    headers: {
      'user-agent': 'PorosMadura source-link-check/1.0',
      accept: 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5',
    },
  })
  const statusCode = response.status
  const resolvedUrl = response.url || url

  if (staleStatusCodes.has(statusCode)) {
    return {
      statusCode,
      resolvedUrl,
      contentHash: null,
      reviewReason: `Link sumber kadaluwarsa atau dihapus (HTTP ${statusCode})`,
    }
  }

  if (!response.ok) {
    return { statusCode, resolvedUrl, contentHash: null, reviewReason: null }
  }

  const contentType = response.headers.get('content-type') || ''
  if (!/text\/html|application\/xhtml\+xml|text\/plain/i.test(contentType)) {
    return { statusCode, resolvedUrl, contentHash: null, reviewReason: null }
  }

  const contentHash = hashContent(await response.text())
  return { statusCode, resolvedUrl, contentHash, reviewReason: null }
}

async function getLatestSourceCheck(postId: number) {
  return db.query.postSourceChecks.findFirst({
    where: eq(postSourceChecks.postId, postId),
    orderBy: desc(postSourceChecks.checkedAt),
  })
}

async function recordSourceCheck(post: SourcePost, result: SourceCheckResult, errorMessage?: string | null) {
  await db.insert(postSourceChecks).values({
    postId: post.id,
    sourceUrl: post.sourceUrl!,
    statusCode: result.statusCode,
    contentHash: result.contentHash,
    resolvedUrl: result.resolvedUrl,
    reviewReason: result.reviewReason,
    errorMessage: errorMessage || null,
    checkedAt: new Date(),
  })
}

async function markPostForReview(post: SourcePost, result: SourceCheckResult, reason: string) {
  await recordSourceCheck(post, { ...result, reviewReason: reason })

  await db.update(posts)
    .set({
      status: 'review',
      scheduledAt: null,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, post.id))

  await removePostFromIndex(String(post.id))
}

async function checkPostSource(post: SourcePost, detectContentChanges: boolean) {
  if (!isValidHttpUrl(post.sourceUrl)) {
    return { checked: false, movedToReview: false, reason: 'URL sumber tidak valid' }
  }

  try {
    const latestCheck = await getLatestSourceCheck(post.id)
    const result = await fetchSource(post.sourceUrl!)
    let reviewReason = result.reviewReason

    if (
      !reviewReason &&
      detectContentChanges &&
      latestCheck?.contentHash &&
      result.contentHash &&
      latestCheck.contentHash !== result.contentHash
    ) {
      reviewReason = 'Konten sumber berubah sejak pengecekan terakhir'
    }

    if (reviewReason) {
      await markPostForReview(post, result, reviewReason)
      return { checked: true, movedToReview: true, reason: reviewReason }
    }

    await recordSourceCheck(post, result)

    return { checked: true, movedToReview: false, reason: null }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal mengecek link sumber'
    await recordSourceCheck(post, {
      statusCode: null,
      resolvedUrl: null,
      contentHash: null,
      reviewReason: null,
    }, message)

    return { checked: false, movedToReview: false, reason: message }
  }
}

export async function checkSourceLinks(options: CheckSourceLinksOptions = {}) {
  const limit = Math.min(200, Math.max(1, options.limit || 50))
  const maxAgeHours = Math.max(1, options.maxAgeHours || 24)
  const detectContentChanges = options.detectContentChanges ?? true
  const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000).toISOString()

  const rows = await db.query.posts.findMany({
    where: and(
      inArray(posts.status, ['published', 'scheduled']),
      isNotNull(posts.sourceUrl),
      ne(posts.sourceUrl, ''),
      sql`NOT EXISTS (
        SELECT 1
        FROM "post_source_checks"
        WHERE "post_source_checks"."post_id" = "posts"."id"
          AND "post_source_checks"."checked_at" >= ${cutoff}::timestamp
      )`,
    ),
    limit,
    orderBy: desc(posts.publishedAt),
  })

  const details = []
  let checked = 0
  let movedToReview = 0

  for (const post of rows) {
    const result = await checkPostSource(post, detectContentChanges)
    if (result.checked) checked += 1
    if (result.movedToReview) movedToReview += 1
    details.push({
      id: post.id,
      slug: post.slug,
      checked: result.checked,
      movedToReview: result.movedToReview,
      reason: result.reason,
    })
  }

  if (movedToReview > 0) {
    await Promise.all([
      invalidateCachePattern('homepage'),
      invalidateCachePattern('category:*'),
      invalidateCachePattern('tag:*'),
      invalidateCachePattern('author:*'),
      invalidateCachePattern('popular-posts'),
      invalidateCachePattern('breaking-news'),
      invalidateCachePattern('featured-posts'),
    ])
  }

  return {
    scanned: rows.length,
    checked,
    movedToReview,
    details,
  }
}

export async function checkAllDueSourceLinks(options: CheckSourceLinksOptions = {}) {
  const limit = Math.min(200, Math.max(1, options.limit || 100))
  let scanned = 0
  let checked = 0
  let movedToReview = 0
  const details = []

  while (true) {
    const result = await checkSourceLinks({ ...options, limit })
    scanned += result.scanned
    checked += result.checked
    movedToReview += result.movedToReview
    details.push(...result.details)

    if (result.scanned < limit) break
  }

  return {
    scanned,
    checked,
    movedToReview,
    details,
  }
}
