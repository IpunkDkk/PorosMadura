import { Save } from 'lucide-react'
import { getCmsTaxonomyData, saveTagAction } from '@/lib/cms-admin'

export const dynamic = 'force-dynamic'

function TagForm({ tag }: { tag?: any }) {
  return (
    <form action={saveTagAction} className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <input type="hidden" name="returnTo" value="/cms/taxonomy/tags" />
      {tag?.id ? <input type="hidden" name="id" value={tag.id} /> : null}
      <input name="name" required placeholder="Nama tag" defaultValue={tag?.name || ''} className="rounded-md border border-border-light px-3 py-2 text-sm" />
      <input name="slug" placeholder="Slug otomatis jika kosong" defaultValue={tag?.slug || ''} className="rounded-md border border-border-light px-3 py-2 text-sm" />
      <textarea name="description" rows={3} placeholder="Deskripsi" defaultValue={tag?.description || ''} className="rounded-md border border-border-light px-3 py-2 text-sm md:col-span-2" />
      <label className="flex items-center gap-2 text-sm">
        <input name="isActive" type="checkbox" defaultChecked={tag?.isActive !== false} /> Aktif
      </label>
      <div className="md:col-span-2">
        <button className="inline-flex items-center gap-2 rounded-md bg-poros-red px-3 py-2 text-sm font-bold text-white">
          <Save size={15} /> {tag?.id ? 'Update Tag' : 'Simpan Tag'}
        </button>
      </div>
    </form>
  )
}

export default async function CmsTagsPage() {
  const { tags } = await getCmsTaxonomyData()

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase text-poros-red">Taksonomi</p>
        <h1 className="font-heading text-3xl font-black text-poros-navy">Tag</h1>
      </div>

      <section className="rounded-lg border border-border-light bg-white p-5">
        <h2 className="mb-4 font-heading text-lg font-bold">Tag Baru</h2>
        <TagForm />
      </section>

      <section className="overflow-hidden rounded-lg border border-border-light bg-white">
        <table className="w-full min-w-[680px] text-left text-sm">
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
              <tr key={tag.id} className="align-top">
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-900">{tag.name}</p>
                  <p className="line-clamp-2 text-xs text-text-secondary">{tag.description || '-'}</p>
                </td>
                <td className="px-4 py-3">/{tag.slug}</td>
                <td className="px-4 py-3">{tag.isActive === false ? 'Nonaktif' : 'Aktif'}</td>
                <td className="px-4 py-3 text-right">
                  <details>
                    <summary className="cursor-pointer text-sm font-bold text-poros-red">Edit</summary>
                    <div className="mt-4 rounded-md border border-border-light bg-gray-50 p-4 text-left">
                      <TagForm tag={tag} />
                    </div>
                  </details>
                </td>
              </tr>
            ))}
            {!tags.length && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-text-secondary">Belum ada tag.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  )
}
