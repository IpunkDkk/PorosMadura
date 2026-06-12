import { getActiveCategories, getPublishedPosts } from '@/lib/payload'
import { normalizeCategory, normalizePost } from '@/lib/cms'
import { ArticleCard } from '@/components/article/ArticleCard'
import Link from 'next/link'

export default async function CategorySections() {
  const categoriesResult = await getActiveCategories()
  const categories = categoriesResult.docs
    .map(normalizeCategory)
    .filter(Boolean)

  if (!categories.length) return null

  const sections = await Promise.all(
    categories.map(async (cat) => {
      if (!cat) return null
      const result = await getPublishedPosts({
        limit: 5,
        where: { category: { equals: cat.id } },
      })
      const posts = result.docs.map(normalizePost)
      return { category: cat, posts }
    }),
  )

  const validSections = sections.filter(
    (s): s is NonNullable<typeof s> & { posts: NonNullable<ReturnType<typeof normalizePost>>[] } =>
      s !== null && s.posts.length > 0,
  )

  if (!validSections.length) return null

  return (
    <section className="w-full">
      <div className="container mx-auto px-4 lg:px-8">
        {validSections.map(({ category: cat, posts }) => (
          <div key={cat.slug} className="mb-10 last:mb-0">
            <div className="flex items-center justify-between mb-4 border-b-2 border-border-light pb-3">
              <h3 className="font-heading text-2xl font-black text-poros-navy">
                {cat.name}
              </h3>
              <Link
                href={`/category/${cat.slug}`}
                className="text-sm font-semibold text-poros-red hover:text-red-700 transition-colors"
              >
                Lihat Semua →
              </Link>
            </div>

            <div className="flex flex-col gap-5">
              {posts.map((post) => (
                <ArticleCard
                  key={post.id}
                  title={post.title}
                  slug={post.slug}
                  excerpt={post.excerpt}
                  featuredImage={post.featuredImage}
                  category={post.category}
                  author={post.author}
                  publishedAt={post.publishedAt}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
