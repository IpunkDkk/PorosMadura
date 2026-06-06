import { getAuthorBySlug, getPublishedPosts } from '@/lib/payload'
import { getImageSizeUrl } from '@/lib/media'
import { ArticleCard } from '@/components/article/ArticleCard'
import { notFound } from 'next/navigation'
import { Facebook, Twitter, Instagram } from 'lucide-react'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const author = await getAuthorBySlug(slug)
  if (!author) return { title: 'Penulis Tidak Ditemukan - PorosMadura' }
  const a = author as Record<string, unknown>
  return {
    title: `${a.name as string} | PorosMadura`,
    description: (a.bio as string) || undefined,
  }
}

export default async function AuthorPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { page } = await searchParams
  const author = await getAuthorBySlug(slug)
  if (!author) notFound()

  const a = author as Record<string, unknown>
  const pageNum = parseInt(page || '1')
  const result = await getPublishedPosts({
    limit: 10,
    page: pageNum,
    where: { author: { equals: a.id as string } },
  })

  const authorName = a.name as string
  const authorBio = a.bio as string | undefined
  const authorAvatar = a.avatar as Record<string, unknown> | null | undefined
  const socialLinks = a.socialLinks as Record<string, string> | undefined

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-6 items-start mb-10 p-6 bg-white rounded-2xl border border-gray-200">
        {authorAvatar && (
          <img
            src={getImageSizeUrl(authorAvatar, 'thumbnail')}
            alt={authorName}
            className="w-24 h-24 rounded-full object-cover shrink-0"
          />
        )}
        <div>
          <h1 className="font-heading text-3xl font-black text-poros-navy mb-2">{authorName}</h1>
          {authorBio && <p className="text-gray-600 mb-4">{authorBio}</p>}
          {socialLinks && (
            <div className="flex gap-3">
              {socialLinks.facebook && (
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600">
                  <Facebook size={20} />
                </a>
              )}
              {socialLinks.twitter && (
                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400">
                  <Twitter size={20} />
                </a>
              )}
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-600">
                  <Instagram size={20} />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-6">
        {(result.docs as Array<Record<string, unknown>>).map((post: Record<string, unknown>) => (
          <ArticleCard
            key={post.id as string}
            title={post.title as string}
            slug={post.slug as string}
            excerpt={post.excerpt as string}
            featuredImage={post.featuredImage}
            category={post.category as { slug: string; name: string } | null | undefined}
            author={post.author as { name: string; slug: string } | null | undefined}
            publishedAt={post.publishedAt as string}
          />
        ))}
      </div>
    </div>
  )
}
