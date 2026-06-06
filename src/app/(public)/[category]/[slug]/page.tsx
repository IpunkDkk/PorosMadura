import { getPostBySlug } from '@/lib/payload'
import { getImageSizeUrl } from '@/lib/media'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Clock, User, Calendar } from 'lucide-react'
import { convertLexicalToHTMLAsync } from '@payloadcms/richtext-lexical/html-async'

interface Props {
  params: Promise<{ category: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params
  const post = await getPostBySlug(category, slug)
  if (!post) return { title: 'Artikel Tidak Ditemukan - PorosMadura' }

  const categoryName = typeof post.category === 'object' ? (post.category as Record<string, string>)?.name : ''
  const authorName = typeof post.author === 'object' ? (post.author as Record<string, string>)?.name : ''
  const rawOgImage = (post as Record<string, unknown>).ogImage || (post as Record<string, unknown>).featuredImage
  const ogImage = getImageSizeUrl(rawOgImage as Record<string, unknown> | null | undefined, 'og')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://porosmadura.com'

  return {
    title: (post as Record<string, string>).seoTitle || post.title,
    description: (post as Record<string, string>).seoDescription || (post as Record<string, string>).excerpt,
    openGraph: {
      title: (post as Record<string, string>).seoTitle || post.title,
      description: (post as Record<string, string>).seoDescription || (post as Record<string, string>).excerpt,
      type: 'article',
      publishedTime: (post as Record<string, string>).publishedAt,
      modifiedTime: (post as Record<string, string>).updatedAt,
      authors: authorName ? [authorName] : undefined,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title: (post as Record<string, string>).seoTitle || post.title,
      description: (post as Record<string, string>).seoDescription || (post as Record<string, string>).excerpt,
      images: [ogImage],
    },
    robots: (post as Record<string, boolean>).allowIndex !== false ? { index: true, follow: true } : { index: false, follow: false },
    alternates: {
      canonical: (post as Record<string, string>).canonicalUrl || `${siteUrl}/${category}/${slug}`,
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { category, slug } = await params
  const post = await getPostBySlug(category, slug)
  if (!post) notFound()

  const postData = post as Record<string, unknown>
  const categoryData = postData.category as Record<string, string> | undefined
  const authorData = postData.author as Record<string, string> | undefined
  const tagsData = postData.tags as Record<string, unknown>[] | undefined

  // Convert Lexical rich text to HTML (server-side)
  let contentHtml = ''
  try {
    const lexicalContent = postData.content as Record<string, unknown> | null
    if (lexicalContent && typeof lexicalContent === 'object' && 'root' in lexicalContent) {
      contentHtml = await convertLexicalToHTMLAsync({ data: lexicalContent as any })
    }
  } catch {
    contentHtml = '<p>Konten tidak tersedia</p>'
  }

  const categoryName = categoryData?.name || ''
  const categorySlug = categoryData?.slug || ''
  const authorName = authorData?.name || 'Redaksi'
  const authorSlug = authorData?.slug || ''

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 max-w-6xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <a href="/" className="hover:text-poros-red transition-colors font-medium">Home</a>
        <span className="text-gray-300">/</span>
        {categoryName && (
          <>
            <a href={`/category/${categorySlug}`} className="hover:text-poros-red transition-colors font-medium">{categoryName}</a>
            <span className="text-gray-300">/</span>
          </>
        )}
        <span className="text-gray-800 font-semibold truncate">{post.title}</span>
      </nav>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: post.title,
            description: (postData as Record<string, string>).excerpt,
            datePublished: (postData as Record<string, string>).publishedAt,
            dateModified: (postData as Record<string, string>).updatedAt || (postData as Record<string, string>).publishedAt,
            author: { '@type': 'Person', name: authorName },
            publisher: { '@type': 'Organization', name: 'PorosMadura', logo: { '@type': 'ImageObject', url: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/logo.png` } },
            mainEntityOfPage: { '@type': 'WebPage', '@id': `${process.env.NEXT_PUBLIC_SITE_URL || ''}/${categorySlug}/${slug}` },
            articleSection: categoryName || undefined,
          })
        }}
      />

      <article className="max-w-4xl mx-auto">
        <h1 className="font-heading text-3xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
          {post.title}
        </h1>
        {(postData as Record<string, string>).excerpt && (
          <p className="text-lg text-gray-600 leading-relaxed mb-6 font-medium">
            {(postData as Record<string, string>).excerpt}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-200">
          {authorSlug ? (
            <a href={`/author/${authorSlug}`} className="flex items-center gap-1.5 hover:text-poros-red font-medium">
              <User size={16} /> {authorName}
            </a>
          ) : (
            <span className="flex items-center gap-1.5"><User size={16} /> {authorName}</span>
          )}
          {(postData as Record<string, string>).publishedAt && (
            <span className="flex items-center gap-1.5">
              <Calendar size={16} />
              {new Date((postData as Record<string, string>).publishedAt!).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          )}
          {(postData as Record<string, number>).readingTime ? (
            <span className="flex items-center gap-1.5"><Clock size={16} /> {(postData as Record<string, number>).readingTime} menit baca</span>
          ) : null}
        </div>

        {!!(postData as Record<string, unknown>).featuredImage && (
          <div className="mb-8 rounded-2xl overflow-hidden">
            <img
              src={getImageSizeUrl((postData as Record<string, unknown>).featuredImage as Record<string, unknown> | null | undefined, 'hero')}
              alt={post.title}
              className="w-full h-auto"
            />
          </div>
        )}

        <div className="prose prose-lg prose-headings:font-heading max-w-none mb-8 leading-relaxed">
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </div>

        {tagsData && tagsData.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {tagsData.map((tag: Record<string, unknown>) => (
              <a
                key={tag.id as string}
                href={`/tag/${tag.slug as string}`}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
              >
                #{tag.name as string}
              </a>
            ))}
          </div>
        )}
      </article>
    </div>
  )
}
