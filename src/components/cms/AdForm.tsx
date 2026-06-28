import Link from 'next/link'
import Image from 'next/image'
import { Save } from 'lucide-react'
import { formatDatetimeLocalValue } from '@/lib/date'
import { getMediaUrl } from '@/lib/media'

export function AdForm({
  ad,
  adSlots,
  mediaItems,
  action,
  backHref,
}: {
  ad?: any
  adSlots: any[]
  mediaItems: any[]
  action: any
  backHref: string
}) {
  return (
    <form action={action} className="space-y-6">
      {ad?.id ? <input type="hidden" name="id" value={ad.id} /> : null}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-1.5">
            Judul Iklan <span className="text-poros-red">*</span>
          </label>
          <input
            name="title"
            required
            defaultValue={ad?.title || ''}
            placeholder="Contoh: Banner Ramadan 2026"
            className="w-full rounded-lg border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">
            Placement <span className="text-poros-red">*</span>
          </label>
          <select
            name="placement"
            required
            defaultValue={ad?.placement || ''}
            className="w-full rounded-lg border border-border-light bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
          >
            <option value="">Pilih placement</option>
            {adSlots.map((slot) => (
              <option key={slot.id} value={slot.placement}>
                {slot.label} ({slot.placement})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">Status</label>
          <select
            name="status"
            defaultValue={ad?.status || 'draft'}
            className="w-full rounded-lg border border-border-light bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">Pengiklan</label>
          <input
            name="advertiserName"
            defaultValue={ad?.advertiserName || ''}
            placeholder="Nama perusahaan / pengiklan"
            className="w-full rounded-lg border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">Kontak Pengiklan</label>
          <input
            name="advertiserContact"
            defaultValue={ad?.advertiserContact || ''}
            placeholder="Email / WhatsApp pengiklan"
            className="w-full rounded-lg border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-1.5">
            URL Tujuan <span className="text-poros-red">*</span>
          </label>
          <input
            name="targetUrl"
            required
            defaultValue={ad?.targetUrl || ''}
            placeholder="https://"
            className="w-full rounded-lg border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">Banner Desktop</label>
          {ad?.imageDesktop && (
            <div className="mb-2 overflow-hidden rounded-lg border border-border-light max-w-xs">
              <Image
                src={getMediaUrl(ad.imageDesktop as Record<string, unknown>)}
                alt={ad.title}
                width={320}
                height={80}
                className="h-20 w-full object-cover"
              />
            </div>
          )}
          <select
            name="imageDesktopId"
            defaultValue={ad?.imageDesktopId || ''}
            className="w-full rounded-lg border border-border-light bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
          >
            <option value="">Tanpa gambar</option>
            {mediaItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.alt || item.filename}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">Banner Mobile</label>
          {ad?.imageMobile && (
            <div className="mb-2 overflow-hidden rounded-lg border border-border-light max-w-xs">
              <Image
                src={getMediaUrl(ad.imageMobile as Record<string, unknown>)}
                alt={ad.title}
                width={320}
                height={80}
                className="h-20 w-full object-cover"
              />
            </div>
          )}
          <select
            name="imageMobileId"
            defaultValue={ad?.imageMobileId || ''}
            className="w-full rounded-lg border border-border-light bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
          >
            <option value="">Pakai desktop</option>
            {mediaItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.alt || item.filename}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">
            Tanggal Mulai <span className="text-poros-red">*</span>
          </label>
          <input
            name="startDate"
            type="datetime-local"
            required
            defaultValue={formatDatetimeLocalValue(ad?.startDate)}
            className="w-full rounded-lg border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">
            Tanggal Selesai <span className="text-poros-red">*</span>
          </label>
          <input
            name="endDate"
            type="datetime-local"
            required
            defaultValue={formatDatetimeLocalValue(ad?.endDate)}
            className="w-full rounded-lg border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">Prioritas</label>
          <input
            name="priority"
            type="number"
            min="0"
            defaultValue={ad?.priority || 0}
            className="w-full rounded-lg border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
          />
          <p className="mt-1 text-xs text-text-secondary">Angka lebih tinggi = prioritas tampil lebih tinggi</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border-light">
        <Link href={backHref} className="text-sm font-semibold text-text-secondary hover:text-poros-red">
          Batal
        </Link>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-poros-red px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors"
        >
          <Save size={16} /> {ad?.id ? 'Update Iklan' : 'Simpan Iklan'}
        </button>
      </div>
    </form>
  )
}
