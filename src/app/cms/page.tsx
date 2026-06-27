import Link from 'next/link'
import { FilePlus2 } from 'lucide-react'
import { getCmsDashboard } from '@/lib/cms-admin'

export const dynamic = 'force-dynamic'

export default async function CmsDashboardPage() {
  const { counts, recentPosts } = await getCmsDashboard()

  const statItems = [
    { label: 'Artikel', value: counts.posts },
    { label: 'Kategori', value: counts.categories },
    { label: 'Penulis', value: counts.authors },
    { label: 'Tag', value: counts.tags },
    { label: 'Media', value: counts.media },
    { label: 'Iklan', value: counts.ads },
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

      <section className="rounded-lg border border-border-light bg-white">
        <div className="flex items-center justify-between border-b border-border-light px-5 py-4">
          <h2 className="font-heading text-lg font-bold text-poros-navy">Artikel terbaru diedit</h2>
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
                <td className="px-4 py-3">{post.status || 'draft'}</td>
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
