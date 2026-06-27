'use server'

import { randomUUID } from 'crypto'
import { mkdir, unlink, writeFile } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { and, count, desc, eq, ilike, isNull, lt, or, type SQL } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { adSlots, ads, authors, categories, media, pages, posts, postTags, settings, tags, users } from '@/db/schema'
import {
  type CmsSession,
  assertCmsAccess,
  hashCmsPassword,
  loginCmsUser,
  logoutCms,
  requireCmsRole,
  syncCmsBetterAuthUser,
} from '@/lib/cms-auth'
import { indexPost, removePostFromIndex } from '@/lib/search'

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function optionalString(formData: FormData, key: string) {
  const value = stringValue(formData, key)
  return value || null
}

function numberValue(formData: FormData, key: string) {
  const parsed = Number(stringValue(formData, key))
  return Number.isFinite(parsed) ? parsed : 0
}

function dateValue(formData: FormData, key: string) {
  const value = stringValue(formData, key)
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function checked(formData: FormData, key: string) {
  return formData.get(key) === 'on'
}

function returnTo(formData: FormData, fallback: string) {
  const target = stringValue(formData, 'returnTo')
  return target.startsWith('/cms/') ? target : fallback
}

const maxMediaUploadBytes = 10 * 1024 * 1024
const mediaSizes = {
  thumbnail: { width: 320 },
  card: { width: 640 },
  hero: { width: 1280 },
  og: { width: 1200, height: 630 },
}

async function getAuthorIdForSession(session: CmsSession) {
  if (session.role !== 'author') return null
  const author = await db.query.authors.findFirst({
    where: eq(authors.userId, session.id),
  })
  return author?.id || null
}

async function assertCanEditPost(session: CmsSession, postId: number) {
  if (['admin', 'editor'].includes(session.role)) return

  const authorId = await getAuthorIdForSession(session)
  if (!authorId) redirect('/cms/posts')

  const post = await db.query.posts.findFirst({
    where: eq(posts.id, postId),
  })
  if (!post || post.authorId !== authorId) redirect('/cms/posts')
}

async function getPostForSearchIndex(postId: number) {
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, postId),
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

  if (!post) return null

  return {
    ...post,
    tags: post.postTags.map((item) => item.tag).filter(Boolean),
  }
}

async function syncPostSearchIndex(postId: number) {
  const post = await getPostForSearchIndex(postId)

  if (
    post &&
    post.status === 'published' &&
    post.publishedAt &&
    post.publishedAt <= new Date()
  ) {
    await indexPost(post as unknown as Record<string, unknown>)
    return
  }

  await removePostFromIndex(String(postId))
}

function normalizePostForm(formData: FormData, session: CmsSession, forcedAuthorId?: number | null) {
  const title = stringValue(formData, 'title')
  const slug = stringValue(formData, 'slug') || slugify(title)
  const categoryId = numberValue(formData, 'categoryId') || null
  const authorId = forcedAuthorId ?? (numberValue(formData, 'authorId') || null)
  const content = stringValue(formData, 'content')
  let status = session.role === 'author'
    ? (stringValue(formData, 'status') === 'review' ? 'review' : 'draft')
    : stringValue(formData, 'status') || 'draft'
  const requestedPublishDate = dateValue(formData, 'publishedAt')
  let publishedAt = requestedPublishDate || (status === 'published' ? new Date() : null)
  let scheduledAt = status === 'scheduled' ? requestedPublishDate : null

  if (status === 'scheduled' && !requestedPublishDate) {
    throw new Error('Tanggal publish wajib diisi untuk artikel terjadwal')
  }

  if (status === 'scheduled' && requestedPublishDate && requestedPublishDate <= new Date()) {
    status = 'published'
    publishedAt = requestedPublishDate
    scheduledAt = null
  }

  if (!title || !slug) throw new Error('Judul dan slug wajib diisi')

  return {
    title,
    slug,
    excerpt: optionalString(formData, 'excerpt'),
    content,
    featuredImageId: numberValue(formData, 'featuredImageId') || null,
    categoryId,
    authorId,
    status,
    publishedAt,
    scheduledAt,
    seoTitle: optionalString(formData, 'seoTitle'),
    seoDescription: optionalString(formData, 'seoDescription'),
    canonicalUrl: optionalString(formData, 'canonicalUrl'),
    ogImageId: numberValue(formData, 'ogImageId') || null,
    isFeatured: checked(formData, 'isFeatured'),
    isBreakingNews: checked(formData, 'isBreakingNews'),
    allowIndex: formData.get('allowIndex') !== null,
    sourceName: optionalString(formData, 'sourceName'),
    sourceUrl: optionalString(formData, 'sourceUrl'),
    readingTime: numberValue(formData, 'readingTime'),
    updatedAt: new Date(),
  }
}

