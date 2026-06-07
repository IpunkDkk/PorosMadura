import { getCategoryBySlug, getPublishedPosts } from '@/lib/payload'
import { ArticleCard } from '@/components/article/ArticleCard'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { normalizePost } from '@/lib/cms'
import AdSlot from '@/components/ads/AdSlot'
import { PopularPosts } from '@/components/sidebar/PopularPosts'
import { SocialFollow } from '@/components/sidebar/SocialFollow'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return { title: 'Kategori Tidak Ditemukan - PorosMadura' }
  const cat = category as Record<string, unknown>
  return {
    title: (cat.seoTitle as string) || `${cat.name as string} | PorosMadura`,
    description: (cat.seoDescription as string) || (cat.description as string) || undefined,
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { page } = await searchParams
  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  const cat = category as Record<string, unknown>
  const pageNum = Math.max(1, parseInt(page || '1', 10) || 1)
  const result = await getPublishedPosts({
    limit: 10,
    page: pageNum,
    where: { category: { equals: cat.id } },
  })

  const catName = cat.name as string
  const catDescription = cat.description as string | undefined
  const totalPages = (result as { totalPages: number }).totalPages

  const popularResult = await getPublishedPosts({ limit: 5, sort: '-views' })
  const popularPosts = popularResult.docs.map(normalizePost)

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <h1 className="font-heading text-3xl font-black text-poros-navy mb-2">{catName}</h1>
      {catDescription && (
        <p className="text-gray-600 mb-8">{catDescription}</p>
      )}
      <AdSlot placement="category_top" className="my-6" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          <div className="flex flex-col gap-6">
            {result.docs.map(normalizePost).map((post) => (
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
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {pageNum > 1 && (
                <a href={`/category/${slug}?page=${pageNum - 1}`} className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 font-medium">
                  Sebelumnya
                </a>
              )}
              {pageNum < totalPages && (
                <a href={`/category/${slug}?page=${pageNum + 1}`} className="px-4 py-2 bg-poros-navy text-white rounded-lg hover:bg-poros-navy/90 font-medium">
                  Selanjutnya
                </a>
              )}
            </div>
          )}
        </div>

        <aside className="lg:col-span-4 space-y-10">
          <AdSlot placement="category_sidebar" />
          <PopularPosts posts={popularPosts} />
          <SocialFollow />
        </aside>
      </div>
    </div>
  )
}
