import { Upload } from 'lucide-react'
import { getMediaUrl } from '@/lib/media'
import { deleteMediaAction, getCmsMediaList, uploadMediaAction } from '@/lib/cms-admin'
import { CmsConfirmSubmit } from '@/components/cms/CmsConfirmSubmit'

export const dynamic = 'force-dynamic'

export default async function CmsMediaPage() {
  const mediaItems = await getCmsMediaList()

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase text-poros-red">Assets</p>
        <h1 className="font-heading text-3xl font-black text-poros-navy">Media</h1>
      </div>

      <section className="rounded-lg border border-border-light bg-white p-5">
        <h2 className="mb-4 font-heading text-lg font-bold">Upload Media</h2>
        <form action={uploadMediaAction} className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">File</span>
            <input
              name="file"
              type="file"
              accept="image/*"
              required
              className="w-full rounded-md border border-border-light px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Alt text</span>
            <input name="alt" className="w-full rounded-md border border-border-light px-3 py-2 text-sm" />
          </label>
          <button className="inline-flex items-center justify-center gap-2 rounded-md bg-poros-red px-4 py-2 text-sm font-bold text-white hover:bg-red-700">
            <Upload size={16} /> Upload
          </button>
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-semibold">Caption</span>
            <input name="caption" className="w-full rounded-md border border-border-light px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Credit</span>
            <input name="credit" className="w-full rounded-md border border-border-light px-3 py-2 text-sm" />
          </label>
        </form>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mediaItems.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-lg border border-border-light bg-white">
            <div className="aspect-[4/3] bg-gray-100">
              <img
                src={getMediaUrl(item as Record<string, unknown>)}
                alt={item.alt || item.filename || 'Media'}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="space-y-1 p-3">
              <p className="truncate text-sm font-semibold">{item.alt || item.filename}</p>
              <p className="truncate text-xs text-text-secondary">{item.filename}</p>
              <p className="text-xs text-text-secondary">{item.mimeType || 'unknown'} · {item.filesize || 0} bytes</p>
              <form action={deleteMediaAction.bind(null, item.id)} className="pt-2">
                <CmsConfirmSubmit
                  title="Hapus media?"
                  description="File media akan dihapus dari database dan storage. Konten yang memakai file ini bisa kehilangan gambar."
                  className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50"
                />
              </form>
            </div>
          </article>
        ))}
        {!mediaItems.length && (
          <div className="rounded-lg border border-dashed border-border-light bg-white p-8 text-center text-sm text-text-secondary sm:col-span-2 lg:col-span-4">
            Belum ada media.
          </div>
        )}
      </section>
    </div>
  )
}