export async function getCmsDashboard() {
  await assertCmsAccess()
  const now = new Date()
  const [postCount, categoryCount, authorCount, tagCount, mediaCount, adCount, recentPosts, reviewCount, scheduledCount, missingImageCount, missingSeoCount, activeAdCount, expiredAdCount, reviewPosts, scheduledPosts, topViewedPosts] = await Promise.all([
    db.select({ value: count() }).from(posts),
    db.select({ value: count() }).from(categories),
    db.select({ value: count() }).from(authors),
    db.select({ value: count() }).from(tags),
    db.select({ value: count() }).from(media),
    db.select({ value: count() }).from(ads),
    db.query.posts.findMany({
      limit: 6,
      orderBy: desc(posts.updatedAt),
      with: { category: true, author: true },
    }),
    db.select({ value: count() }).from(posts).where(eq(posts.status, 'review')),
    db.select({ value: count() }).from(posts).where(eq(posts.status, 'scheduled')),
    db.select({ value: count() }).from(posts).where(isNull(posts.featuredImageId)),
    db.select({ value: count() }).from(posts).where(
      or(
        isNull(posts.seoTitle),
        eq(posts.seoTitle, ''),
        isNull(posts.seoDescription),
        eq(posts.seoDescription, ''),
      ),
    ),
    db.select({ value: count() }).from(ads).where(eq(ads.status, 'active')),
    db.select({ value: count() }).from(ads).where(
      and(eq(ads.status, 'active'), lt(ads.endDate, now)),
    ),
    db.query.posts.findMany({
      where: eq(posts.status, 'review'),
      limit: 5,
      orderBy: desc(posts.updatedAt),
      with: { category: true, author: true },
    }),
    db.query.posts.findMany({
      where: eq(posts.status, 'scheduled'),
      limit: 5,
      orderBy: desc(posts.publishedAt),
      with: { category: true, author: true },
    }),
    db.query.posts.findMany({
      limit: 5,
      orderBy: desc(posts.views),
      with: { category: true, author: true },
    }),
  ])

  return {
    counts: {
      posts: postCount[0]?.value || 0,
      categories: categoryCount[0]?.value || 0,
      authors: authorCount[0]?.value || 0,
      tags: tagCount[0]?.value || 0,
      media: mediaCount[0]?.value || 0,
      ads: adCount[0]?.value || 0,
      reviewPosts: reviewCount[0]?.value || 0,
      scheduledPosts: scheduledCount[0]?.value || 0,
      missingImages: missingImageCount[0]?.value || 0,
      missingSeo: missingSeoCount[0]?.value || 0,
      activeAds: activeAdCount[0]?.value || 0,
      expiredActiveAds: expiredAdCount[0]?.value || 0,
    },
    recentPosts,
    reviewPosts,
    scheduledPosts,
    topViewedPosts,
  }
}

