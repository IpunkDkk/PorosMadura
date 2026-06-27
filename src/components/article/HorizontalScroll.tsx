import { getPublishedPosts } from '@/lib/custom-cms'
import { normalizePost } from '@/lib/cms'
import { ArticleCard } from '@/components/article/ArticleCard'

export default async function HorizontalScroll() {
  const result = await getPublishedPosts({ limit: 8, sort: '-publishedAt' })
  const posts = result.docs.map(normalizePost)

  if (!posts.length) return null

  return (
    <section className="w-full">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-4 border-b-2 border-border-light pb-3">
          <h3 className="font-heading text-2xl font-black text-poros-navy whitespace-nowrap">
            Trending <span className="text-poros-red">Sekarang</span>
          </h3>
        </div>

        <div className="overflow-x-auto hide-scrollbar -mx-4 lg:-mx-8">
          <div className="flex gap-5 px-4 lg:px-8 pb-2" style={{ minWidth: 'max-content' }}>
            {posts.map((post) => (
              <div key={post.id} className="w-72 flex-shrink-0 snap-start">
                <ArticleCard
                  title={post.title}
                  slug={post.slug}
                  excerpt={post.excerpt}
                  featuredImage={post.featuredImage}
                  category={post.category}
                  author={post.author}
                  publishedAt={post.publishedAt}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
