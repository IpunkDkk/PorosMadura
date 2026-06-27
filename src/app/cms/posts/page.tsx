import Link from 'next/link'
import { FilePlus2, Pencil } from 'lucide-react'
import { getCmsPostList } from '@/lib/cms-admin'

export const dynamic = 'force-dynamic'

export default async function CmsPostsPage() {
  const posts = await getCmsPostList()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase text-poros-red">Konten</p>
          <h1 className="font-heading text-3xl font-black text-poros-navy">Artikel</h1>
        </div>
        <Link href="/cms/posts/new" className="inline-flex items-center gap-2 rounded-md bg-poros-red px-4 py-2 text-sm font-bold text-white hover:bg-red-700">
          <FilePlus2 size={16} /> Artikel Baru
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-border-light bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-text-secondary">
            <tr>
              <th className="px-4 py-3">Judul</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Penulis</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Publish</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-900">{post.title || 'Tanpa judul'}</p>
                  <p className="text-xs text-text-secondary">/{post.slug}</p>
                </td>
                <td className="px-4 py-3">{post.category?.name || '-'}</td>
                <td className="px-4 py-3">{post.author?.name || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase ${
                    post.status === 'published'
                      ? 'bg-green-100 text-green-700'
                      : post.status === 'scheduled'
                        ? 'bg-blue-100 text-blue-700'
                        : post.status === 'archived'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-gray-100 text-gray-500'
                  }`}>
                    {post.status || 'draft'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleString('id-ID') : '-'}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/cms/posts/${post.slug}`} className="inline-flex items-center gap-1 font-bold text-poros-red hover:text-red-700">
                    <Pencil size={14} /> Edit
                  </Link>
                </td>
              </tr>
            ))}
            {!posts.length && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">Belum ada artikel.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
