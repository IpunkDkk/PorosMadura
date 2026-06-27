import { Save } from 'lucide-react'
import { getCmsTaxonomyData, saveAuthorAction } from '@/lib/cms-admin'

export const dynamic = 'force-dynamic'

function AuthorForm({ author }: { author?: any }) {
  return (
    <form action={saveAuthorAction} className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <input type="hidden" name="returnTo" value="/cms/taxonomy/authors" />
      {author?.id ? <input type="hidden" name="id" value={author.id} /> : null}
      <input name="name" required placeholder="Nama penulis" defaultValue={author?.name || ''} className="rounded-md border border-border-light px-3 py-2 text-sm" />
      <input name="slug" placeholder="Slug otomatis jika kosong" defaultValue={author?.slug || ''} className="rounded-md border border-border-light px-3 py-2 text-sm" />
      <input name="email" type="email" placeholder="Email" defaultValue={author?.email || ''} className="rounded-md border border-border-light px-3 py-2 text-sm" />
      <textarea name="bio" rows={3} placeholder="Bio" defaultValue={author?.bio || ''} className="rounded-md border border-border-light px-3 py-2 text-sm md:col-span-2" />
      <input name="facebook" placeholder="Facebook URL" defaultValue={author?.socialLinksFacebook || ''} className="rounded-md border border-border-light px-3 py-2 text-sm" />
      <input name="twitter" placeholder="Twitter/X URL" defaultValue={author?.socialLinksTwitter || ''} className="rounded-md border border-border-light px-3 py-2 text-sm" />
      <input name="instagram" placeholder="Instagram URL" defaultValue={author?.socialLinksInstagram || ''} className="rounded-md border border-border-light px-3 py-2 text-sm" />
      <label className="flex items-center gap-2 text-sm">
        <input name="isActive" type="checkbox" defaultChecked={author?.isActive !== false} /> Aktif
      </label>
      <div className="md:col-span-2">
        <button className="inline-flex items-center gap-2 rounded-md bg-poros-red px-3 py-2 text-sm font-bold text-white">
          <Save size={15} /> {author?.id ? 'Update Penulis' : 'Simpan Penulis'}
        </button>
      </div>
    </form>
  )
}

export default async function CmsAuthorsPage() {
  const { authors } = await getCmsTaxonomyData()

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase text-poros-red">Taksonomi</p>
        <h1 className="font-heading text-3xl font-black text-poros-navy">Penulis</h1>
      </div>

      <section className="rounded-lg border border-border-light bg-white p-5">
        <h2 className="mb-4 font-heading text-lg font-bold">Penulis Baru</h2>
        <AuthorForm />
      </section>

      <section className="overflow-hidden rounded-lg border border-border-light bg-white">
        <table className="w-full min-w-[820px] text-left text-sm">
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
              <tr key={author.id} className="align-top">
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-900">{author.name}</p>
                  <p className="line-clamp-2 text-xs text-text-secondary">{author.bio || '-'}</p>
                </td>
                <td className="px-4 py-3">/{author.slug}</td>
                <td className="px-4 py-3">{author.email || '-'}</td>
                <td className="px-4 py-3">{author.isActive === false ? 'Nonaktif' : 'Aktif'}</td>
                <td className="px-4 py-3 text-right">
                  <details>
                    <summary className="cursor-pointer text-sm font-bold text-poros-red">Edit</summary>
                    <div className="mt-4 rounded-md border border-border-light bg-gray-50 p-4 text-left">
                      <AuthorForm author={author} />
                    </div>
                  </details>
                </td>
              </tr>
            ))}
            {!authors.length && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">Belum ada penulis.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  )
}