export async function getCmsPostList(args: {
  q?: string
  status?: string
  issue?: string
  categoryId?: number
  authorId?: number
  page?: number
  limit?: number
} = {}) {
  const session = await requireCmsRole(['admin', 'editor', 'author'])
  const sessionAuthorId = await getAuthorIdForSession(session)
  const page = Math.max(1, args.page || 1)
  const limit = Math.min(100, Math.max(10, args.limit || 20))
  const offset = (page - 1) * limit
  const conditions: SQL[] = []

  if (sessionAuthorId) {
    conditions.push(eq(posts.authorId, sessionAuthorId))
  } else if (args.authorId) {
    conditions.push(eq(posts.authorId, args.authorId))
  }

  if (args.status) conditions.push(eq(posts.status, args.status))
  if (args.categoryId) conditions.push(eq(posts.categoryId, args.categoryId))
  if (args.issue === 'missing-image') {
    conditions.push(isNull(posts.featuredImageId))
  }
  if (args.issue === 'missing-seo') {
    conditions.push(
      or(
        isNull(posts.seoTitle),
        eq(posts.seoTitle, ''),
        isNull(posts.seoDescription),
        eq(posts.seoDescription, ''),
      )!,
    )
  }
  if (args.q) {
    const term = `%${args.q}%`
    conditions.push(or(ilike(posts.title, term), ilike(posts.slug, term), ilike(posts.excerpt, term))!)
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined
  const [rows, totalRows, categoryRows, authorRows] = await Promise.all([
    db.query.posts.findMany({
      where,
      limit,
      offset,
      orderBy: desc(posts.updatedAt),
      with: { category: true, author: true },
    }),
    db.select({ value: count() }).from(posts).where(where),
    db.query.categories.findMany({ orderBy: categories.order }),
    sessionAuthorId
      ? db.query.authors.findMany({ where: eq(authors.id, sessionAuthorId), orderBy: authors.name })
      : db.query.authors.findMany({ orderBy: authors.name }),
  ])

  const totalDocs = totalRows[0]?.value || 0
  return {
    docs: rows,
    totalDocs,
    totalPages: Math.max(1, Math.ceil(totalDocs / limit)),
    page,
    limit,
    categories: categoryRows,
    authors: authorRows,
  }
}

export async function getCmsPostFormData(idOrSlug?: number | string) {
  const session = await requireCmsRole(['admin', 'editor', 'author'])
  
  let postQuery = null
  if (idOrSlug !== undefined && idOrSlug !== null) {
    if (typeof idOrSlug === 'number') {
      await assertCanEditPost(session, idOrSlug)
      postQuery = db.query.posts.findFirst({
        where: eq(posts.id, idOrSlug),
        with: { postTags: true },
      })
    } else {
      const numericId = Number(idOrSlug)
      if (Number.isFinite(numericId)) {
        await assertCanEditPost(session, numericId)
        postQuery = db.query.posts.findFirst({
          where: eq(posts.id, numericId),
          with: { postTags: true },
        })
      } else {
        const resolvedPost = await db.query.posts.findFirst({
          where: eq(posts.slug, idOrSlug),
        })
        if (resolvedPost) {
          await assertCanEditPost(session, resolvedPost.id)
          postQuery = db.query.posts.findFirst({
            where: eq(posts.id, resolvedPost.id),
            with: { postTags: true },
          })
        }
      }
    }
  }

  const [post, categoryRows, authorRows, tagRows, mediaRows] = await Promise.all([
    postQuery || Promise.resolve(null),
    db.query.categories.findMany({ orderBy: categories.order }),
    db.query.authors.findMany({ orderBy: authors.name }),
    db.query.tags.findMany({ orderBy: tags.name }),
    db.query.media.findMany({ orderBy: desc(media.updatedAt), limit: 100 }),
  ])

  return {
    post,
    categories: categoryRows,
    authors: authorRows,
    tags: tagRows,
    media: mediaRows,
    selectedTagIds: new Set(post?.postTags.map((item) => item.tagId).filter(Boolean) || []),
  }
}

export async function createPostAction(formData: FormData) {
  const session = await requireCmsRole(['admin', 'editor', 'author'])
  const forcedAuthorId = await getAuthorIdForSession(session)
  const data = normalizePostForm(formData, session, forcedAuthorId)
  const [post] = await db.insert(posts).values(data).returning({ id: posts.id, slug: posts.slug })
  await syncPostTags(post.id, formData)
  await syncPostSearchIndex(post.id)
  revalidatePath('/')
  revalidatePath('/cms/posts')
  redirect(`/cms/posts/${post.slug}`)
}

export async function updatePostAction(id: number, formData: FormData) {
  const session = await requireCmsRole(['admin', 'editor', 'author'])
  await assertCanEditPost(session, id)
  const forcedAuthorId = await getAuthorIdForSession(session)
  const data = normalizePostForm(formData, session, forcedAuthorId)
  const [post] = await db.update(posts).set(data).where(eq(posts.id, id)).returning({ slug: posts.slug })
  await syncPostTags(id, formData)
  await syncPostSearchIndex(id)
  revalidatePath('/')
  revalidatePath('/cms/posts')
  redirect(`/cms/posts/${post.slug}`)
}

export async function deletePostAction(id: number) {
  const session = await requireCmsRole(['admin', 'editor'])
  await assertCanEditPost(session, id)
  await db.delete(posts).where(eq(posts.id, id))
  await removePostFromIndex(String(id))
  revalidatePath('/')
  revalidatePath('/cms/posts')
  redirect('/cms/posts')
}

async function syncPostTags(postId: number, formData: FormData) {
  const tagIds = formData.getAll('tagIds')
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value))

  await db.delete(postTags).where(eq(postTags.parentId, postId))
  for (const [index, tagId] of tagIds.entries()) {
    await db.insert(postTags).values({
      parentId: postId,
      tagId,
      path: 'tags',
      order: index,
    })
  }
}

