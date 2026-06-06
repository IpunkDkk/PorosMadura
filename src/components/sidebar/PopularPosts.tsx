import { TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface PopularPost {
  title: string
  slug: string
  category?: { slug: string; name: string } | null
}

interface PopularPostsProps {
  posts: PopularPost[]
}

export function PopularPosts({ posts }: PopularPostsProps) {
  if (!posts || posts.length === 0) return null

  return (
    <div className="bg-surface p-6 rounded-2xl border border-border-light shadow-sm">
      <div className="flex items-center gap-2 border-b-2 border-border-light pb-3 mb-5">
        <TrendingUp className="text-poros-red" size={24} />
        <h3 className="font-heading text-xl font-black text-poros-navy">
          Terpopuler
        </h3>
      </div>
      <div className="space-y-6">
        {posts.slice(0, 5).map((post, index) => (
          <Link
            key={post.slug}
            href={`/${post.category?.slug ?? 'uncategorized'}/${post.slug}`}
            className="flex gap-4 group cursor-pointer items-start"
          >
            <div className="text-5xl font-black text-gray-200 group-hover:text-poros-red transition-colors leading-none tracking-tighter w-10 text-right shrink-0">
              {index + 1}
            </div>
            <div className="pt-1">
              {post.category?.name && (
                <span className="text-[10px] font-bold text-poros-navy uppercase tracking-wider mb-1 block">
                  {post.category.name}
                </span>
              )}
              <h4 className="font-heading font-bold text-gray-800 leading-snug group-hover:text-poros-red transition-colors line-clamp-3">
                {post.title}
              </h4>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
