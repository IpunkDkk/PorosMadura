import Link from 'next/link'
import { FilePlus2, Pencil } from 'lucide-react'
import { getMediaUrl } from '@/lib/media'
import { deleteAdAction, getCmsAdsData } from '@/lib/cms-admin'
import { CmsConfirmSubmit } from '@/components/cms/CmsConfirmSubmit'

export const dynamic = 'force-dynamic'

export default async function CmsAdsPage() {
  const { ads } = await getCmsAdsData()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold uppercase text-poros-red">Monetisasi</p>
          <h1 className="font-heading text-3xl font-black text-poros-navy">Iklan Manual</h1>
        </div>
        <Link
          href="/cms/ads/new"
          className="inline-flex items-center gap-2 rounded-lg bg-poros-red px-4 py-2 text-sm font-bold text-white hover:bg-red-700 transition-colors"
        >
          <FilePlus2 size={16} /> Iklan Baru
        </Link>
      </div>

      <section className="overflow-hidden rounded-xl border border-border-light bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-text-secondary">
              <tr>
                <th className="px-4 py-3">Iklan</th>
                <th className="px-4 py-3">Placement</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Performa</th>
                <th className="px-4 py-3">Periode</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {ads.map((ad) => (
                <tr key={ad.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {ad.imageDesktop ? (
                        <img
                          src={getMediaUrl(ad.imageDesktop as Record<string, unknown>)}
                          alt={ad.title}
                          className="h-10 w-20 rounded-md object-cover border border-border-light"
                        />
                      ) : (
                        <div className="h-10 w-20 rounded-md bg-gray-100 flex items-center justify-center border border-border-light">
                          <span className="text-xs text-gray-400 font-semibold">No image</span>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{ad.title}</p>
                        <p className="text-xs text-text-secondary">{ad.advertiserName || 'Tanpa pengiklan'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-poros-navy">
                      {ad.placement}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase ${
                        ad.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : ad.status === 'inactive'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {ad.status}
                    </span>
                    {ad.priority ? (
                      <span className="ml-2 text-xs text-gray-400 font-mono">p{ad.priority}</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs space-y-0.5">
                      <div>
                        <span className="font-semibold text-gray-700">{ad.impressionsCount || 0}</span>
                        <span className="text-gray-400"> impr</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">{ad.clicksCount || 0}</span>
                        <span className="text-gray-400"> klik</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-text-secondary">
                    {ad.startDate ? new Date(ad.startDate).toLocaleDateString('id-ID') : '-'}
                    {' – '}
                    {ad.endDate ? new Date(ad.endDate).toLocaleDateString('id-ID') : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/cms/ads/${ad.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border-light px-3 py-1.5 text-xs font-bold text-poros-red hover:bg-red-50 hover:border-poros-red transition-colors"
                      >
                        <Pencil size={13} /> Edit
                      </Link>
                      <form action={deleteAdAction.bind(null, ad.id)}>
                        <CmsConfirmSubmit
                          title="Hapus iklan?"
                          description="Iklan akan dihapus dari daftar manual dan tidak lagi tampil di slot mana pun."
                        />
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {!ads.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-text-secondary">
                      <p className="font-semibold">Belum ada iklan manual</p>
                      <p className="text-xs">Klik tombol Iklan Baru untuk mulai menambahkan</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
