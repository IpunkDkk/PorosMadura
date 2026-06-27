'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Save } from 'lucide-react'
import { saveTagAction } from '@/lib/cms-admin'
import { CmsTaxonomyModal } from '@/components/cms/CmsTaxonomyModal'

type Tag = {
  id: number
  name: string
  slug: string
  description?: string | null
  isActive?: boolean | null
}

function TagForm({ tag, onClose }: { tag?: Tag; onClose: () => void }) {
  const router = useRouter()
  return (
    <form
      action={async (formData: FormData) => {
        await saveTagAction(formData)
        router.refresh()
        onClose()
      }}
      className="space-y-4"
    >
      <input type="hidden" name="returnTo" value="/cms/taxonomy/tags" />
      {tag?.id ? <input type="hidden" name="id" value={tag.id} /> : null}

      <div>
        <label className="block text-sm font-semibold mb-1.5">
          Nama Tag <span className="text-poros-red">*</span>
        </label>
        <input
          name="name"
          required
          placeholder="Nama tag"
          defaultValue={tag?.name || ''}
          className="w-full rounded-lg border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1.5">Slug</label>
        <input
          name="slug"
          placeholder="Otomatis jika kosong"
          defaultValue={tag?.slug || ''}
          className="w-full rounded-lg border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1.5">Deskripsi</label>
        <textarea
          name="description"
          rows={3}
          placeholder="Deskripsi singkat tag"
          defaultValue={tag?.description || ''}
          className="w-full rounded-lg border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
        />
      </div>

      <div className="flex items-center pb-1">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={tag?.isActive !== false}
            className="h-4 w-4 accent-poros-red"
          />
          <span className="font-semibold">Aktif</span>
        </label>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-border-light pt-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-border-light px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-gray-50"
        >
          Batal
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-poros-red px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
        >
          <Save size={15} /> {tag?.id ? 'Update Tag' : 'Simpan Tag'}
        </button>
      </div>
    </form>
  )
}

export function CmsTagsClient({ tags }: { tags: Tag[] }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editTag, setEditTag] = useState<Tag | undefined>()

  const openCreate = () => { setEditTag(undefined); setModalOpen(true) }
  const openEdit = (tag: Tag) => { setEditTag(tag); setModalOpen(true) }
  const closeModal = () => setModalOpen(false)

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold uppercase text-poros-red">Taksonomi</p>
          <h1 className="font-heading text-3xl font-black text-poros-navy">Tag</h1>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-poros-red px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
        >
          <Plus size={16} /> Tambah Tag
        </button>
      </div>

      <section className="overflow-hidden rounded-xl border border-border-light bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-text-secondary">
              <tr>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {tags.map((tag) => (
                <tr key={tag.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900">{tag.name}</p>
                    {tag.description && (
                      <p className="line-clamp-1 text-xs text-text-secondary mt-0.5">{tag.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">/{tag.slug}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase ${
                        tag.isActive === false
                          ? 'bg-gray-100 text-gray-500'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {tag.isActive === false ? 'Nonaktif' : 'Aktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(tag)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border-light px-3 py-1.5 text-xs font-bold text-poros-red hover:bg-red-50 hover:border-poros-red transition-colors"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                  </td>
                </tr>
              ))}
              {!tags.length && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-text-secondary">
                    <div className="flex flex-col items-center gap-2">
                      <p className="font-semibold">Belum ada tag</p>
                      <p className="text-xs">Klik tombol Tambah Tag untuk memulai</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <CmsTaxonomyModal
        open={modalOpen}
        onClose={closeModal}
        title={editTag ? 'Edit Tag' : 'Tambah Tag'}
      >
        <TagForm tag={editTag} onClose={closeModal} />
      </CmsTaxonomyModal>
    </>
  )
}
