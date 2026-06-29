import Link from 'next/link'
import { FilePlus2, Pencil } from 'lucide-react'
import { getCmsPageList } from '@/lib/cms-admin'
import { formatPortalDateTime } from '@/lib/date'

export const dynamic = 'force-dynamic'

export default async function CmsPagesPage() {
  const pagesList = await getCmsPageList()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase text-poros-red">Konten</p>
          <h1 className="font-heading text-3xl font-black text-poros-navy">Halaman Statis</h1>
        </div>
        <Link href="/cms/pages/new" className="inline-flex items-center gap-2 rounded-md bg-poros-red px-4 py-2 text-sm font-bold text-white hover:bg-red-700">
          <FilePlus2 size={16} /> Halaman Baru
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-border-light bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-text-secondary">
              <tr>
                <th className="px-4 py-3">Judul</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Terakhir Diperbarui</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {pagesList.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900">{page.title || 'Tanpa judul'}</p>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">/{page.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase ${
                      page.status === 'published'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {page.status || 'draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {formatPortalDateTime(page.updatedAt) || '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/cms/pages/${page.slug}`} className="inline-flex items-center gap-1 font-bold text-poros-red hover:text-red-700">
                      <Pencil size={14} /> Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {!pagesList.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">Belum ada halaman statis.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
