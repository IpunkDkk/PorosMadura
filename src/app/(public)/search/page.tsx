import Link from 'next/link'
import Image from 'next/image'
import { Clock, Search as SearchIcon } from 'lucide-react'
import { getPublishedPosts, searchPublishedPostsFallback } from '@/lib/custom-cms'
import { normalizePost } from '@/lib/cms'
import { formatRelativeTime } from '@/lib/date'
import { getImageSizeUrl } from '@/lib/media'
import { searchPosts } from '@/lib/search'

type Props = {
  searchParams: Promise<{
    q?: string
    category?: string
    page?: string
    sort?: string
  }>
}

type SearchResult = {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string | null
  categorySlug: string
  author: string
  publishedAt: string
  featuredImage: string | null
  url: string
}

export const dynamic = 'force-dynamic'

function toPositivePage(value: string | undefined) {
  const parsed = Number(value || '1')
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

function searchItemFromPost(post: ReturnType<typeof normalizePost>): SearchResult {
  return {
    id: String(post.id),
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    category: post.category?.name || null,
    categorySlug: post.category?.slug || '',
    author: post.author?.name || '',
    publishedAt: post.publishedAt,
    featuredImage: getImageSizeUrl(post.featuredImage as Record<string, unknown> | null | undefined, 'card'),
    url: `/${post.category?.slug || 'uncategorized'}/${post.slug}`,
  }
}

function searchItemFromHit(hit: Record<string, unknown>): SearchResult {
  const slug = String(hit.slug || '')
  const categorySlug = String(hit.categorySlug || '')

  return {
    id: String(hit.id || slug),
    title: String(hit.title || ''),
    slug,
    excerpt: String(hit.excerpt || ''),
    category: hit.category ? String(hit.category) : null,
    categorySlug,
    author: hit.author ? String(hit.author) : '',
    publishedAt: hit.publishedAt ? String(hit.publishedAt) : '',
    featuredImage: hit.featuredImage ? String(hit.featuredImage) : null,
    url: String(hit.url || `/${categorySlug || 'uncategorized'}/${slug}`),
  }
}

function pageHref(params: {
  q: string
  category?: string
  sort?: string
  page: number
}) {
  const search = new URLSearchParams()
  if (params.q) search.set('q', params.q)
  if (params.category) search.set('category', params.category)
  if (params.sort) search.set('sort', params.sort)
  if (params.page > 1) search.set('page', String(params.page))
  const query = search.toString()
  return query ? `/search?${query}` : '/search'
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams
  const q = (params.q || '').trim()
  const category = params.category?.trim() || undefined
  const sort = params.sort?.trim() || undefined
  const page = toPositivePage(params.page)
  const limit = 10

  let items: SearchResult[] = []
  let total = 0
  let totalPages = 0
  let heading = 'Pencarian'
  let description = 'Masukkan kata kunci untuk mencari berita.'

  if (q) {
    const results = await searchPosts(q, { category, page, limit })

    if (results.total > 0) {
      items = (results.items as Record<string, unknown>[]).map(searchItemFromHit)
      total = results.total
      totalPages = Math.ceil(total / limit)
    } else {
      const fallback = await searchPublishedPostsFallback({ query: q, category, page, limit })
      items = fallback.docs.map(normalizePost).map(searchItemFromPost)
      total = fallback.totalDocs
      totalPages = fallback.totalPages
    }

    heading = 'Hasil pencarian'
    description = `Menampilkan ${total} hasil untuk "${q}".`
  } else if (sort === 'latest') {
    const result = await getPublishedPosts({ limit, page })
    items = result.docs.map(normalizePost).map(searchItemFromPost)
    total = result.totalDocs
    totalPages = result.totalPages
    heading = 'Berita terbaru'
    description = `Menampilkan ${total} berita terbaru.`
  }

  const hasSearched = Boolean(q || sort === 'latest')

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 lg:px-8">
      <h1 className="mb-2 font-heading text-3xl font-black text-poros-navy">{heading}</h1>
      <p className="mb-6 text-sm text-text-secondary">{description}</p>

      <form action="/search" className="relative mb-8">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Cari berita..."
          className="w-full rounded-xl border-2 border-gray-200 py-3 pl-12 pr-28 text-lg focus:border-poros-red focus:outline-none"
        />
        {category && <input type="hidden" name="category" value={category} />}
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 inline-flex -translate-y-1/2 items-center rounded-lg bg-poros-red px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
        >
          Cari
        </button>
      </form>

      {hasSearched && items.length === 0 && (
        <div className="py-16 text-center">
          <SearchIcon size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg text-gray-500">
            Tidak ditemukan hasil{q ? ` untuk "${q}"` : ''}.
          </p>
          <p className="mt-2 text-sm text-gray-400">
            Coba gunakan kata kunci lain atau periksa ejaan Anda.
          </p>
        </div>
      )}

      {items.length > 0 && (
        <>
          <div className="flex flex-col gap-6">
            {items.map((post) => (
              <article
                key={post.id}
                className="group flex flex-col items-start gap-5 border-b border-border-light pb-6 last:border-0 sm:flex-row"
              >
                <Link
                  href={post.url}
                  className="relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded-xl sm:aspect-[4/3] sm:w-2/5"
                >
                  <Image
                    src={post.featuredImage || '/og-image.jpg'}
                    alt={post.title}
                    fill
                    sizes="(min-width: 640px) 40vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
                <div className="flex h-full w-full flex-col justify-center pt-1 sm:w-3/5 sm:pt-0">
                  {post.category && (
                    <span className="mb-2 block text-xs font-black uppercase tracking-wider text-poros-red">
                      {post.category}
                    </span>
                  )}
                  <Link href={post.url}>
                    <h2 className="mb-2 font-heading text-xl font-bold leading-snug text-gray-900 line-clamp-3 transition-colors group-hover:text-poros-red">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="mb-4 hidden text-sm leading-relaxed text-text-secondary line-clamp-2 md:block">
                    {post.excerpt}
                  </p>
                  <div className="mt-auto flex items-center text-xs font-medium text-gray-400">
                    {post.author && <span>{post.author}</span>}
                    {post.author && post.publishedAt && <span className="mx-2">&#8226;</span>}
                    {post.publishedAt && (
                      <span className="inline-flex items-center gap-1">
                        <Clock size={12} />
                        {formatRelativeTime(post.publishedAt)}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {page > 1 && (
                <Link
                  href={pageHref({ q, category, sort, page: page - 1 })}
                  className="rounded-lg border bg-white px-4 py-2 font-medium hover:bg-gray-50"
                >
                  Sebelumnya
                </Link>
              )}
              <span className="px-3 py-2 text-sm font-semibold text-text-secondary">
                {page} / {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={pageHref({ q, category, sort, page: page + 1 })}
                  className="rounded-lg bg-poros-navy px-4 py-2 font-medium text-white hover:bg-poros-navy/90"
                >
                  Selanjutnya
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
