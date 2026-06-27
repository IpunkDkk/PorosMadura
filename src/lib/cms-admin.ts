'use server'

import { randomUUID } from 'crypto'
import { mkdir, unlink, writeFile } from 'fs/promises'
import path from 'path'
import { count, desc, eq } from 'drizzle-orm'
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

function normalizePostForm(formData: FormData, session: CmsSession, forcedAuthorId?: number | null) {
  const title = stringValue(formData, 'title')
  const slug = stringValue(formData, 'slug') || slugify(title)
  const categoryId = numberValue(formData, 'categoryId') || null
  const authorId = forcedAuthorId ?? (numberValue(formData, 'authorId') || null)
  const content = stringValue(formData, 'content')
  const status = session.role === 'author'
    ? (stringValue(formData, 'status') === 'review' ? 'review' : 'draft')
    : stringValue(formData, 'status') || 'draft'
  const publishedAt = dateValue(formData, 'publishedAt') || (status === 'published' ? new Date() : null)

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
  const [postCount, categoryCount, authorCount, tagCount, mediaCount, adCount, recentPosts] = await Promise.all([
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
  ])

  return {
    counts: {
      posts: postCount[0]?.value || 0,
      categories: categoryCount[0]?.value || 0,
      authors: authorCount[0]?.value || 0,
      tags: tagCount[0]?.value || 0,
      media: mediaCount[0]?.value || 0,
      ads: adCount[0]?.value || 0,
    },
    recentPosts,
  }
}

export async function getCmsPostList() {
  const session = await requireCmsRole(['admin', 'editor', 'author'])
  const authorId = await getAuthorIdForSession(session)
  return db.query.posts.findMany({
    where: authorId ? eq(posts.authorId, authorId) : undefined,
    limit: 100,
    orderBy: desc(posts.updatedAt),
    with: { category: true, author: true },
  })
}

export async function getCmsPostFormData(id?: number) {
  const session = await requireCmsRole(['admin', 'editor', 'author'])
  if (id) await assertCanEditPost(session, id)
  const [post, categoryRows, authorRows, tagRows, mediaRows] = await Promise.all([
    id
      ? db.query.posts.findFirst({
          where: eq(posts.id, id),
          with: { postTags: true },
        })
      : Promise.resolve(null),
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
  const [post] = await db.insert(posts).values(data).returning({ id: posts.id })
  await syncPostTags(post.id, formData)
  revalidatePath('/')
  revalidatePath('/cms/posts')
  redirect(`/cms/posts/${post.id}`)
}

export async function updatePostAction(id: number, formData: FormData) {
  const session = await requireCmsRole(['admin', 'editor', 'author'])
  await assertCanEditPost(session, id)
  const forcedAuthorId = await getAuthorIdForSession(session)
  const data = normalizePostForm(formData, session, forcedAuthorId)
  await db.update(posts).set(data).where(eq(posts.id, id))
  await syncPostTags(id, formData)
  revalidatePath('/')
  revalidatePath('/cms/posts')
  redirect(`/cms/posts/${id}`)
}

export async function deletePostAction(id: number) {
  const session = await requireCmsRole(['admin', 'editor'])
  await assertCanEditPost(session, id)
  await db.delete(posts).where(eq(posts.id, id))
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
  const [settingsRow, pageRows, slotRows, mediaRows] = await Promise.all([
    db.query.settings.findFirst({ orderBy: desc(settings.updatedAt) }),
    db.query.pages.findMany({ orderBy: desc(pages.updatedAt), limit: 50 }),
    db.query.adSlots.findMany({ orderBy: adSlots.placement }),
    db.query.media.findMany({ orderBy: desc(media.updatedAt), limit: 100 }),
  ])
  return { settings: settingsRow, pages: pageRows, adSlots: slotRows, media: mediaRows }
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

  const buffer = Buffer.from(await file.arrayBuffer())
  const originalName = file.name || 'media'
  const ext = path.extname(originalName).toLowerCase().replace(/[^a-z0-9.]/g, '')
  const filename = `${Date.now()}-${randomUUID()}${ext}`
  const mediaDir = path.join(process.cwd(), 'public', 'media')

  await mkdir(mediaDir, { recursive: true })
  await writeFile(path.join(mediaDir, filename), buffer)

  await db.insert(media).values({
    alt: stringValue(formData, 'alt') || originalName,
    caption: optionalString(formData, 'caption'),
    credit: optionalString(formData, 'credit'),
    folder: '/',
    filename,
    mimeType: file.type || 'application/octet-stream',
    filesize: file.size,
    url: `/media/${filename}`,
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

  if (item?.filename) {
    try {
      await unlink(path.join(process.cwd(), 'public', 'media', item.filename))
    } catch {
      /* File may already be missing; keep database cleanup working. */
    }
  }

  await db.delete(media).where(eq(media.id, id))
  revalidatePath('/cms/media')
  redirect('/cms/media')
}

export async function getCmsAdsData() {
  await requireCmsRole(['admin', 'editor'])
  const [adRows, slotRows, mediaRows] = await Promise.all([
    db.query.ads.findMany({
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

  if (id) await db.update(pages).set(data).where(eq(pages.id, id))
  else await db.insert(pages).values(data)
  revalidatePath('/cms/settings')
  redirect('/cms/settings')
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
