# PorosMadura Phase 3 — Public Pages + SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** Build all public pages (homepage from sample design, article detail, category, tag, author, search, static pages) + SEO system (metadata, sitemap, RSS, JSON-LD)

---

### Task 3.1: Payload REST Client

**File:** `src/lib/payload.ts`

- [ ] **Step 1: Create Payload REST API client for public pages**

```ts
import config from '@/payload.config'
import { getPayload } from 'payload'

let cachedPayload: ReturnType<typeof getPayload> | null = null

export async function getPayloadClient() {
  if (!cachedPayload) {
    cachedPayload = await getPayload({ config })
  }
  return cachedPayload
}

// Query helpers
export async function getPublishedPosts(args: {
  limit?: number
  page?: number
  sort?: string
  where?: Record<string, unknown>
}) {
  const payload = await getPayloadClient()
  return payload.find({
    collection: 'posts',
    limit: args.limit || 10,
    page: args.page || 1,
    sort: args.sort || '-publishedAt',
    where: {
      status: { equals: 'published' },
      publishedAt: { less_than_equal: new Date().toISOString() },
      ...args.where,
    },
    depth: 2,
  })
}

export async function getPostBySlug(categorySlug: string, postSlug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'posts',
    limit: 1,
    where: {
      slug: { equals: postSlug },
      status: { equals: 'published' },
      publishedAt: { less_than_equal: new Date().toISOString() },
    },
    depth: 2,
  })
  return result.docs[0] || null
}

export async function getCategoryBySlug(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'categories',
    limit: 1,
    where: { slug: { equals: slug }, isActive: { equals: true } },
  })
  return result.docs[0] || null
}

export async function getTagBySlug(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'tags',
    limit: 1,
    where: { slug: { equals: slug }, isActive: { equals: true } },
  })
  return result.docs[0] || null
}

export async function getAuthorBySlug(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'authors',
    limit: 1,
    where: { slug: { equals: slug }, isActive: { equals: true } },
  })
  return result.docs[0] || null
}

export async function getPageBySlug(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'pages',
    limit: 1,
    where: { slug: { equals: slug }, status: { equals: 'published' } },
  })
  return result.docs[0] || null
}
```


### Task 3.2: Media Helper

**File:** `src/lib/media.ts`

- [ ] **Step 1: Create getMediaUrl helper**