export async function getCmsTaxonomyData() {
  await requireCmsRole(['admin', 'editor'])
  const [categoryRows, tagRows, authorRows] = await Promise.all([
    db.query.categories.findMany({ orderBy: categories.order }),
    db.query.tags.findMany({ orderBy: tags.name }),
    db.query.authors.findMany({ orderBy: authors.name }),
  ])
  return { categories: categoryRows, tags: tagRows, authors: authorRows }
}

export async function saveCategoryAction(formData: FormData) {
  await requireCmsRole(['admin', 'editor'])
  const id = numberValue(formData, 'id')
  const name = stringValue(formData, 'name')
  const slug = stringValue(formData, 'slug') || slugify(name)
  if (!name || !slug) throw new Error('Nama dan slug kategori wajib diisi')

  const data = {
    name,
    slug,
    description: optionalString(formData, 'description'),
    seoTitle: optionalString(formData, 'seoTitle'),
    seoDescription: optionalString(formData, 'seoDescription'),
    order: numberValue(formData, 'order'),
    isActive: checked(formData, 'isActive'),
    updatedAt: new Date(),
  }

  if (id) await db.update(categories).set(data).where(eq(categories.id, id))
  else await db.insert(categories).values(data)
  revalidatePath('/cms/taxonomy')
  redirect(returnTo(formData, '/cms/taxonomy/categories'))
}

export async function saveTagAction(formData: FormData) {
  await requireCmsRole(['admin', 'editor'])
  const id = numberValue(formData, 'id')
  const name = stringValue(formData, 'name')
  const slug = stringValue(formData, 'slug') || slugify(name)
  if (!name || !slug) throw new Error('Nama dan slug tag wajib diisi')

  const data = {
    name,
    slug,
    description: optionalString(formData, 'description'),
    isActive: checked(formData, 'isActive'),
    updatedAt: new Date(),
  }

  if (id) await db.update(tags).set(data).where(eq(tags.id, id))
  else await db.insert(tags).values(data)
  revalidatePath('/cms/taxonomy')
  redirect(returnTo(formData, '/cms/taxonomy/tags'))
}

