import { Save } from 'lucide-react'
import { getCmsSettingsData, saveAdSlotAction, savePageAction, saveSettingsAction } from '@/lib/cms-admin'

export const dynamic = 'force-dynamic'

function Input({
  name,
  label,
  defaultValue,
  type = 'text',
}: {
  name: string
  label: string
  defaultValue?: string | null
  type?: string
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue || ''}
        className="w-full rounded-md border border-border-light px-3 py-2 text-sm"
      />
    </label>
  )
}

function PageForm({ page }: { page?: any }) {
  return (
    <form action={savePageAction} className="space-y-3">
      {page?.id ? <input type="hidden" name="id" value={page.id} /> : null}
      <Input name="title" label="Judul" defaultValue={page?.title} />
      <Input name="slug" label="Slug" defaultValue={page?.slug} />
      <textarea name="content" rows={8} placeholder="<p>Konten halaman...</p>" defaultValue={typeof page?.content === 'string' ? page.content : ''} className="w-full rounded-md border border-border-light px-3 py-2 text-sm font-mono" />
      <Input name="seoTitle" label="SEO title" defaultValue={page?.seoTitle} />
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">SEO description</span>
        <textarea name="seoDescription" rows={3} defaultValue={page?.seoDescription || ''} className="w-full rounded-md border border-border-light px-3 py-2 text-sm" />
      </label>
      <select name="status" defaultValue={page?.status || 'draft'} className="w-full rounded-md border border-border-light px-3 py-2 text-sm bg-white">
        <option value="draft">Draft</option>
        <option value="published">Published</option>
      </select>
      <button className="inline-flex items-center gap-2 rounded-md bg-poros-red px-3 py-2 text-sm font-bold text-white">
        <Save size={15} /> {page?.id ? 'Update Halaman' : 'Simpan Halaman'}
      </button>
    </form>
  )
}

function AdSlotForm({ slot }: { slot?: any }) {
  return (
    <form action={saveAdSlotAction} className="space-y-3">
      {slot?.id ? <input type="hidden" name="id" value={slot.id} /> : null}
      <Input name="placement" label="Placement key" defaultValue={slot?.placement} />
      <Input name="label" label="Label" defaultValue={slot?.label} />
      <textarea name="description" rows={3} placeholder="Deskripsi posisi" defaultValue={slot?.description || ''} className="w-full rounded-md border border-border-light px-3 py-2 text-sm" />
      <select name="fallbackType" defaultValue={slot?.fallbackType || 'none'} className="w-full rounded-md border border-border-light px-3 py-2 text-sm bg-white">
        <option value="none">Tanpa fallback</option>
        <option value="adsense">Google AdSense</option>
      </select>
      <textarea name="fallbackCode" rows={5} placeholder="Kode fallback iklan" defaultValue={slot?.fallbackCode || ''} className="w-full rounded-md border border-border-light px-3 py-2 text-sm font-mono" />
      <label className="flex items-center gap-2 text-sm">
        <input name="isFallbackActive" type="checkbox" defaultChecked={slot?.isFallbackActive === true} /> Fallback aktif
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input name="isActive" type="checkbox" defaultChecked={slot?.isActive !== false} /> Slot aktif
      </label>
      <button className="inline-flex items-center gap-2 rounded-md bg-poros-red px-3 py-2 text-sm font-bold text-white">
        <Save size={15} /> {slot?.id ? 'Update Slot' : 'Simpan Slot'}
      </button>
    </form>
  )
}

