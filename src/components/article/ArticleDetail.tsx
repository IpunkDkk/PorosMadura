import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock, User } from 'lucide-react'
import { getPublishedPosts } from '@/lib/custom-cms'
import { asRecord, normalizePost, renderRichText } from '@/lib/cms'
import { getImageSizeUrl } from '@/lib/media'
import AdSlot from '@/components/ads/AdSlot'
import { ViewTracker } from '@/components/article/ViewTracker'
import { PopularPosts } from '@/components/sidebar/PopularPosts'
import { SocialFollow } from '@/components/sidebar/SocialFollow'

type ArticleDetailProps = {
  post: unknown
  slug: string
  preview?: boolean
}

function splitHtmlAtMiddle(html: string): [string, string] {
  const half = Math.floor(html.length / 2)
  const before = html.lastIndexOf('</p>', half)
  const after = html.indexOf('<p>', half)
  const splitAt = before > 0 && (after < 0 || half - before < after - half) ? before + 4 : after
  if (splitAt < 0) return [html, '']
  return [html.slice(0, splitAt), html.slice(splitAt)]
}

export async function ArticleDetail({ post, slug, preview = false }: ArticleDetailProps) {
  const postData = asRecord(post)
  const categoryData = asRecord(postData.category)
  const authorData = asRecord(postData.author)
  const tagsData = Array.isArray(postData.tags) ? postData.tags.map(asRecord) : []
  const contentHtml = await renderRichText(postData.content)
  const contentParts = splitHtmlAtMiddle(contentHtml)

  const categoryName = String(categoryData.name || '')
  const categorySlug = String(categoryData.slug || '')
  const authorName = String(authorData.name || 'Redaksi')
  const authorSlug = authorData.slug ? String(authorData.slug) : ''
  const publishedAt = postData.publishedAt ? String(postData.publishedAt) : ''
  const readingTime = typeof postData.readingTime === 'number' ? postData.readingTime : null

  const [popularResult] = await Promise.all([
    getPublishedPosts({ limit: 5, sort: '-views' }),
  ])
  const popularPosts = popularResult.docs.map(normalizePost)

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 max-w-6xl">
      {!preview && <ViewTracker postId={postData.id as number | string} />}

      {preview && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
          Mode preview CMS. Artikel ini belum tentu sudah terlihat publik.
        </div>
      )}

      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-poros-red transition-colors font-medium">Home</Link>
        <span className="text-gray-300">/</span>
        {categoryName && (
          <>
            <Link href={`/category/${categorySlug}`} className="hover:text-poros-red transition-colors font-medium">{categoryName}</Link>
            <span className="text-gray-300">/</span>
          </>
        )}
        <span className="text-gray-800 font-semibold truncate">{String(postData.title || '')}</span>
      </nav>

      {!preview && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'NewsArticle',
              headline: postData.title,
              description: postData.excerpt,
              datePublished: postData.publishedAt,
              dateModified: postData.updatedAt || postData.publishedAt,
              author: { '@type': 'Person', name: authorName },
              publisher: { '@type': 'Organization', name: 'PorosMadura', logo: { '@type': 'ImageObject', url: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/logo.png` } },
              mainEntityOfPage: { '@type': 'WebPage', '@id': `${process.env.NEXT_PUBLIC_SITE_URL || ''}/${categorySlug}/${slug}` },
              articleSection: categoryName || undefined,
            }),
          }}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <article className="lg:col-span-8">
          <h1 className="font-heading text-3xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
            {String(postData.title || '')}
          </h1>
          {Boolean(postData.excerpt) && (
            <p className="text-lg text-gray-600 leading-relaxed mb-6 font-medium">
              {String(postData.excerpt)}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-200">
            {authorSlug ? (
              <Link href={`/author/${authorSlug}`} className="flex items-center gap-1.5 hover:text-poros-red font-medium">
                <User size={16} /> {authorName}
              </Link>
            ) : (
              <span className="flex items-center gap-1.5"><User size={16} /> {authorName}</span>
            )}
            {publishedAt && (
              <span className="flex items-center gap-1.5">
                <Calendar size={16} />
                {new Date(publishedAt).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            )}
            {readingTime ? (
              <span className="flex items-center gap-1.5"><Clock size={16} /> {readingTime} menit baca</span>
            ) : null}
          </div>

          {!!postData.featuredImage && (
            <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-2xl">
              <Image
                src={getImageSizeUrl(postData.featuredImage as Record<string, unknown> | null | undefined, 'hero')}
                alt={String(postData.title || '')}
                fill
                priority
                sizes="(min-width: 1024px) 768px, 100vw"
                className="object-cover"
              />
            </div>
          )}

          <AdSlot placement="article_top" className="my-6" />

          <div className="prose prose-lg prose-headings:font-heading max-w-none leading-relaxed">
            <div dangerouslySetInnerHTML={{ __html: contentParts[0] }} />
          </div>

          <AdSlot placement="article_middle" className="my-6" />

          {contentParts[1] && (
            <div className="prose prose-lg prose-headings:font-heading max-w-none mb-8 leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: contentParts[1] }} />
            </div>
          )}

          <AdSlot placement="article_bottom" className="my-6" />

          {tagsData.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {tagsData
                .filter((tag) => tag.slug && tag.name)
                .map((tag) => (
                  <a
                    key={String(tag.id)}
                    href={`/tag/${tag.slug as string}`}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                  >
                    #{String(tag.name)}
                  </a>
                ))}
            </div>
          )}
        </article>

        <aside className="lg:col-span-4 space-y-10">
          <AdSlot placement="article_sidebar" />
          <PopularPosts posts={popularPosts} />
          <SocialFollow />
        </aside>
      </div>
    </div>
  )
}