```ts
// src/lib/media.ts
export function getMediaUrl(media: Record<string, unknown> | string | null | undefined): string {
  if (!media) return '/og-image.jpg'
  if (typeof media === 'string') return media

  const baseUrl = process.env.NEXT_PUBLIC_MEDIA_URL || '/media'
  const filename = (media as Record<string, string>).filename || (media as Record<string, string>).url

  if (!filename) return '/og-image.jpg'

  // If it's already a full URL, return as-is
  if (filename.startsWith('http://') || filename.startsWith('https://')) return filename

  return `${baseUrl}/${filename.replace(/^\//, '')}`
}

export function getImageSizeUrl(
  media: Record<string, unknown> | null | undefined,
  size: 'thumbnail' | 'card' | 'hero' | 'og' = 'card'
): string {
  if (!media) return '/og-image.jpg'
  if (typeof media === 'string') return getMediaUrl(media)

  const sizes = (media as Record<string, Record<string, string>>).sizes
  if (sizes?.[size]?.url) {
    return getMediaUrl(sizes[size].url)
  }

  return getMediaUrl(media)
}
```

### Task 3.3: Homepage (from sample design)

**Files:**
- Create: `src/app/(public)/page.tsx`
- Create: `src/components/article/HeroNews.tsx`
- Create: `src/components/article/BreakingNews.tsx`
- Create: `src/components/article/ArticleCard.tsx`
- Create: `src/components/sidebar/PopularPosts.tsx`
- Create: `src/components/sidebar/SocialFollow.tsx`

- [ ] **Step 1: Create Homepage server component**

```tsx
// src/app/(public)/page.tsx
import { getPayloadClient, getPublishedPosts } from '@/lib/payload'
import { HeroNews } from '@/components/article/HeroNews'
import { BreakingNews } from '@/components/article/BreakingNews'
import { ArticleCard } from '@/components/article/ArticleCard'
import { PopularPosts } from '@/components/sidebar/PopularPosts'
import { SocialFollow } from '@/components/sidebar/SocialFollow'
import type { Metadata } from 'next'

export const dynamic = 'force-static'
export const revalidate = 300 // 5 minutes

export const metadata: Metadata = {
  title: 'PorosMadura | Berita Tepat, Fakta Kuat',
  description: 'Portal berita digital Madura yang menyajikan informasi cepat, akurat, dan kredibel.',
}

export default async function HomePage() {
  const [featuredResult, latestResult, popularResult, breakingResult] = await Promise.all([
    getPublishedPosts({ limit: 3, where: { isFeatured: { equals: true } }, sort: '-publishedAt' }),
    getPublishedPosts({ limit: 5, sort: '-publishedAt' }),
    getPublishedPosts({ limit: 5, sort: '-views' }),
    getPublishedPosts({ limit: 1, where: { isBreakingNews: { equals: true } }, sort: '-publishedAt' }),
  ])

  const featuredPosts = featuredResult.docs
  const latestPosts = latestResult.docs
  const popularPosts = popularResult.docs
  const breakingPost = breakingResult.docs[0]

  return (
    <>
      {/* Breaking News */}
      {breakingPost && (
        <BreakingNews
          title={breakingPost.title}
          slug={breakingPost.slug}
          category={typeof breakingPost.category === 'object' ? breakingPost.category?.slug : ''}
        />
      )}

      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Hero Section */}
        {featuredPosts.length > 0 && (
          <section className="mb-12">
            <HeroNews posts={featuredPosts} />
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-6 border-b-2 border-gray-200 pb-3">
              <h2 className="font-heading text-2xl font-black text-poros-navy">
                Berita <span className="text-poros-red">Terbaru</span>
              </h2>
            </div>

            <div className="flex flex-col gap-6">
              {latestPosts.map((post) => (
                <ArticleCard key={post.id} post={post} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-10">
            <PopularPosts posts={popularPosts} />
            <SocialFollow />
          </aside>
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Create BreakingNews component**

```tsx
// src/components/article/BreakingNews.tsx
interface BreakingNewsProps {
  title: string
  slug: string
  category?: string
}

export function BreakingNews({ title, slug, category }: BreakingNewsProps) {
  return (
    <div className="bg-poros-red text-white text-sm py-2">
      <div className="container mx-auto px-4 lg:px-8 flex items-center">
        <span className="font-bold uppercase tracking-wider mr-4 whitespace-nowrap bg-white text-poros-red px-2 py-0.5 rounded text-xs animate-pulse">
          Breaking News
        </span>
        <a href={`/${category}/${slug}`} className="truncate hover:underline cursor-pointer font-medium">
          {title}
        </a>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create HeroNews component**

```tsx
// src/components/article/HeroNews.tsx
import { User, Clock } from 'lucide-react'
import { getImageSizeUrl } from '@/lib/media'

interface HeroNewsPost {
  id: string
  title: string
  slug: string
  category?: { name?: string; slug?: string } | string
  author?: { name?: string } | string
  publishedAt?: string
  featuredImage?: unknown
}

interface HeroNewsProps {
  posts: HeroNewsPost[]
}

export function HeroNews({ posts }: HeroNewsProps) {
  if (posts.length === 0) return null

  const main = posts[0]
  const sub = posts.slice(1)
  const categorySlug = typeof main.category === 'object' ? main.category?.slug : ''
  const categoryName = typeof main.category === 'object' ? main.category?.name : main.category
  const authorName = typeof main.author === 'object' ? main.author?.name : main.author

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Main Hero */}
      <div className="lg:col-span-2 relative group cursor-pointer overflow-hidden rounded-2xl bg-black">
        <a href={`/${categorySlug}/${main.slug}`}>
          <div className="aspect-[4/3] lg:aspect-[16/9] relative">
            <img
              src={getImageSizeUrl(main.featuredImage, 'hero')}
              alt={main.title}
              className="object-cover w-full h-full opacity-80 group-hover:scale-105 transition-transform duration-700 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 text-white z-10">
            <span className="bg-poros-red text-white text-xs font-bold uppercase px-3 py-1 rounded mb-3 inline-block">
              {categoryName || 'Berita'}
            </span>
            <h2 className="font-heading text-2xl md:text-4xl font-bold leading-tight mb-3 drop-shadow-md">
              {main.title}
            </h2>
            <div className="flex items-center text-gray-200 text-xs md:text-sm gap-4 font-medium">
              {authorName && (
                <span className="flex items-center gap-1.5"><User size={14} /> {authorName}</span>
              )}
              {main.publishedAt && (
                <span className="flex items-center gap-1.5"><Clock size={14} /> {formatRelativeTime(main.publishedAt)}</span>
              )}
            </div>
          </div>
        </a>
      </div>

      {/* Sub Heroes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
        {sub.map((news) => {
          const cSlug = typeof news.category === 'object' ? news.category?.slug : ''
          const cName = typeof news.category === 'object' ? news.category?.name : news.category
          return (
            <div key={news.id} className="relative group cursor-pointer overflow-hidden rounded-2xl bg-black">
              <a href={`/${cSlug}/${news.slug}`}>
                <div className="absolute inset-0">
                  <img
                    src={getImageSizeUrl(news.featuredImage, 'card')}
                    alt={news.title}
                    className="object-cover w-full h-full opacity-80 group-hover:scale-105 transition-transform duration-700 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                </div>
                <div className="relative p-5 text-white z-10 min-h-[200px] flex flex-col justify-end">
                  <span className="bg-poros-navy text-white text-[10px] font-bold uppercase px-2 py-1 rounded mb-2 inline-block w-fit">
                    {cName || 'Berita'}
                  </span>
                  <h2 className="font-heading text-lg md:text-xl font-bold leading-snug drop-shadow-md line-clamp-3">
                    {news.title}
                  </h2>
                </div>
              </a>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  if (diffHours < 1) return 'Baru saja'
  if (diffHours < 24) return `${diffHours} jam yang lalu`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays} hari yang lalu`
  return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
}
```

- [ ] **Step 4: Create ArticleCard component**

```tsx
// src/components/article/ArticleCard.tsx
import { getImageSizeUrl } from '@/lib/media'

interface ArticleCardPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  category?: { name?: string; slug?: string } | string
  author?: { name?: string } | string
  publishedAt?: string
  featuredImage?: unknown
}

export function ArticleCard({ post }: { post: ArticleCardPost }) {
  const categorySlug = typeof post.category === 'object' ? post.category?.slug : ''
  const categoryName = typeof post.category === 'object' ? post.category?.name : post.category
  const authorName = typeof post.author === 'object' ? post.author?.name : post.author

  return (
    <article className="group flex flex-col sm:flex-row gap-5 items-start cursor-pointer border-b border-gray-100 pb-6 last:border-0">
      <a href={`/${categorySlug}/${post.slug}`} className="w-full sm:w-2/5 aspect-[16/9] sm:aspect-[4/3] rounded-xl overflow-hidden relative shrink-0">
        <img
          src={getImageSizeUrl(post.featuredImage, 'card')}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </a>
      <div className="w-full sm:w-3/5 flex flex-col justify-center h-full pt-1 sm:pt-0">
        <span className="text-poros-red text-xs font-black uppercase tracking-wider mb-2 block">
          {categoryName || 'Berita'}
        </span>
        <a href={`/${categorySlug}/${post.slug}`}>
          <h3 className="font-heading text-xl font-bold leading-snug mb-2 group-hover:text-poros-red transition-colors text-gray-900 line-clamp-2 sm:line-clamp-3">
            {post.title}
          </h3>
        </a>
        {post.excerpt && (
          <p className="text-gray-500 text-sm mb-4 line-clamp-2 hidden md:block leading-relaxed">
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center text-xs text-gray-400 font-medium mt-auto">
          {authorName && <span>{authorName}</span>}
          {authorName && post.publishedAt && <span className="mx-2">•</span>}
          {post.publishedAt && <span>{new Date(post.publishedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</span>}
        </div>
      </div>
    </article>
  )
}
```


- [ ] **Step 5: Create PopularPosts sidebar widget**

```tsx
// src/components/sidebar/PopularPosts.tsx
import { TrendingUp } from 'lucide-react'

interface PopularPost {
  id: string
  title: string
  slug: string
  category?: { name?: string; slug?: string } | string
}

export function PopularPosts({ posts }: { posts: PopularPost[] }) {
  if (posts.length === 0) return null

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 border-b-2 border-gray-100 pb-3 mb-5">
        <TrendingUp className="text-poros-red" size={24} />
        <h3 className="font-heading text-xl font-black text-poros-navy">Terpopuler</h3>
      </div>
      <div className="space-y-6">
        {posts.map((post, index) => {
          const categoryName = typeof post.category === 'object' ? post.category?.name : post.category
          const categorySlug = typeof post.category === 'object' ? post.category?.slug : ''
          return (
            <a key={post.id} href={`/${categorySlug}/${post.slug}`} className="flex gap-4 group cursor-pointer items-start">
              <div className="text-5xl font-black text-gray-200 group-hover:text-poros-red transition-colors leading-none tracking-tighter w-10 text-right shrink-0">
                {index + 1}
              </div>
              <div className="pt-1">
                {categoryName && (
                  <span className="text-[10px] font-bold text-poros-navy uppercase tracking-wider mb-1 block">
                    {categoryName}
                  </span>
                )}
                <h4 className="font-heading font-bold text-gray-800 leading-snug group-hover:text-poros-red transition-colors line-clamp-3">
                  {post.title}
                </h4>
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Create SocialFollow widget**

```tsx
// src/components/sidebar/SocialFollow.tsx
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react'

export function SocialFollow() {
  return (
    <div className="bg-gradient-to-br from-poros-navy to-[#1c3e6b] text-white p-8 rounded-2xl shadow-md text-center relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-poros-red opacity-20 rounded-full -ml-10 -mb-10" />
      <h3 className="font-heading text-2xl font-black mb-3 relative z-10">Ikuti Kami</h3>
      <p className="text-sm text-gray-200 mb-8 relative z-10 font-medium">
        Jangan lewatkan update berita terkini dari PorosMadura.
      </p>
      <div className="flex justify-center gap-3 relative z-10">
        <a href="#" className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-poros-red hover:scale-110 transition-all">
          <Facebook size={20} />
        </a>
        <a href="#" className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-poros-red hover:scale-110 transition-all">
          <Twitter size={20} />
        </a>
        <a href="#" className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-poros-red hover:scale-110 transition-all">
          <Instagram size={20} />
        </a>
        <a href="#" className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-poros-red hover:scale-110 transition-all">
          <Youtube size={20} />
        </a>
      </div>
    </div>
  )
}
```


### Task 3.4: Article Detail Page

**Files:**
- Create: `src/app/(public)/[category]/[slug]/page.tsx`

- [ ] **Step 1: Create article detail page with SEO metadata**

```tsx
// src/app/(public)/[category]/[slug]/page.tsx
import { getPostBySlug } from '@/lib/payload'
import { getImageSizeUrl } from '@/lib/media'
import { JsonLd } from '@/components/seo/JsonLd'
import { Breadcrumb } from '@/components/seo/Breadcrumb'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Clock, User, Calendar } from 'lucide-react'

interface Props {
  params: Promise<{ category: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params
  const post = await getPostBySlug(category, slug)
  if (!post) return { title: 'Artikel Tidak Ditemukan' }

  const categoryName = typeof post.category === 'object' ? post.category?.name : ''
  const authorName = typeof post.author === 'object' ? post.author?.name : ''
  const ogImage = getImageSizeUrl(post.ogImage || post.featuredImage, 'og')

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: authorName ? [authorName] : undefined,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      images: [ogImage],
    },
    robots: post.allowIndex ? undefined : { index: false, follow: false },
    alternates: {
      canonical: post.canonicalUrl || undefined,
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { category, slug } = await params
  const post = await getPostBySlug(category, slug)

  if (!post) notFound()

  const categoryName = typeof post.category === 'object' ? post.category?.name : ''
  const categorySlug = typeof post.category === 'object' ? post.category?.slug : ''
  const authorName = typeof post.author === 'object' ? post.author?.name : 'Redaksi'
  const authorSlug = typeof post.author === 'object' ? post.author?.slug : ''
  const tags = Array.isArray(post.tags) ? post.tags : []

  return (
    <>
      <JsonLd post={post} />
      <div className="container mx-auto px-4 lg:px-8 py-8 max-w-6xl">
        <Breadcrumb items={[
          { label: 'Home', href: '/' },
          { label: categoryName || 'Berita', href: `/category/${categorySlug}` },
          { label: post.title },
        ]} />

        <article className="max-w-4xl mx-auto">
          <h1 className="font-heading text-3xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-lg text-gray-600 leading-relaxed mb-6 font-medium">
              {post.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-200">
            {authorSlug ? (
              <a href={`/author/${authorSlug}`} className="flex items-center gap-1.5 hover:text-poros-red font-medium">
                <User size={16} /> {authorName}
              </a>
            ) : (
              <span className="flex items-center gap-1.5"><User size={16} /> {authorName}</span>
            )}
            {post.publishedAt && (
              <span className="flex items-center gap-1.5">
                <Calendar size={16} />
                {new Date(post.publishedAt).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            )}
            {post.readingTime && (
              <span className="flex items-center gap-1.5"><Clock size={16} /> {post.readingTime} menit baca</span>
            )}
          </div>

          {post.featuredImage && (
            <div className="mb-8 rounded-2xl overflow-hidden">
              <img
                src={getImageSizeUrl(post.featuredImage, 'hero')}
                alt={typeof post.featuredImage === 'object' ? (post.featuredImage as Record<string, string>).alt || post.title : post.title}
                className="w-full h-auto"
              />
            </div>
          )}

          <div className="prose prose-lg prose-headings:font-heading prose-headings:text-gray-900 max-w-none mb-8 leading-relaxed">
            {/* Rich text content rendered by lexical */}
            <div dangerouslySetInnerHTML={{ __html: post.content?.toString() || '' }} />
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {tags.map((tag: Record<string, string>) => (
                <a
                  key={tag.id}
                  href={`/tag/${tag.slug}`}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                >
                  #{tag.name}
                </a>
              ))}
            </div>
          )}
        </article>
      </div>
    </>
  )
}
```


### Task 3.5: Category, Tag, Author Pages

**Files:**
- Create: `src/app/(public)/category/[slug]/page.tsx`
- Create: `src/app/(public)/tag/[slug]/page.tsx`
- Create: `src/app/(public)/author/[slug]/page.tsx`

- [ ] **Step 1: Create category page**

```tsx
import { getCategoryBySlug, getPublishedPosts } from '@/lib/payload'
import { ArticleCard } from '@/components/article/ArticleCard'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return { title: 'Kategori Tidak Ditemukan' }
  return {
    title: category.seoTitle || `${category.name} | PorosMadura`,
    description: category.seoDescription || category.description,
  }
}

export default async function CategoryPage({ params, searchParams }: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { slug } = await params
  const { page } = await searchParams
  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  const pageNum = parseInt(page || '1')
  const result = await getPublishedPosts({
    limit: 10,
    page: pageNum,
    where: { category: { equals: category.id } },
  })

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <h1 className="font-heading text-3xl font-black text-poros-navy mb-2">{category.name}</h1>
      {category.description && (
        <p className="text-gray-600 mb-8">{category.description}</p>
      )}
      <div className="flex flex-col gap-6">
        {result.docs.map((post) => <ArticleCard key={post.id} post={post} />)}
      </div>
      {result.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {pageNum > 1 && (
            <a href={`/category/${slug}?page=${pageNum - 1}`} className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50">
              Sebelumnya
            </a>
          )}
          {pageNum < result.totalPages && (
            <a href={`/category/${slug}?page=${pageNum + 1}`} className="px-4 py-2 bg-poros-navy text-white rounded-lg hover:bg-poros-navy/90">
              Selanjutnya
            </a>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create tag page**

```tsx
import { getTagBySlug, getPublishedPosts } from '@/lib/payload'
import { ArticleCard } from '@/components/article/ArticleCard'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const tag = await getTagBySlug(slug)
  if (!tag) return { title: 'Tag Tidak Ditemukan' }
  return {
    title: `${tag.name} | PorosMadura`,
    description: tag.description || undefined,
  }
}

export default async function TagPage({ params, searchParams }: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { slug } = await params
  const { page } = await searchParams
  const tag = await getTagBySlug(slug)
  if (!tag) notFound()

  const pageNum = parseInt(page || '1')
  const result = await getPublishedPosts({
    limit: 10, page: pageNum,
    where: { tags: { contains: tag.id } },
  })

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <h1 className="font-heading text-3xl font-black text-poros-navy mb-2">#{tag.name}</h1>
      {tag.description && <p className="text-gray-600 mb-8">{tag.description}</p>}
      <div className="flex flex-col gap-6">
        {result.docs.map((post) => <ArticleCard key={post.id} post={post} />)}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create author page**

```tsx
import { getAuthorBySlug, getPublishedPosts } from '@/lib/payload'
import { getImageSizeUrl } from '@/lib/media'
import { ArticleCard } from '@/components/article/ArticleCard'
import { notFound } from 'next/navigation'
import { Facebook, Twitter, Instagram } from 'lucide-react'
import type { Metadata } from 'next'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const author = await getAuthorBySlug(slug)
  if (!author) return { title: 'Penulis Tidak Ditemukan' }
  return { title: `${author.name} | PorosMadura`, description: author.bio || undefined }
}

export default async function AuthorPage({ params, searchParams }: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { slug } = await params
  const { page } = await searchParams
  const author = await getAuthorBySlug(slug)
  if (!author) notFound()

  const pageNum = parseInt(page || '1')
  const result = await getPublishedPosts({
    limit: 10, page: pageNum,
    where: { author: { equals: author.id } },
  })

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-6 items-start mb-10 p-6 bg-white rounded-2xl border border-gray-200">
        {author.avatar && (
          <img src={getImageSizeUrl(author.avatar, 'thumbnail')} alt={author.name}
            className="w-24 h-24 rounded-full object-cover shrink-0" />
        )}
        <div>
          <h1 className="font-heading text-3xl font-black text-poros-navy mb-2">{author.name}</h1>
          {author.bio && <p className="text-gray-600 mb-4">{author.bio}</p>}
          {author.socialLinks && (
            <div className="flex gap-3">
              {(author.socialLinks as Record<string, string>)?.facebook && (
                <a href={(author.socialLinks as Record<string, string>).facebook} className="text-gray-400 hover:text-blue-600">
                  <Facebook size={20} />
                </a>
              )}
              {(author.socialLinks as Record<string, string>)?.twitter && (
                <a href={(author.socialLinks as Record<string, string>).twitter} className="text-gray-400 hover:text-blue-400">
                  <Twitter size={20} />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-6">
        {result.docs.map((post) => <ArticleCard key={post.id} post={post} />)}
      </div>
    </div>
  )
}
```

### Task 3.6: Search Page

**File:** `src/app/(public)/search/page.tsx` (Meilisearch integration — wireframe for Phase 3, full integration in Phase 4)

- [ ] **Step 1: Create search page with basic client-side search**

```tsx
'use client'

import { Search as SearchIcon } from 'lucide-react'
import { useState } from 'react'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<unknown[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data.items || [])
    } catch {
      setResults([])
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 max-w-4xl">
      <h1 className="font-heading text-3xl font-black text-poros-navy mb-6">Pencarian</h1>
      <form onSubmit={handleSearch} className="relative mb-8">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari berita..."
          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-poros-red focus:outline-none text-lg"
        />
      </form>
      {searched && (
        <p className="text-gray-500 mb-4">
          {results.length > 0
            ? `Menampilkan ${results.length} hasil untuk "${query}"`
            : `Tidak ditemukan hasil untuk "${query}"`
          }
        </p>
      )}
    </div>
  )
}
```


### Task 3.7: SEO Components

**Files:**
- Create: `src/components/seo/JsonLd.tsx`
- Create: `src/components/seo/Breadcrumb.tsx`
- Create: `src/lib/seo.ts`

- [ ] **Step 1: Create JSON-LD NewsArticle component**

```tsx
// src/components/seo/JsonLd.tsx
interface JsonLdPost {
  title: string
  excerpt?: string
  publishedAt?: string
  updatedAt?: string
  featuredImage?: unknown
  category?: { name?: string } | string
  author?: { name?: string } | string
  slug: string
}

export function JsonLd({ post }: { post: JsonLdPost }) {
  const categoryName = typeof post.category === 'object' ? post.category?.name : post.category
  const authorName = typeof post.author === 'object' ? post.author?.name : 'Redaksi'
  const imageUrl = typeof post.featuredImage === 'object'
    ? (post.featuredImage as Record<string, unknown>)?.url as string
    : ''

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    description: post.excerpt,
    image: imageUrl ? [imageUrl] : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'PorosMadura',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_SITE_URL || ''}/${post.slug}`,
    },
    articleSection: categoryName || undefined,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
```

- [ ] **Step 2: Create Breadcrumb component**

```tsx
// src/components/seo/Breadcrumb.tsx
import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${process.env.NEXT_PUBLIC_SITE_URL || ''}${item.href}` } : {}),
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <ChevronRight size={14} />}
            {item.href ? (
              <a href={item.href} className="hover:text-poros-red transition-colors font-medium">{item.label}</a>
            ) : (
              <span className="text-gray-800 font-semibold">{item.label}</span>
            )}
          </span>
        ))}
      </nav>
    </>
  )
}
```

- [ ] **Step 3: Create SEO metadata helpers**

```ts
// src/lib/seo.ts
import type { Metadata } from 'next'

