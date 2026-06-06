import Link from 'next/link'
import { getImageSizeUrl } from '@/lib/media'
import { formatRelativeTime } from '@/components/article/HeroNews'

interface ArticleCardProps {
  title: string
  slug: string
  excerpt: string
  featuredImage?: unknown
  category?: { slug: string; name: string } | null
  author?: { name: string; slug: string } | null
  publishedAt: string
}

export function ArticleCard({
  title,
  slug,
  excerpt,
  featuredImage,
  category,
  author,
  publishedAt,
}: ArticleCardProps) {
  return (
    <article className="group flex flex-col sm:flex-row gap-5 items-start cursor-pointer border-b border-border-light pb-6 last:border-0">
      {/* Image */}
      <Link
        href={`/${category?.slug ?? 'uncategorized'}/${slug}`}
        className="w-full sm:w-2/5 aspect-[16/9] sm:aspect-[4/3] rounded-xl overflow-hidden relative shrink-0"
      >
        <img
          src={getImageSizeUrl(featuredImage as Record<string, unknown> | null | undefined, 'card')}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </Link>
      {/* Content */}
      <div className="w-full sm:w-3/5 flex flex-col justify-center h-full pt-1 sm:pt-0">
        {category?.name && (
          <span className="text-poros-red text-xs font-black uppercase tracking-wider mb-2 block">
            {category.name}
          </span>
        )}
        <Link href={`/${category?.slug ?? 'uncategorized'}/${slug}`}>
          <h4 className="font-heading text-xl font-bold leading-snug mb-2 group-hover:text-poros-red transition-colors text-gray-900 line-clamp-2 sm:line-clamp-3">
            {title}
          </h4>
        </Link>
        <p className="text-text-secondary text-sm mb-4 line-clamp-2 hidden md:block leading-relaxed">
          {excerpt}
        </p>
        <div className="flex items-center text-xs text-gray-400 font-medium mt-auto">
          {author?.name && <span>{author.name}</span>}
          {author?.name && publishedAt && <span className="mx-2">&#8226;</span>}
          {publishedAt && <span>{formatRelativeTime(publishedAt)}</span>}
        </div>
      </div>
    </article>
  )
}
