'use client'

import { Search as SearchIcon, Clock } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

interface SearchResult {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string | null
  categorySlug: string
  tags: string[]
  author: string
  authorSlug: string
  publishedAt: string
  featuredImage: string | null
  url: string
  isFeatured: boolean
  isBreakingNews: boolean
}

interface SearchResponse {
  items: SearchResult[]
  total: number
  page: number
  limit: number
}

function formatRelativeTime(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMinutes < 1) return 'Baru saja'
  if (diffMinutes < 60) return `${diffMinutes} menit yang lalu`
  if (diffHours < 24) return `${diffHours} jam yang lalu`
  if (diffDays < 7) return `${diffDays} hari yang lalu`

  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data: SearchResponse = await res.json()
      setResults(data.items || [])
      setTotal(data.total || 0)
    } catch {
      setResults([])
      setTotal(0)
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

      {loading && (
        <div className="space-y-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-5 items-start pb-6 border-b border-border-light">
              <div className="w-full sm:w-2/5 aspect-[16/9] sm:aspect-[4/3] rounded-xl bg-gray-200" />
              <div className="w-full sm:w-3/5 space-y-3">
                <div className="h-3 w-20 bg-gray-200 rounded" />
                <div className="h-5 w-full bg-gray-200 rounded" />
                <div className="h-5 w-3/4 bg-gray-200 rounded" />
                <div className="h-4 w-full bg-gray-200 rounded hidden md:block" />
                <div className="h-3 w-32 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
          <p className="text-gray-500 text-center pt-2">Mencari...</p>
        </div>
      )}

      {searched && !loading && results.length === 0 && (
        <div className="text-center py-16">
          <SearchIcon size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">
            Tidak ditemukan hasil untuk &quot;{query}&quot;
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Coba gunakan kata kunci lain atau periksa ejaan Anda
          </p>
        </div>
      )}

      {searched && !loading && results.length > 0 && (
        <>
          <p className="text-gray-500 mb-6">
            Menampilkan {total} hasil untuk &quot;{query}&quot;
          </p>
          <div className="flex flex-col gap-6">
            {results.map((post) => (
              <article
                key={post.id}
                className="group flex flex-col sm:flex-row gap-5 items-start cursor-pointer border-b border-border-light pb-6 last:border-0"
              >
                {/* Image */}
                <Link
                  href={`/${post.categorySlug || 'uncategorized'}/${post.slug}`}
                  className="w-full sm:w-2/5 aspect-[16/9] sm:aspect-[4/3] rounded-xl overflow-hidden relative shrink-0"
                >
                  <img
                    src={post.featuredImage || '/og-image.jpg'}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                {/* Content */}
                <div className="w-full sm:w-3/5 flex flex-col justify-center h-full pt-1 sm:pt-0">
                  {post.category && (
                    <span className="text-poros-red text-xs font-black uppercase tracking-wider mb-2 block">
                      {post.category}
                    </span>
                  )}
                  <Link href={`/${post.categorySlug || 'uncategorized'}/${post.slug}`}>
                    <h4 className="font-heading text-xl font-bold leading-snug mb-2 group-hover:text-poros-red transition-colors text-gray-900 line-clamp-2 sm:line-clamp-3">
                      {post.title}
                    </h4>
                  </Link>
                  <p className="text-text-secondary text-sm mb-4 line-clamp-2 hidden md:block leading-relaxed">
                    {post.excerpt}
                  </p>
                  {post.author && (
                    <div className="flex items-center text-xs text-gray-400 font-medium mt-auto">
                      <span>{post.author}</span>
                      {post.publishedAt && <span className="mx-2">&#8226;</span>}
                      {post.publishedAt && (
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} />
                          {formatRelativeTime(post.publishedAt)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
