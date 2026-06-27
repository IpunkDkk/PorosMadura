import { Save } from 'lucide-react'
import { getCmsTaxonomyData, saveCategoryAction } from '@/lib/cms-admin'

export const dynamic = 'force-dynamic'

function CategoryForm({ category }: { category?: any }) {
  return (
    <form action={saveCategoryAction} className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <input type="hidden" name="returnTo" value="/cms/taxonomy/categories" />
      {category?.id ? <input type="hidden" name="id" value={category.id} /> : null}
      <input name="name" required placeholder="Nama kategori" defaultValue={category?.name || ''} className="rounded-md border border-border-light px-3 py-2 text-sm" />
      <input name="slug" placeholder="Slug otomatis jika kosong" defaultValue={category?.slug || ''} className="rounded-md border border-border-light px-3 py-2 text-sm" />
      <textarea name="description" rows={3} placeholder="Deskripsi" defaultValue={category?.description || ''} className="rounded-md border border-border-light px-3 py-2 text-sm md:col-span-2" />
      <input name="order" type="number" placeholder="Urutan" defaultValue={category?.order || 0} className="rounded-md border border-border-light px-3 py-2 text-sm" />
      <label className="flex items-center gap-2 text-sm">
        <input name="isActive" type="checkbox" defaultChecked={category?.isActive !== false} /> Aktif
      </label>
      <div className="md:col-span-2">
        <button className="inline-flex items-center gap-2 rounded-md bg-poros-red px-3 py-2 text-sm font-bold text-white">
          <Save size={15} /> {category?.id ? 'Update Kategori' : 'Simpan Kategori'}
        </button>
      </div>
    </form>
  )
}

export default async function CmsCategoriesPage() {
  const { categories } = await getCmsTaxonomyData()

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase text-poros-red">Taksonomi</p>
        <h1 className="font-heading text-3xl font-black text-poros-navy">Kategori</h1>
      </div>

      <section className="rounded-lg border border-border-light bg-white p-5">
        <h2 className="mb-4 font-heading text-lg font-bold">Kategori Baru</h2>
        <CategoryForm />
      </section>

      <section className="overflow-hidden rounded-lg border border-border-light bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-text-secondary">
            <tr>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Urutan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {categories.map((category) => (
              <tr key={category.id} className="align-top">
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-900">{category.name}</p>
                  <p className="line-clamp-2 text-xs text-text-secondary">{category.description || '-'}</p>
                </td>
                <td className="px-4 py-3">/{category.slug}</td>
                <td className="px-4 py-3">{category.order || 0}</td>
                <td className="px-4 py-3">{category.isActive === false ? 'Nonaktif' : 'Aktif'}</td>
                <td className="px-4 py-3 text-right">
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-bold text-poros-red">Edit</summary>
                    <div className="mt-4 rounded-md border border-border-light bg-gray-50 p-4 text-left">
                      <CategoryForm category={category} />
                    </div>
                  </details>
                </td>
              </tr>
            ))}
            {!categories.length && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">Belum ada kategori.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  )
}
