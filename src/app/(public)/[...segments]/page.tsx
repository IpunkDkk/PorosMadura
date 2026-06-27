import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPageBySlug, getPostBySlug } from '@/lib/custom-cms'
import { getImageSizeUrl } from '@/lib/media'
import { asRecord, renderRichText } from '@/lib/cms'
import { ArticleDetail } from '@/components/article/ArticleDetail'

interface Props {
  params: Promise<{ segments?: string[] }>
}

export const dynamic = 'force-dynamic'

function getSegments(params: { segments?: string[] }) {
  return params.segments || []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const segments = getSegments(await params)

  if (segments.length === 1) {
    const page = await getPageBySlug(segments[0])
    if (!page) return { title: 'Halaman Tidak Ditemukan - PorosMadura' }
    const data = asRecord(page)
    return {
      title: String(data.seoTitle || data.title || 'Halaman'),
      description: data.seoDescription ? String(data.seoDescription) : undefined,
    }
  }

  if (segments.length === 2) {
    const [category, slug] = segments
    const post = await getPostBySlug(category, slug)
    if (!post) return { title: 'Artikel Tidak Ditemukan - PorosMadura' }

    const postData = asRecord(post)
    const categoryData = asRecord(postData.category)
    const authorData = asRecord(postData.author)
    const categoryPath = String(categoryData.slug || category)
    const rawOgImage = postData.ogImage || postData.featuredImage
    const ogImage = getImageSizeUrl(rawOgImage as Record<string, unknown> | null | undefined, 'og')
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://porosmadura.com'

    return {
      title: String(postData.seoTitle || postData.title),
      description: String(postData.seoDescription || postData.excerpt || ''),
      openGraph: {
        title: String(postData.seoTitle || postData.title),
        description: String(postData.seoDescription || postData.excerpt || ''),
        type: 'article',
        publishedTime: postData.publishedAt as string | undefined,
        modifiedTime: postData.updatedAt as string | undefined,
        authors: authorData.name ? [String(authorData.name)] : undefined,
        images: [{ url: ogImage }],
      },
      twitter: {
        card: 'summary_large_image',
        title: String(postData.seoTitle || postData.title),
        description: String(postData.seoDescription || postData.excerpt || ''),
        images: [ogImage],
      },
      robots: postData.allowIndex !== false ? { index: true, follow: true } : { index: false, follow: false },
      alternates: {
        canonical: postData.canonicalUrl ? String(postData.canonicalUrl) : `${siteUrl}/${categoryPath}/${slug}`,
      },
    }
  }

  return { title: 'Halaman Tidak Ditemukan - PorosMadura' }
}

export default async function DynamicPublicPage({ params }: Props) {
  const segments = getSegments(await params)

  if (segments.length === 1) {
    return <StaticPage slug={segments[0]} />
  }

  if (segments.length === 2) {
    return <ArticlePage category={segments[0]} slug={segments[1]} />
  }

  notFound()
}

async function StaticPage({ slug }: { slug: string }) {
  const page = await getPageBySlug(slug)
  if (!page) notFound()

  const data = asRecord(page)
  const contentHtml = await renderRichText(data.content)

  return (
    <div className="container mx-auto px-4 lg:px-8 py-10">
      <article className="max-w-3xl mx-auto bg-white border border-border-light rounded-xl p-6 md:p-10">
        <h1 className="font-heading text-3xl md:text-4xl font-black text-poros-navy leading-tight mb-6">
          {String(data.title || '')}
        </h1>
        <div
          className="prose prose-lg prose-headings:font-heading max-w-none"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </article>
    </div>
  )
}

async function ArticlePage({ category, slug }: { category: string; slug: string }) {
  const post = await getPostBySlug(category, slug)
  if (!post) notFound()

  return <ArticleDetail post={post} slug={slug} />
}