export async function saveAuthorAction(formData: FormData) {
  await requireCmsRole(['admin', 'editor'])
  const id = numberValue(formData, 'id')
  const name = stringValue(formData, 'name')
  const slug = stringValue(formData, 'slug') || slugify(name)
  if (!name || !slug) throw new Error('Nama dan slug penulis wajib diisi')

  const data = {
    name,
    slug,
    bio: optionalString(formData, 'bio'),
    email: optionalString(formData, 'email'),
    socialLinksFacebook: optionalString(formData, 'facebook'),
    socialLinksTwitter: optionalString(formData, 'twitter'),
    socialLinksInstagram: optionalString(formData, 'instagram'),
    isActive: checked(formData, 'isActive'),
    updatedAt: new Date(),
  }

  if (id) await db.update(authors).set(data).where(eq(authors.id, id))
  else await db.insert(authors).values(data)
  revalidatePath('/cms/taxonomy')
  redirect(returnTo(formData, '/cms/taxonomy/authors'))
}

export async function getCmsSettingsData() {
  await requireCmsRole(['admin'])
  const [settingsRow, slotRows, mediaRows] = await Promise.all([
    db.query.settings.findFirst({ orderBy: desc(settings.updatedAt) }),
    db.query.adSlots.findMany({ orderBy: adSlots.placement }),
    db.query.media.findMany({ orderBy: desc(media.updatedAt), limit: 100 }),
  ])
  return { settings: settingsRow, adSlots: slotRows, media: mediaRows }
}

export async function getCmsMediaList() {
  await requireCmsRole(['admin', 'editor'])
  return db.query.media.findMany({
    limit: 100,
    orderBy: desc(media.updatedAt),
  })
}

