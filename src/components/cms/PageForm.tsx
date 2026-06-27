'use client'

import Link from 'next/link'
import { Save, Trash2, ArrowLeft } from 'lucide-react'
import { savePageAction, deletePageAction } from '@/lib/cms-admin'
import { RichTextEditor } from '@/components/cms/RichTextEditor'
import { CmsConfirmSubmit } from '@/components/cms/CmsConfirmSubmit'

type MediaItem = {
  id: number
  alt?: string | null
  filename?: string | null
  url?: string | null
  sizesThumbnailUrl?: string | null
  sizesCardUrl?: string | null
}

type PageData = {
  id: number
  title: string
  slug: string
  content?: any
  seoTitle?: string | null
  seoDescription?: string | null
  status: string
}

type PageFormProps = {
  page?: PageData | null
  mediaItems?: MediaItem[]
}

export function PageForm({ page, mediaItems = [] }: PageFormProps) {
  return (
    <>
      <form action={savePageAction} className="space-y-6">
        {page?.id && <input type="hidden" name="id" value={page.id} />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content columns */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-border-light bg-white p-6 shadow-sm">
              <h2 className="font-heading text-lg font-bold text-poros-navy border-b border-border-light pb-3 mb-5">
                Konten Halaman
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" htmlFor="title">Judul Halaman</label>
                  <input
                    required
                    type="text"
                    id="title"
                    name="title"
                    defaultValue={page?.title || ''}
                    placeholder="Contoh: Tentang Kami"
                    className="w-full rounded-lg border border-border-light px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-poros-red/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" htmlFor="slug">Slug URL</label>
                  <div className="flex rounded-lg shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-border-light bg-gray-50 text-text-secondary text-sm">
                      /
                    </span>
                    <input
                      type="text"
                      id="slug"
                      name="slug"
                      defaultValue={page?.slug || ''}
                      placeholder="tentang-kami"
                      className="w-full rounded-r-lg border border-border-light px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-poros-red/30"
                    />
                  </div>
                  <p className="mt-1 text-xs text-text-secondary">Biarkan kosong untuk generate slug otomatis dari judul</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Isi Halaman</label>
                  <RichTextEditor
                    name="content"
                    initialContent={page?.content || ''}
                    mediaItems={mediaItems}
                  />
                </div>
              </div>
            </div>

            {/* SEO Section */}
            <div className="rounded-xl border border-border-light bg-white p-6 shadow-sm">
              <h2 className="font-heading text-lg font-bold text-poros-navy border-b border-border-light pb-3 mb-5">
                Optimasi SEO
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" htmlFor="seoTitle">SEO Title Override</label>
                  <input
                    type="text"
                    id="seoTitle"
                    name="seoTitle"
                    defaultValue={page?.seoTitle || ''}
                    placeholder="Judul khusus untuk mesin pencari"
                    className="w-full rounded-lg border border-border-light px-4 py-2 focus:outline-none focus:ring-2 focus:ring-poros-red/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" htmlFor="seoDescription">SEO Meta Description</label>
                  <textarea
                    id="seoDescription"
                    name="seoDescription"
                    rows={3}
                    defaultValue={page?.seoDescription || ''}
                    placeholder="Ringkasan singkat deskripsi halaman untuk snippet Google"
                    className="w-full rounded-lg border border-border-light px-4 py-2 focus:outline-none focus:ring-2 focus:ring-poros-red/30"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar controls columns */}
          <div className="space-y-6">
            <div className="rounded-xl border border-border-light bg-white p-6 shadow-sm">
              <h2 className="font-heading text-lg font-bold text-poros-navy border-b border-border-light pb-3 mb-5">
                Pengaturan Publikasi
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    defaultValue={page?.status || 'draft'}
                    className="w-full rounded-lg border border-border-light bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-poros-red/30"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Diterbitkan (Published)</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-border-light flex flex-col gap-2">
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-poros-red px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors"
                  >
                    <Save size={16} /> Simpan Halaman
                  </button>

                  <Link
                    href="/cms/pages"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-border-light px-4 py-2.5 text-sm font-bold text-text-primary hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft size={16} /> Batal
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {page?.id && (
        <form action={deletePageAction.bind(null, page.id)} className="mt-6 bg-white border border-red-200 rounded-lg p-5">
          <CmsConfirmSubmit
            label="Hapus Halaman"
            title="Hapus Halaman?"
            description="Halaman statis ini akan dihapus secara permanen dari database dan tidak dapat dipulihkan kembali."
          />
        </form>
      )}
    </>
  )
}