export default async function CmsSettingsPage() {
  const { settings, pages, adSlots, media } = await getCmsSettingsData()

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase text-poros-red">Konfigurasi</p>
        <h1 className="font-heading text-3xl font-black text-poros-navy">Settings</h1>
      </div>

      <section className="rounded-lg border border-border-light bg-white p-5">
        <h2 className="mb-4 font-heading text-lg font-bold">Site Settings</h2>
        <form action={saveSettingsAction} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input name="siteName" label="Nama situs" defaultValue={settings?.siteName} />
          <Input name="tagline" label="Tagline" defaultValue={settings?.tagline} />
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-semibold">Deskripsi situs</span>
            <textarea name="siteDescription" rows={3} defaultValue={settings?.siteDescription || ''} className="w-full rounded-md border border-border-light px-3 py-2 text-sm" />
          </label>
          <Input name="siteUrl" label="Site URL" defaultValue={settings?.siteUrl} />
          <Input name="contactEmail" label="Email kontak" defaultValue={settings?.contactEmail} type="email" />
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Logo</span>
            <select name="logoId" defaultValue={settings?.logoId || ''} className="w-full rounded-md border border-border-light bg-white px-3 py-2 text-sm">
              <option value="">Tanpa logo</option>
              {media.map((item) => (
                <option key={item.id} value={item.id}>{item.alt || item.filename}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Logo dark</span>
            <select name="logoDarkId" defaultValue={settings?.logoDarkId || ''} className="w-full rounded-md border border-border-light bg-white px-3 py-2 text-sm">
              <option value="">Tanpa logo dark</option>
              {media.map((item) => (
                <option key={item.id} value={item.id}>{item.alt || item.filename}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Favicon</span>
            <select name="faviconId" defaultValue={settings?.faviconId || ''} className="w-full rounded-md border border-border-light bg-white px-3 py-2 text-sm">
              <option value="">Tanpa favicon</option>
              {media.map((item) => (
                <option key={item.id} value={item.id}>{item.alt || item.filename}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Default OG image</span>
            <select name="defaultOgImageId" defaultValue={settings?.defaultOgImageId || ''} className="w-full rounded-md border border-border-light bg-white px-3 py-2 text-sm">
              <option value="">Tanpa default OG</option>
              {media.map((item) => (
                <option key={item.id} value={item.id}>{item.alt || item.filename}</option>
              ))}
            </select>
          </label>
          <Input name="facebook" label="Facebook" defaultValue={settings?.socialLinksFacebook} />
          <Input name="twitter" label="Twitter/X" defaultValue={settings?.socialLinksTwitter} />
          <Input name="instagram" label="Instagram" defaultValue={settings?.socialLinksInstagram} />
          <Input name="youtube" label="YouTube" defaultValue={settings?.socialLinksYoutube} />
          <Input name="defaultSeoTitle" label="Default SEO title" defaultValue={settings?.defaultSeoTitle} />
          <Input name="defaultSeoDescription" label="Default SEO description" defaultValue={settings?.defaultSeoDescription} />
          <Input name="googleAnalyticsId" label="Google Analytics ID" defaultValue={settings?.googleAnalyticsId} />
          <Input name="rssTitle" label="RSS title" defaultValue={settings?.rssTitle} />
          <Input name="rssDescription" label="RSS description" defaultValue={settings?.rssDescription} />
          <Input name="newsPublicationName" label="News publication name" defaultValue={settings?.newsPublicationName} />
          <div className="md:col-span-2">
            <button className="inline-flex items-center gap-2 rounded-md bg-poros-red px-4 py-2 text-sm font-bold text-white">
              <Save size={16} /> Simpan Settings
            </button>
          </div>
        </form>
      </section>

      <div className="space-y-6">
        <section className="rounded-lg border border-border-light bg-white p-5">
          <h2 className="mb-4 font-heading text-lg font-bold">Halaman Baru</h2>
          <PageForm />
        </section>

        <section className="overflow-hidden rounded-lg border border-border-light bg-white">
          <div className="border-b border-border-light px-5 py-4">
            <h2 className="font-heading text-lg font-bold">Halaman Statis</h2>
          </div>
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-text-secondary">
              <tr>
                <th className="px-4 py-3">Judul</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Update</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {pages.map((page) => (
                <tr key={page.id} className="align-top">
                  <td className="px-4 py-3 font-semibold text-gray-900">{page.title}</td>
                  <td className="px-4 py-3">/{page.slug}</td>
                  <td className="px-4 py-3">{page.status}</td>
                  <td className="px-4 py-3">{page.updatedAt ? new Date(page.updatedAt).toLocaleString('id-ID') : '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <details>
                      <summary className="cursor-pointer text-sm font-bold text-poros-red">Edit</summary>
                      <div className="mt-4 rounded-md border border-border-light bg-gray-50 p-4 text-left">
                        <PageForm page={page} />
                      </div>
                    </details>
                  </td>
                </tr>
              ))}
              {!pages.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">Belum ada halaman.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="rounded-lg border border-border-light bg-white p-5">
          <h2 className="mb-4 font-heading text-lg font-bold">Slot Iklan Baru</h2>
          <AdSlotForm />
        </section>

        <section className="overflow-hidden rounded-lg border border-border-light bg-white">
          <div className="border-b border-border-light px-5 py-4">
            <h2 className="font-heading text-lg font-bold">Slot Iklan</h2>
          </div>
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-text-secondary">
              <tr>
                <th className="px-4 py-3">Label</th>
                <th className="px-4 py-3">Placement</th>
                <th className="px-4 py-3">Fallback</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {adSlots.map((slot) => (
                <tr key={slot.id} className="align-top">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900">{slot.label}</p>
                    <p className="line-clamp-2 text-xs text-text-secondary">{slot.description || '-'}</p>
                  </td>
                  <td className="px-4 py-3">{slot.placement}</td>
                  <td className="px-4 py-3">{slot.fallbackType || 'none'} · {slot.isFallbackActive ? 'aktif' : 'nonaktif'}</td>
                  <td className="px-4 py-3">{slot.isActive ? 'Aktif' : 'Nonaktif'}</td>
                  <td className="px-4 py-3 text-right">
                    <details>
                      <summary className="cursor-pointer text-sm font-bold text-poros-red">Edit</summary>
                      <div className="mt-4 rounded-md border border-border-light bg-gray-50 p-4 text-left">
                        <AdSlotForm slot={slot} />
                      </div>
                    </details>
                  </td>
                </tr>
              ))}
              {!adSlots.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">Belum ada slot iklan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}