export async function uploadMediaAction(formData: FormData) {
  await requireCmsRole(['admin', 'editor'])
  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) {
    throw new Error('File media wajib diisi')
  }
  if (!file.type.startsWith('image/')) {
    throw new Error('File media harus berupa gambar')
  }
  if (file.size > maxMediaUploadBytes) {
    throw new Error('Ukuran file media maksimal 10MB')
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const image = sharp(buffer, { failOn: 'none' }).rotate()
  const metadata = await image.metadata()
  if (!metadata.width || !metadata.height) {
    throw new Error('File gambar tidak valid')
  }

  const originalName = file.name || 'media'
  const ext = path.extname(originalName).toLowerCase().replace(/[^a-z0-9.]/g, '')
  const safeExt = ext || '.jpg'
  const filename = `${Date.now()}-${randomUUID()}${safeExt}`
  const basename = path.basename(filename, safeExt)
  const mediaDir = path.join(process.cwd(), 'public', 'media')

  await mkdir(mediaDir, { recursive: true })
  await writeFile(path.join(mediaDir, filename), buffer)

  const thumbnailFilename = `${basename}-thumbnail.webp`
  const cardFilename = `${basename}-card.webp`
  const heroFilename = `${basename}-hero.webp`
  const ogFilename = `${basename}-og.webp`

  const [thumbnailInfo, cardInfo, heroInfo, ogInfo] = await Promise.all([
    image
      .clone()
      .resize({ width: mediaSizes.thumbnail.width, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(path.join(mediaDir, thumbnailFilename)),
    image
      .clone()
      .resize({ width: mediaSizes.card.width, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(path.join(mediaDir, cardFilename)),
    image
      .clone()
      .resize({ width: mediaSizes.hero.width, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(path.join(mediaDir, heroFilename)),
    image
      .clone()
      .resize({
        width: mediaSizes.og.width,
        height: mediaSizes.og.height,
        fit: 'cover',
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toFile(path.join(mediaDir, ogFilename)),
  ])

  await db.insert(media).values({
    alt: stringValue(formData, 'alt') || originalName,
    caption: optionalString(formData, 'caption'),
    credit: optionalString(formData, 'credit'),
    folder: '/',
    filename,
    mimeType: file.type || 'application/octet-stream',
    filesize: file.size,
    width: metadata.width,
    height: metadata.height,
    url: `/media/${filename}`,
    thumbnailURL: `/media/${thumbnailFilename}`,
    sizesThumbnailUrl: `/media/${thumbnailFilename}`,
    sizesThumbnailWidth: thumbnailInfo.width,
    sizesThumbnailHeight: thumbnailInfo.height,
    sizesThumbnailMimeType: 'image/webp',
    sizesThumbnailFilesize: thumbnailInfo.size,
    sizesThumbnailFilename: thumbnailFilename,
    sizesCardUrl: `/media/${cardFilename}`,
    sizesCardWidth: cardInfo.width,
    sizesCardHeight: cardInfo.height,
    sizesCardMimeType: 'image/webp',
    sizesCardFilesize: cardInfo.size,
    sizesCardFilename: cardFilename,
    sizesHeroUrl: `/media/${heroFilename}`,
    sizesHeroWidth: heroInfo.width,
    sizesHeroHeight: heroInfo.height,
    sizesHeroMimeType: 'image/webp',
    sizesHeroFilesize: heroInfo.size,
    sizesHeroFilename: heroFilename,
    sizesOgUrl: `/media/${ogFilename}`,
    sizesOgWidth: ogInfo.width,
    sizesOgHeight: ogInfo.height,
    sizesOgMimeType: 'image/webp',
    sizesOgFilesize: ogInfo.size,
    sizesOgFilename: ogFilename,
    updatedAt: new Date(),
  })

  revalidatePath('/cms/media')
  redirect('/cms/media')
}

export async function deleteMediaAction(id: number) {
  await requireCmsRole(['admin', 'editor'])
  const item = await db.query.media.findFirst({
    where: eq(media.id, id),
  })

  const filenames = [
    item?.filename,
    item?.sizesThumbnailFilename,
    item?.sizesCardFilename,
    item?.sizesHeroFilename,
    item?.sizesOgFilename,
  ].filter((filename): filename is string => Boolean(filename))

  await Promise.all(filenames.map(async (filename) => {
    try {
      await unlink(path.join(process.cwd(), 'public', 'media', filename))
    } catch {
      /* File may already be missing; keep database cleanup working. */
    }
  }))

  await db.delete(media).where(eq(media.id, id))
  revalidatePath('/cms/media')
  redirect('/cms/media')
}

export async function getCmsAdsData(args: {
  issue?: string
} = {}) {
  await requireCmsRole(['admin', 'editor'])
  const now = new Date()
  const where = args.issue === 'expired-active'
    ? and(eq(ads.status, 'active'), lt(ads.endDate, now))
    : undefined

  const [adRows, slotRows, mediaRows] = await Promise.all([
    db.query.ads.findMany({
      where,
      limit: 100,
      orderBy: desc(ads.updatedAt),
      with: {
        imageDesktop: true,
        imageMobile: true,
      },
    }),
    db.query.adSlots.findMany({ orderBy: adSlots.placement }),
    db.query.media.findMany({ orderBy: desc(media.updatedAt), limit: 100 }),
  ])

  return { ads: adRows, adSlots: slotRows, media: mediaRows }
}

export async function saveAdAction(formData: FormData) {
  await requireCmsRole(['admin', 'editor'])
  const id = numberValue(formData, 'id')
  const title = stringValue(formData, 'title')
  const placement = stringValue(formData, 'placement')
  const targetUrl = stringValue(formData, 'targetUrl')
  const startDate = dateValue(formData, 'startDate')
  const endDate = dateValue(formData, 'endDate')
  if (!title || !placement || !targetUrl || !startDate || !endDate) {
    throw new Error('Judul, placement, URL tujuan, tanggal mulai, dan tanggal selesai wajib diisi')
  }

  const desktopId = numberValue(formData, 'imageDesktopId') || null
  const mobileId = numberValue(formData, 'imageMobileId') || null
  const data = {
    title,
    advertiserName: optionalString(formData, 'advertiserName'),
    advertiserContact: optionalString(formData, 'advertiserContact'),
    imageDesktopId: desktopId,
    imageMobileId: mobileId,
    targetUrl,
    placement,
    startDate,
    endDate,
    status: stringValue(formData, 'status') || 'draft',
    priority: numberValue(formData, 'priority'),
    updatedAt: new Date(),
  }

  if (id) await db.update(ads).set(data).where(eq(ads.id, id))
  else await db.insert(ads).values(data)
  revalidatePath('/cms/ads')
  revalidatePath('/api/ads-data')
  redirect('/cms/ads')
}

export async function deleteAdAction(id: number) {
  await requireCmsRole(['admin', 'editor'])
  await db.delete(ads).where(eq(ads.id, id))
  revalidatePath('/cms/ads')
  redirect('/cms/ads')
}

export async function saveSettingsAction(formData: FormData) {
  await requireCmsRole(['admin'])
  const first = await db.query.settings.findFirst({ orderBy: desc(settings.updatedAt) })
  const data = {
    siteName: stringValue(formData, 'siteName') || 'PorosMadura',
    tagline: optionalString(formData, 'tagline'),
    siteDescription: optionalString(formData, 'siteDescription'),
    siteUrl: optionalString(formData, 'siteUrl'),
    contactEmail: optionalString(formData, 'contactEmail'),
    logoId: numberValue(formData, 'logoId') || null,
    logoDarkId: numberValue(formData, 'logoDarkId') || null,
    faviconId: numberValue(formData, 'faviconId') || null,
    defaultOgImageId: numberValue(formData, 'defaultOgImageId') || null,
    socialLinksFacebook: optionalString(formData, 'facebook'),
    socialLinksTwitter: optionalString(formData, 'twitter'),
    socialLinksInstagram: optionalString(formData, 'instagram'),
    socialLinksYoutube: optionalString(formData, 'youtube'),
    defaultSeoTitle: optionalString(formData, 'defaultSeoTitle'),
    defaultSeoDescription: optionalString(formData, 'defaultSeoDescription'),
    googleAnalyticsId: optionalString(formData, 'googleAnalyticsId'),
    rssTitle: optionalString(formData, 'rssTitle'),
    rssDescription: optionalString(formData, 'rssDescription'),
    newsPublicationName: optionalString(formData, 'newsPublicationName'),
    updatedAt: new Date(),
  }

  if (first) await db.update(settings).set(data).where(eq(settings.id, first.id))
  else await db.insert(settings).values(data)
  revalidatePath('/cms/settings')
  redirect('/cms/settings')
}

export async function getCmsPageList() {
  await requireCmsRole(['admin', 'editor'])
  return db.query.pages.findMany({
    orderBy: desc(pages.updatedAt),
  })
}

export async function getCmsPageFormData(slugOrId?: string | number) {
  await requireCmsRole(['admin', 'editor'])
  let page = null
  if (slugOrId !== undefined && slugOrId !== null) {
    if (typeof slugOrId === 'number') {
      page = await db.query.pages.findFirst({
        where: eq(pages.id, slugOrId),
      })
    } else {
      const numericId = Number(slugOrId)
      if (Number.isFinite(numericId)) {
        page = await db.query.pages.findFirst({
          where: eq(pages.id, numericId),
        })
      } else {
        page = await db.query.pages.findFirst({
          where: eq(pages.slug, slugOrId),
        })
      }
    }
  }
  const mediaRows = await db.query.media.findMany({ orderBy: desc(media.updatedAt), limit: 100 })
  return {
    page,
    media: mediaRows,
  }
}

export async function deletePageAction(id: number) {
  await requireCmsRole(['admin'])
  await db.delete(pages).where(eq(pages.id, id))
  revalidatePath('/')
  revalidatePath('/cms/pages')
  redirect('/cms/pages')
}

export async function savePageAction(formData: FormData) {
  await requireCmsRole(['admin'])
  const id = numberValue(formData, 'id')
  const title = stringValue(formData, 'title')
  const slug = stringValue(formData, 'slug') || slugify(title)
  if (!title || !slug) throw new Error('Judul dan slug halaman wajib diisi')

  const data = {
    title,
    slug,
    content: stringValue(formData, 'content'),
    seoTitle: optionalString(formData, 'seoTitle'),
    seoDescription: optionalString(formData, 'seoDescription'),
    status: stringValue(formData, 'status') || 'draft',
    updatedAt: new Date(),
  }

  if (id) {
    await db.update(pages).set(data).where(eq(pages.id, id))
  } else {
    await db.insert(pages).values(data)
  }
  revalidatePath('/')
  revalidatePath('/cms/pages')
  redirect(`/cms/pages/${slug}`)
}

export async function saveAdSlotAction(formData: FormData) {
  await requireCmsRole(['admin'])
  const id = numberValue(formData, 'id')
  const data = {
    placement: stringValue(formData, 'placement'),
    label: stringValue(formData, 'label'),
    description: optionalString(formData, 'description'),
    fallbackType: stringValue(formData, 'fallbackType') || 'none',
    fallbackCode: optionalString(formData, 'fallbackCode'),
    isFallbackActive: checked(formData, 'isFallbackActive'),
    isActive: checked(formData, 'isActive'),
    updatedAt: new Date(),
  }
  if (!data.placement || !data.label) throw new Error('Placement dan label wajib diisi')

  if (id) await db.update(adSlots).set(data).where(eq(adSlots.id, id))
  else await db.insert(adSlots).values(data)
  revalidatePath('/cms/settings')
  redirect('/cms/settings')
}

export async function getCmsUsers() {
  await requireCmsRole(['admin'])
  return db.query.users.findMany({
    orderBy: desc(users.updatedAt),
    limit: 100,
  })
}

export async function saveUserAction(formData: FormData) {
  await requireCmsRole(['admin'])
  const id = numberValue(formData, 'id')
  const name = stringValue(formData, 'name')
  const email = stringValue(formData, 'email').toLowerCase()
  const role = stringValue(formData, 'role') || 'author'
  const password = stringValue(formData, 'password')
  if (!name || !email) throw new Error('Nama dan email user wajib diisi')

  const baseData = {
    name,
    email,
    role,
    isActive: checked(formData, 'isActive'),
    updatedAt: new Date(),
  }

  if (id) {
    const passwordData = password ? hashCmsPassword(password) : {}
    await db.update(users).set({ ...baseData, ...passwordData }).where(eq(users.id, id))
    if (password) {
      await syncCmsBetterAuthUser({ name, email, password })
    }
  } else {
    if (!password) throw new Error('Password wajib diisi untuk user baru')
    await db.insert(users).values({
      ...baseData,
      ...hashCmsPassword(password),
      createdAt: new Date(),
    })

    await syncCmsBetterAuthUser({ name, email, password })
  }

  revalidatePath('/cms/users')
  redirect('/cms/users')
}

export async function cmsLoginAction(formData: FormData) {
  const email = stringValue(formData, 'email').toLowerCase()
  const password = stringValue(formData, 'password')
  if (email && password && await loginCmsUser(email, password)) redirect('/cms')
  redirect('/cms/login?error=1')
}

export async function cmsLogoutAction() {
  await logoutCms()
  redirect('/cms/login')
}
