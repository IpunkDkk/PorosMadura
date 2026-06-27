import type { Metadata } from 'next'
import Link from 'next/link'
import { getPublishedPosts } from '@/lib/custom-cms'
import { BreakingNews } from '@/components/article/BreakingNews'
import { HeroNews } from '@/components/article/HeroNews'
import { ArticleCard } from '@/components/article/ArticleCard'
import { PopularPosts } from '@/components/sidebar/PopularPosts'
import { SocialFollow } from '@/components/sidebar/SocialFollow'
import HorizontalScroll from '@/components/article/HorizontalScroll'
import CategorySections from '@/components/article/CategorySections'
import { normalizePost } from '@/lib/cms'
import AdSlot from '@/components/ads/AdSlot'

export const revalidate = 300
export const dynamic = 'force-dynamic'

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

        {/* Wrapper for skyscraper ads + content */}
        <div className="flex justify-center gap-4">
          {/* Skyscraper Left - hidden on small screens */}
          <aside className="hidden xl:block w-[160px] flex-shrink-0 pt-4">
            <AdSlot placement="home_skyscraper_left" />
          </aside>

          {/* Main Content + Sidebar */}
          <div className="flex-1 min-w-0 max-w-full">
            {/* Ad before Berita Terbaru */}
            <AdSlot placement="home_before_latest" className="mb-6" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Left Column: Latest News */}
              <div className="lg:col-span-8">
                <div className="flex items-center justify-between mb-6 border-b-2 border-border-light pb-3">
                  <h3 className="font-heading text-2xl font-black text-poros-navy">
                    Berita <span className="text-poros-red">Terbaru</span>
                  </h3>
                  <div className="flex items-center gap-3">
                    <Link
                      href="/search?sort=latest"
                      className="text-xs font-semibold text-poros-red hover:text-red-700 transition-colors"
                    >
                      Lihat Selengkapnya →
                    </Link>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  {latestPosts.slice(0, 2).map((post) => (
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

                <AdSlot placement="home_middle_banner" className="my-6" />

                <div className="flex flex-col gap-6">
                  {latestPosts.slice(2).map((post) => (
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

                {/* Nav buttons for Berita Terbaru */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border-light">
                  <Link
                    href="/search?sort=latest"
                    className="text-sm font-semibold text-poros-red hover:text-red-700 transition-colors"
                  >
                    ← Berita Lebih Awal
                  </Link>
                  <Link
                    href="/search?sort=latest"
                    className="text-sm font-semibold text-poros-red hover:text-red-700 transition-colors"
                  >
                    Selanjutnya →
                  </Link>
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

          {/* Skyscraper Right - hidden on small screens */}
          <aside className="hidden xl:block w-[160px] flex-shrink-0 pt-4">
            <AdSlot placement="home_skyscraper_right" />
          </aside>
        </div>
      </div>

      {/* Horizontal Scroll Section */}
      <div className="bg-gray-50 py-8 mt-6">
        <HorizontalScroll />
      </div>

      {/* Horizontal Ad below scroll section */}
      <div className="container mx-auto px-4 lg:px-8 py-6">
        <AdSlot placement="home_horizontal_ad" />
      </div>

      {/* Category Sections */}
      <div className="bg-gray-50 py-8">
        <CategorySections />
      </div>
    </>
  )
}
