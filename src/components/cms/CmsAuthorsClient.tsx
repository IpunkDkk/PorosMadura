'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Save } from 'lucide-react'
import { saveAuthorAction } from '@/lib/cms-admin'
import { CmsTaxonomyModal } from '@/components/cms/CmsTaxonomyModal'

type Author = {
  id: number
  name: string
  slug: string
  email?: string | null
  bio?: string | null
  socialLinksFacebook?: string | null
  socialLinksTwitter?: string | null
  socialLinksInstagram?: string | null
  isActive?: boolean | null
}

function AuthorForm({ author, onClose }: { author?: Author; onClose: () => void }) {
  const router = useRouter()
  return (
    <form
      action={async (formData: FormData) => {
        await saveAuthorAction(formData)
        router.refresh()
        onClose()
      }}
      className="space-y-4"
    >
      <input type="hidden" name="returnTo" value="/cms/taxonomy/authors" />
      {author?.id ? <input type="hidden" name="id" value={author.id} /> : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1.5">
            Nama Penulis <span className="text-poros-red">*</span>
          </label>
          <input
            name="name"
            required
            placeholder="Nama penulis"
            defaultValue={author?.name || ''}
            className="w-full rounded-lg border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1.5">Slug</label>
          <input
            name="slug"
            placeholder="Otomatis jika kosong"
            defaultValue={author?.slug || ''}
            className="w-full rounded-lg border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1.5">Email</label>
        <input
          name="email"
          type="email"
          placeholder="Email penulis"
          defaultValue={author?.email || ''}
          className="w-full rounded-lg border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1.5">Bio</label>
        <textarea
          name="bio"
          rows={3}
          placeholder="Bio singkat penulis"
          defaultValue={author?.bio || ''}
          className="w-full rounded-lg border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold">Media Sosial</label>
        <input
          name="facebook"
          placeholder="Facebook URL"
          defaultValue={author?.socialLinksFacebook || ''}
          className="w-full rounded-lg border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
        />
        <input
          name="twitter"
          placeholder="Twitter/X URL"
          defaultValue={author?.socialLinksTwitter || ''}
          className="w-full rounded-lg border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
        />
        <input
          name="instagram"
          placeholder="Instagram URL"
          defaultValue={author?.socialLinksInstagram || ''}
          className="w-full rounded-lg border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
        />
      </div>

      <div className="flex items-center pb-1">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={author?.isActive !== false}
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
          <Save size={15} /> {author?.id ? 'Update Penulis' : 'Simpan Penulis'}
        </button>
      </div>
    </form>
  )
}

export function CmsAuthorsClient({ authors }: { authors: Author[] }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editAuthor, setEditAuthor] = useState<Author | undefined>()

  const openCreate = () => { setEditAuthor(undefined); setModalOpen(true) }
  const openEdit = (author: Author) => { setEditAuthor(author); setModalOpen(true) }
  const closeModal = () => setModalOpen(false)

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold uppercase text-poros-red">Taksonomi</p>
          <h1 className="font-heading text-3xl font-black text-poros-navy">Penulis</h1>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-poros-red px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
        >
          <Plus size={16} /> Tambah Penulis
        </button>
      </div>

      <section className="overflow-hidden rounded-xl border border-border-light bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-text-secondary">
              <tr>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {authors.map((author) => (
                <tr key={author.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900">{author.name}</p>
                    {author.bio && (
                      <p className="line-clamp-1 text-xs text-text-secondary mt-0.5">{author.bio}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">/{author.slug}</td>
                  <td className="px-4 py-3">{author.email || '-'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase ${
                        author.isActive === false
                          ? 'bg-gray-100 text-gray-500'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {author.isActive === false ? 'Nonaktif' : 'Aktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(author)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border-light px-3 py-1.5 text-xs font-bold text-poros-red hover:bg-red-50 hover:border-poros-red transition-colors"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                  </td>
                </tr>
              ))}
              {!authors.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-text-secondary">
                    <div className="flex flex-col items-center gap-2">
                      <p className="font-semibold">Belum ada penulis</p>
                      <p className="text-xs">Klik tombol Tambah Penulis untuk memulai</p>
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
        title={editAuthor ? 'Edit Penulis' : 'Tambah Penulis'}
      >
        <AuthorForm author={editAuthor} onClose={closeModal} />
      </CmsTaxonomyModal>
    </>
  )
}
