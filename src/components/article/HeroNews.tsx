import { User, Clock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { getImageSizeUrl } from '@/lib/media'
import { formatRelativeTime } from '@/lib/date'

interface HeroPost {
  title: string
  slug: string
  featuredImage?: unknown
  category?: { slug: string; name: string } | null
  author?: { name: string; slug?: string } | null
  publishedAt: string
}

interface HeroNewsProps {
  featured: HeroPost[]
}

export function HeroNews({ featured }: HeroNewsProps) {
  if (!featured || featured.length === 0) return null

  const main = featured[0]
  const subHeroes = featured.slice(1, 3)

  return (
    <section className="mb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Hero (Left - Span 2) */}
        <Link
          href={`/${main.category?.slug ?? 'uncategorized'}/${main.slug}`}
          className="lg:col-span-2 relative group cursor-pointer overflow-hidden rounded-2xl bg-black"
        >
          <div className="aspect-[4/3] lg:aspect-[16/9] relative">
            <Image
              src={getImageSizeUrl(main.featuredImage as Record<string, unknown> | null | undefined, 'hero')}
              alt={main.title}
              fill
              priority
              sizes="(min-width: 1024px) 66vw, 100vw"
              className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-700 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 text-white z-10">
            {main.category?.name && (
              <span className="bg-poros-red text-white text-xs font-bold uppercase px-3 py-1 rounded mb-3 inline-block">
                {main.category.name}
              </span>
            )}
            <h2 className="font-heading text-2xl md:text-4xl font-bold leading-tight mb-3 drop-shadow-md">
              {main.title}
            </h2>
            <div className="flex items-center text-gray-200 text-xs md:text-sm gap-4 font-medium">
              {main.author?.name && (
                <span className="flex items-center gap-1.5">
                  <User size={14} /> {main.author.name}
                </span>
              )}
              {main.publishedAt && (
                <span className="flex items-center gap-1.5">
                  <Clock size={14} /> {formatRelativeTime(main.publishedAt)}
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* Sub Heroes (Right - Stacked 2) */}
        {subHeroes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {subHeroes.map((news) => (
              <Link
                key={news.slug}
                href={`/${news.category?.slug ?? 'uncategorized'}/${news.slug}`}
                className="relative group cursor-pointer overflow-hidden rounded-2xl bg-black h-full sm:aspect-[4/3] lg:aspect-auto"
              >
                <div className="absolute inset-0 h-full w-full">
                  <Image
                    src={getImageSizeUrl(news.featuredImage as Record<string, unknown> | null | undefined, 'card')}
                    alt={news.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-700 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 w-full p-5 text-white z-10">
                  {news.category?.name && (
                    <span className="bg-poros-navy text-white text-[10px] font-bold uppercase px-2 py-1 rounded mb-2 inline-block">
                      {news.category.name}
                    </span>
                  )}
                  <h2 className="font-heading text-lg md:text-xl font-bold leading-snug drop-shadow-md line-clamp-3">
                    {news.title}
                  </h2>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