interface DefaultMeta {
  title?: string
  description?: string
  image?: string
}

export function getDefaultMetadata(overrides?: DefaultMeta): Metadata {
  return {
    title: overrides?.title || 'PorosMadura | Berita Tepat, Fakta Kuat',
    description: overrides?.description || 'Portal berita digital Madura yang menyajikan informasi cepat, akurat, dan kredibel.',
    openGraph: {
      siteName: 'PorosMadura',
      locale: 'id_ID',
      type: 'website',
      images: overrides?.image ? [{ url: overrides.image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
    },
    robots: { index: true, follow: true },
  }
}
```


### Task 3.8: Sitemap, News Sitemap, RSS, Robots

**Files:**
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`
- Create: `src/app/rss.xml/route.ts`

- [ ] **Step 1: Create main sitemap**

```ts
// src/app/sitemap.ts
import { getPayload } from 'payload'
import config from '@/payload.config'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://porosmadura.com'

  // Static pages
  const staticPages = [
    { url: siteUrl, priority: 1.0, changeFrequency: 'hourly' as const },
    { url: `${siteUrl}/tentang-kami`, priority: 0.5, changeFrequency: 'monthly' as const },
    { url: `${siteUrl}/redaksi`, priority: 0.5, changeFrequency: 'monthly' as const },
    { url: `${siteUrl}/kontak`, priority: 0.5, changeFrequency: 'monthly' as const },
    { url: `${siteUrl}/pedoman-media-siber`, priority: 0.3, changeFrequency: 'yearly' as const },
    { url: `${siteUrl}/privacy-policy`, priority: 0.3, changeFrequency: 'yearly' as const },
    { url: `${siteUrl}/disclaimer`, priority: 0.3, changeFrequency: 'yearly' as const },
  ]

  // Published posts
  const { docs: posts } = await payload.find({
    collection: 'posts',
    limit: 1000,
    where: {
      status: { equals: 'published' },
      publishedAt: { less_than_equal: new Date().toISOString() },
    },
    sort: '-publishedAt',
    depth: 1,
  })

  const postUrls = posts.map((post) => {
    const categorySlug = typeof post.category === 'object' ? post.category?.slug : ''
    return {
      url: `${siteUrl}/${categorySlug}/${post.slug}`,
      lastModified: post.updatedAt || post.publishedAt,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }
  })

  // Categories
  const { docs: categories } = await payload.find({
    collection: 'categories',
    limit: 100,
    where: { isActive: { equals: true } },
  })

  const categoryUrls = categories.map((cat) => ({
    url: `${siteUrl}/category/${cat.slug}`,
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }))

  // Tags
  const { docs: tags } = await payload.find({
    collection: 'tags',
    limit: 100,
    where: { isActive: { equals: true } },
  })

  const tagUrls = tags.map((tag) => ({
    url: `${siteUrl}/tag/${tag.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.4,
  }))

  // Authors
  const { docs: authors } = await payload.find({
    collection: 'authors',
    limit: 100,
    where: { isActive: { equals: true } },
  })

  const authorUrls = authors.map((author) => ({
    url: `${siteUrl}/author/${author.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.4,
  }))

  return [
    ...staticPages,
    ...postUrls,
    ...categoryUrls,
    ...tagUrls,
    ...authorUrls,
  ]
}
```

- [ ] **Step 2: Create robots.txt**

```ts
// src/app/robots.ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://porosmadura.com'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api'],
    },
    sitemap: [
      `${siteUrl}/sitemap.xml`,
      `${siteUrl}/news-sitemap.xml`,
    ],
  }
}
```

- [ ] **Step 3: Create RSS feed**

```ts
// src/app/rss.xml/route.ts
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET() {
  const payload = await getPayload({ config })
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://porosmadura.com'

  const { docs: posts } = await payload.find({
    collection: 'posts',
    limit: 50,
    where: {
      status: { equals: 'published' },
      publishedAt: { less_than_equal: new Date().toISOString() },
    },
    sort: '-publishedAt',
    depth: 2,
  })

  const items = posts.map((post) => {
    const categoryName = typeof post.category === 'object' ? post.category?.name : ''
    const authorName = typeof post.author === 'object' ? post.author?.name : ''
    const categorySlug = typeof post.category === 'object' ? post.category?.slug : ''
    const excerpt = post.excerpt || post.title

    return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/${categorySlug}/${post.slug}</link>
      <description><![CDATA[${excerpt}]]></description>
      <pubDate>${new Date(post.publishedAt || '').toUTCString()}</pubDate>
      <guid>${siteUrl}/${categorySlug}/${post.slug}</guid>
      ${authorName ? `<author>${authorName}</author>` : ''}
      ${categoryName ? `<category>${categoryName}</category>` : ''}
    </item>`
  }).join('')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title>PorosMadura</title>
      <link>${siteUrl}</link>
      <description>Berita Tepat, Fakta Kuat</description>
      <language>id</language>
      <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
      ${items}
    </channel>
  </rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
```

- [ ] **Step 4: Verify SEO features**

Run: `npm run dev`

Expected:
- http://localhost:3000/sitemap.xml → valid XML listing all pages
- http://localhost:3000/robots.txt → valid robots config
- http://localhost:3000/rss.xml → valid RSS feed
- Article page has JSON-LD in the source

