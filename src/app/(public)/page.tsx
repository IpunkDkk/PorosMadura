import type { Metadata } from 'next'
import { getPublishedPosts } from '@/lib/payload'
import { BreakingNews } from '@/components/article/BreakingNews'
import { HeroNews } from '@/components/article/HeroNews'
import { ArticleCard } from '@/components/article/ArticleCard'
import { PopularPosts } from '@/components/sidebar/PopularPosts'
import { SocialFollow } from '@/components/sidebar/SocialFollow'
import { normalizePost } from '@/lib/cms'
import AdSlot from '@/components/ads/AdSlot'

export const dynamic = 'force-static'
export const revalidate = 300

export const metadata: Metadata = {
  title: 'PorosMadura | Berita Tepat, Fakta Kuat',
}

export default async function HomePage() {
  const [featuredResult, latestResult, popularResult, breakingResult] =
    await Promise.all([
      getPublishedPosts({
        limit: 3,
        where: { isFeatured: { equals: true } },
      }),
      getPublishedPosts({ limit: 5 }),
      getPublishedPosts({
        limit: 5,
        sort: '-views',
      }),
      getPublishedPosts({
        limit: 1,
        where: { isBreakingNews: { equals: true } },
      }),
    ])

  const featuredPosts = featuredResult.docs.map(normalizePost)
  const latestPosts = latestResult.docs.map(normalizePost)
  const popularPosts = popularResult.docs.map(normalizePost)
  const breakingPost = breakingResult.docs[0] ? normalizePost(breakingResult.docs[0]) : undefined

  return (
    <>
      {/* Breaking News */}
      {breakingPost && (
        <BreakingNews
          title={breakingPost.title}
          slug={breakingPost.slug}
          category={breakingPost.category?.slug}
        />
      )}

      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Hero Section */}
        <HeroNews featured={featuredPosts} />

        {/* Homepage Top Banner */}
        <AdSlot placement="home_top_banner" className="my-6" />

        {/* Main Content + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Latest News */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-6 border-b-2 border-border-light pb-3">
              <h3 className="font-heading text-2xl font-black text-poros-navy">
                Berita <span className="text-poros-red">Terbaru</span>
              </h3>
            </div>

            <div className="flex flex-col gap-6">
              {latestPosts.map((post) => (
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

          {/* Right Column: Sidebar */}
          <aside className="lg:col-span-4 space-y-10">
            <PopularPosts posts={popularPosts} />
            <SocialFollow />
            <AdSlot placement="home_sidebar_top" />
            <AdSlot placement="home_sidebar_bottom" />
          </aside>
        </div>
      </div>
    </>
  )
}
