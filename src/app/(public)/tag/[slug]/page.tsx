import { getTagBySlug, getPublishedPosts } from '@/lib/payload'
import { ArticleCard } from '@/components/article/ArticleCard'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { normalizePost } from '@/lib/cms'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const tag = await getTagBySlug(slug)
  if (!tag) return { title: 'Tag Tidak Ditemukan - PorosMadura' }
  const t = tag as Record<string, unknown>
  return {
    title: `${t.name as string} | PorosMadura`,
    description: (t.description as string) || undefined,
  }
}

export default async function TagPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { page } = await searchParams
  const tag = await getTagBySlug(slug)
  if (!tag) notFound()

  const t = tag as Record<string, unknown>
  const pageNum = Math.max(1, parseInt(page || '1', 10) || 1)
  const result = await getPublishedPosts({
    limit: 10,
    page: pageNum,
    where: { tags: { in: [t.id] } },
  })

  const tagName = t.name as string
  const tagDescription = t.description as string | undefined

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <h1 className="font-heading text-3xl font-black text-poros-navy mb-2">#{tagName}</h1>
      {tagDescription && <p className="text-gray-600 mb-8">{tagDescription}</p>}
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
      {result.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {pageNum > 1 && (
            <a href={`/tag/${slug}?page=${pageNum - 1}`} className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 font-medium">
              Sebelumnya
            </a>
          )}
          {pageNum < result.totalPages && (
            <a href={`/tag/${slug}?page=${pageNum + 1}`} className="px-4 py-2 bg-poros-navy text-white rounded-lg hover:bg-poros-navy/90 font-medium">
              Selanjutnya
            </a>
          )}
        </div>
      )}
    </div>
  )
}
