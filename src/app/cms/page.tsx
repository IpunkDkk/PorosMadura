import Link from 'next/link'
import { AlertCircle, CalendarClock, Eye, FileImage, FilePlus2, SearchCheck } from 'lucide-react'
import { getCmsDashboard } from '@/lib/cms-admin'
import { formatPortalShortDate } from '@/lib/date'

export const dynamic = 'force-dynamic'

type DashboardPost = Awaited<ReturnType<typeof getCmsDashboard>>['recentPosts'][number]

function statusBadge(status: string | null | undefined) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase ${
      status === 'published'
        ? 'bg-green-100 text-green-700'
        : status === 'scheduled'
          ? 'bg-blue-100 text-blue-700'
          : status === 'review'
            ? 'bg-amber-100 text-amber-700'
            : status === 'archived'
              ? 'bg-rose-100 text-rose-700'
              : 'bg-gray-100 text-gray-500'
    }`}>
      {status || 'draft'}
    </span>
  )
}

function CompactPostList({
  title,
  href,
  posts,
  empty,
  meta,
}: {
  title: string
  href: string
  posts: DashboardPost[]
  empty: string
  meta?: (post: DashboardPost) => string
}) {
  return (
    <section className="rounded-lg border border-border-light bg-white">
      <div className="flex items-center justify-between border-b border-border-light px-5 py-4">
        <h2 className="font-heading text-lg font-bold text-poros-navy">{title}</h2>
        <Link href={href} className="text-sm font-bold text-poros-red hover:text-red-700">
          Lihat
        </Link>
      </div>
      <div className="divide-y divide-border-light">
        {posts.map((post) => (
          <Link key={post.id} href={`/cms/posts/${post.slug}`} className="block px-5 py-4 hover:bg-gray-50">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate font-semibold text-gray-900">{post.title || 'Tanpa judul'}</p>
                <p className="mt-1 text-xs text-text-secondary">
                  {post.category?.name || 'Tanpa kategori'} · {post.author?.name || 'Tanpa penulis'}
                </p>
              </div>
              {meta ? (
                <span className="shrink-0 text-xs font-bold text-text-secondary">{meta(post)}</span>
              ) : statusBadge(post.status)}
            </div>
          </Link>
        ))}
        {!posts.length && (
          <p className="px-5 py-8 text-center text-sm text-text-secondary">{empty}</p>
        )}
      </div>
    </section>
  )
}

export default async function CmsDashboardPage() {
  const { counts, recentPosts, reviewPosts, scheduledPosts, topViewedPosts } = await getCmsDashboard()

  const statItems = [
    { label: 'Artikel', value: counts.posts },
    { label: 'Kategori', value: counts.categories },
    { label: 'Penulis', value: counts.authors },
    { label: 'Tag', value: counts.tags },
    { label: 'Media', value: counts.media },
    { label: 'Iklan', value: counts.ads },
  ]
  const actionItems = [
    {
      label: 'Butuh review',
      value: counts.reviewPosts,
      href: '/cms/posts?status=review',
      icon: AlertCircle,
      tone: 'text-amber-700 bg-amber-50 border-amber-200',
    },
    {
      label: 'Terjadwal',
      value: counts.scheduledPosts,
      href: '/cms/posts?status=scheduled',
      icon: CalendarClock,
      tone: 'text-blue-700 bg-blue-50 border-blue-200',
    },
    {
      label: 'Tanpa gambar',
      value: counts.missingImages,
      href: '/cms/posts?issue=missing-image',
      icon: FileImage,
      tone: 'text-rose-700 bg-rose-50 border-rose-200',
    },
    {
      label: 'SEO belum lengkap',
      value: counts.missingSeo,
      href: '/cms/posts?issue=missing-seo',
      icon: SearchCheck,
      tone: 'text-slate-700 bg-slate-50 border-slate-200',
    },
    {
      label: 'Iklan aktif kedaluwarsa',
      value: counts.expiredActiveAds,
      href: '/cms/ads?issue=expired-active',
      icon: AlertCircle,
      tone: 'text-red-700 bg-red-50 border-red-200',
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase text-poros-red">Custom CMS</p>
          <h1 className="font-heading text-3xl font-black text-poros-navy">Ruang kerja redaksi</h1>
        </div>
        <Link href="/cms/posts/new" className="inline-flex items-center gap-2 rounded-md bg-poros-red px-4 py-2 text-sm font-bold text-white hover:bg-red-700">
          <FilePlus2 size={16} /> Tulis Artikel
        </Link>
      </div>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        {statItems.map((item) => (
          <div key={item.label} className="rounded-lg border border-border-light bg-white p-5">
            <p className="text-sm font-semibold text-text-secondary">{item.label}</p>
            <p className="mt-2 text-3xl font-black text-poros-navy">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {actionItems.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.label} href={item.href} className={`rounded-lg border p-5 transition-colors hover:bg-white ${item.tone}`}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold">{item.label}</p>
                  <p className="mt-2 text-3xl font-black">{item.value}</p>
                </div>
                <Icon size={28} />
              </div>
            </Link>
          )
        })}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <CompactPostList
          title="Antrian review"
          href="/cms/posts?status=review"
          posts={reviewPosts}
          empty="Tidak ada artikel menunggu review."
        />
        <CompactPostList
          title="Artikel terjadwal"
          href="/cms/posts?status=scheduled"
          posts={scheduledPosts}
          empty="Tidak ada artikel terjadwal."
          meta={(post) => formatPortalShortDate(post.publishedAt) || '-'}
        />
        <CompactPostList
          title="Paling banyak dibaca"
          href="/cms/posts"
          posts={topViewedPosts}
          empty="Belum ada data pembaca."
          meta={(post) => `${post.views || 0} view`}
        />
      </section>

      <section className="rounded-lg border border-border-light bg-white">
        <div className="flex items-center justify-between border-b border-border-light px-5 py-4">
          <div className="flex items-center gap-2">
            <Eye size={18} className="text-text-secondary" />
            <h2 className="font-heading text-lg font-bold text-poros-navy">Artikel terbaru diedit</h2>
          </div>
          <Link href="/cms/posts" className="text-sm font-bold text-poros-red hover:text-red-700">
            Lihat semua
          </Link>
        </div>
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-text-secondary">
            <tr>
              <th className="px-4 py-3">Judul</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Penulis</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {recentPosts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-900">{post.title || 'Tanpa judul'}</td>
                <td className="px-4 py-3">{post.category?.name || '-'}</td>
                <td className="px-4 py-3">{post.author?.name || '-'}</td>
                <td className="px-4 py-3">
                  {statusBadge(post.status)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/cms/posts/${post.id}`} className="font-bold text-poros-red hover:text-red-700">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {!recentPosts.length && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">Belum ada artikel.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  )
}
