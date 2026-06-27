import { Save } from 'lucide-react'
import { getMediaUrl } from '@/lib/media'
import { deleteAdAction, getCmsAdsData, saveAdAction } from '@/lib/cms-admin'
import { CmsConfirmSubmit } from '@/components/cms/CmsConfirmSubmit'

export const dynamic = 'force-dynamic'

function dateInput(value: unknown) {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(String(value))
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 16)
}

function AdForm({
  ad,
  adSlots,
  mediaItems,
}: {
  ad?: any
  adSlots: any[]
  mediaItems: any[]
}) {
  return (
    <form action={saveAdAction} className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {ad?.id ? <input type="hidden" name="id" value={ad.id} /> : null}
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Judul Iklan</span>
        <input name="title" required defaultValue={ad?.title || ''} className="w-full rounded-md border border-border-light px-3 py-2 text-sm" />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Placement</span>
        <select name="placement" required defaultValue={ad?.placement || ''} className="w-full rounded-md border border-border-light bg-white px-3 py-2 text-sm">
          <option value="">Pilih placement</option>
          {adSlots.map((slot) => (
            <option key={slot.id} value={slot.placement}>{slot.label} ({slot.placement})</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Pengiklan</span>
        <input name="advertiserName" defaultValue={ad?.advertiserName || ''} className="w-full rounded-md border border-border-light px-3 py-2 text-sm" />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Kontak</span>
        <input name="advertiserContact" defaultValue={ad?.advertiserContact || ''} className="w-full rounded-md border border-border-light px-3 py-2 text-sm" />
      </label>
      <label className="block md:col-span-2">
        <span className="mb-2 block text-sm font-semibold">URL Tujuan</span>
        <input name="targetUrl" required defaultValue={ad?.targetUrl || ''} className="w-full rounded-md border border-border-light px-3 py-2 text-sm" />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Banner Desktop</span>
        <select name="imageDesktopId" defaultValue={ad?.imageDesktopId || ''} className="w-full rounded-md border border-border-light bg-white px-3 py-2 text-sm">
          <option value="">Tanpa gambar</option>
          {mediaItems.map((item) => (
            <option key={item.id} value={item.id}>{item.alt || item.filename}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Banner Mobile</span>
        <select name="imageMobileId" defaultValue={ad?.imageMobileId || ''} className="w-full rounded-md border border-border-light bg-white px-3 py-2 text-sm">
          <option value="">Pakai desktop</option>
          {mediaItems.map((item) => (
            <option key={item.id} value={item.id}>{item.alt || item.filename}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Tanggal Mulai</span>
        <input name="startDate" type="datetime-local" required defaultValue={dateInput(ad?.startDate)} className="w-full rounded-md border border-border-light px-3 py-2 text-sm" />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Tanggal Selesai</span>
        <input name="endDate" type="datetime-local" required defaultValue={dateInput(ad?.endDate)} className="w-full rounded-md border border-border-light px-3 py-2 text-sm" />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Status</span>
        <select name="status" defaultValue={ad?.status || 'draft'} className="w-full rounded-md border border-border-light bg-white px-3 py-2 text-sm">
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Prioritas</span>
        <input name="priority" type="number" defaultValue={ad?.priority || 0} className="w-full rounded-md border border-border-light px-3 py-2 text-sm" />
      </label>
      <div className="md:col-span-2">
        <button className="inline-flex items-center gap-2 rounded-md bg-poros-red px-4 py-2 text-sm font-bold text-white hover:bg-red-700">
          <Save size={16} /> {ad?.id ? 'Update Iklan' : 'Simpan Iklan'}
        </button>
      </div>
    </form>
  )
}

export default async function CmsAdsPage() {
  const { ads, adSlots, media } = await getCmsAdsData()

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase text-poros-red">Monetisasi</p>
        <h1 className="font-heading text-3xl font-black text-poros-navy">Iklan Manual</h1>
      </div>

      <section className="rounded-lg border border-border-light bg-white p-5">
        <h2 className="mb-4 font-heading text-lg font-bold">Iklan Baru</h2>
        <AdForm adSlots={adSlots} mediaItems={media} />
      </section>

      <section className="overflow-hidden rounded-lg border border-border-light bg-white">
        <table className="w-full min-w-[980px] text-left text-sm">
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
              <tr key={ad.id} className="align-top">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {ad.imageDesktop ? (
                      <img
                        src={getMediaUrl(ad.imageDesktop as Record<string, unknown>)}
                        alt={ad.title}
                        className="h-12 w-24 rounded-md object-cover"
                      />
                    ) : (
                      <div className="h-12 w-24 rounded-md bg-gray-100" />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{ad.title}</p>
                      <p className="text-xs text-text-secondary">{ad.advertiserName || 'Tanpa pengiklan'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{ad.placement}</td>
                <td className="px-4 py-3">{ad.status} · priority {ad.priority || 0}</td>
                <td className="px-4 py-3">{ad.impressionsCount || 0} impressions · {ad.clicksCount || 0} clicks</td>
                <td className="px-4 py-3">
                  {ad.startDate ? new Date(ad.startDate).toLocaleDateString('id-ID') : '-'} - {ad.endDate ? new Date(ad.endDate).toLocaleDateString('id-ID') : '-'}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <details>
                      <summary className="cursor-pointer text-sm font-bold text-poros-red">Edit</summary>
                      <div className="mt-4 w-[720px] max-w-[80vw] rounded-md border border-border-light bg-gray-50 p-4 text-left">
                        <AdForm ad={ad} adSlots={adSlots} mediaItems={media} />
                      </div>
                    </details>
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
                <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">Belum ada iklan manual.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  )
}
