'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Plus, Pencil } from 'lucide-react'
import { saveSettingsAction, saveAdSlotAction } from '@/lib/cms-admin'
import { CmsTaxonomyModal } from '@/components/cms/CmsTaxonomyModal'

type MediaItem = {
  id: number
  alt?: string | null
  filename?: string | null
}

type SettingsData = {
  siteName: string
  tagline?: string | null
  siteDescription?: string | null
  siteUrl?: string | null
  contactEmail?: string | null
  logoId?: number | null
  logoDarkId?: number | null
  faviconId?: number | null
  defaultOgImageId?: number | null
  socialLinksFacebook?: string | null
  socialLinksTwitter?: string | null
  socialLinksInstagram?: string | null
  socialLinksYoutube?: string | null
  defaultSeoTitle?: string | null
  defaultSeoDescription?: string | null
  googleAnalyticsId?: string | null
  rssTitle?: string | null
  rssDescription?: string | null
  newsPublicationName?: string | null
}



type AdSlot = {
  id: number
  placement: string
  label: string
  description?: string | null
  fallbackType: string
  fallbackCode?: string | null
  isFallbackActive: boolean
  isActive: boolean
}



function AdSlotForm({ slot, onClose }: { slot?: AdSlot; onClose: () => void }) {
  const router = useRouter()
  return (
    <form
      action={async (formData: FormData) => {
        await saveAdSlotAction(formData)
        router.refresh()
        onClose()
      }}
      className="space-y-4"
    >
      {slot?.id ? <input type="hidden" name="id" value={slot.id} /> : null}

      <div>
        <label className="block text-sm font-semibold mb-1.5">Placement Key <span className="text-poros-red">*</span></label>
        <input
          name="placement"
          required
          defaultValue={slot?.placement || ''}
          placeholder="Contoh: home_top_banner"
          className="w-full rounded-lg border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1.5">Label <span className="text-poros-red">*</span></label>
        <input
          name="label"
          required
          defaultValue={slot?.label || ''}
          placeholder="Contoh: Banner Atas Beranda"
          className="w-full rounded-lg border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1.5">Deskripsi Posisi</label>
        <textarea
          name="description"
          rows={2}
          defaultValue={slot?.description || ''}
          placeholder="Lokasi detail penempatan iklan"
          className="w-full rounded-lg border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1.5">Fallback Type</label>
        <select
          name="fallbackType"
          defaultValue={slot?.fallbackType || 'none'}
          className="w-full rounded-lg border border-border-light bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
        >
          <option value="none">Tanpa fallback</option>
          <option value="adsense">Google AdSense</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1.5">Kode Fallback Iklan</label>
        <textarea
          name="fallbackCode"
          rows={4}
          defaultValue={slot?.fallbackCode || ''}
          placeholder="Paste kode script Adsense / ad networks di sini"
          className="w-full rounded-lg border border-border-light px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-poros-red/30"
        />
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            name="isFallbackActive"
            type="checkbox"
            defaultChecked={slot?.isFallbackActive === true}
            className="h-4 w-4 accent-poros-red"
          />
          <span className="font-semibold">Fallback Aktif</span>
        </label>

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={slot?.isActive !== false}
            className="h-4 w-4 accent-poros-red"
          />
          <span className="font-semibold">Slot Aktif</span>
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
          <Save size={15} /> {slot?.id ? 'Update Slot' : 'Simpan Slot'}
        </button>
      </div>
    </form>
  )
}

export function CmsSettingsClient({
  settings,
  adSlots,
  media,
}: {
  settings: SettingsData | null
  adSlots: AdSlot[]
  media: MediaItem[]
}) {
  const router = useRouter()
  const [slotModalOpen, setSlotModalOpen] = useState(false)
  const [editSlot, setEditSlot] = useState<AdSlot | undefined>()

  const openCreateSlot = () => { setEditSlot(undefined); setSlotModalOpen(true) }
  const openEditSlot = (slot: AdSlot) => { setEditSlot(slot); setSlotModalOpen(true) }

  return (
    <div className="space-y-8">
      {/* Site Settings */}
      <section className="rounded-xl border border-border-light bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-heading text-xl font-bold text-poros-navy">Site Settings</h2>
        <form
          action={async (formData: FormData) => {
            await saveSettingsAction(formData)
            router.refresh()
          }}
          className="grid grid-cols-1 gap-5 md:grid-cols-2"
        >
          <div>
            <label className="block text-sm font-semibold mb-1.5">Nama Situs</label>
            <input
              name="siteName"
              defaultValue={settings?.siteName || ''}
              className="w-full rounded-lg border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Tagline</label>
            <input
              name="tagline"
              defaultValue={settings?.tagline || ''}
              className="w-full rounded-lg border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1.5">Deskripsi Situs</label>
            <textarea
              name="siteDescription"
              rows={3}
              defaultValue={settings?.siteDescription || ''}
              className="w-full rounded-lg border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Site URL</label>
            <input
              name="siteUrl"
              defaultValue={settings?.siteUrl || ''}
              className="w-full rounded-lg border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Email Kontak</label>
            <input
              name="contactEmail"
              type="email"
              defaultValue={settings?.contactEmail || ''}
              className="w-full rounded-lg border border-border-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Logo</label>
            <select
              name="logoId"
              defaultValue={settings?.logoId || ''}
              className="w-full rounded-lg border border-border-light bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
            >
              <option value="">Tanpa logo</option>
              {media.map((item) => (
                <option key={item.id} value={item.id}>{item.alt || item.filename}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Logo Dark</label>
            <select
              name="logoDarkId"
              defaultValue={settings?.logoDarkId || ''}
              className="w-full rounded-lg border border-border-light bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
            >
              <option value="">Tanpa logo dark</option>
              {media.map((item) => (
                <option key={item.id} value={item.id}>{item.alt || item.filename}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Favicon</label>
            <select
              name="faviconId"
              defaultValue={settings?.faviconId || ''}
              className="w-full rounded-lg border border-border-light bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
            >
              <option value="">Tanpa favicon</option>
              {media.map((item) => (
                <option key={item.id} value={item.id}>{item.alt || item.filename}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Default OG Image</label>
            <select
              name="defaultOgImageId"
              defaultValue={settings?.defaultOgImageId || ''}
              className="w-full rounded-lg border border-border-light bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-poros-red/30"
            >
              <option value="">Tanpa default OG</option>
              {media.map((item) => (
                <option key={item.id} value={item.id}>{item.alt || item.filename}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 border-t border-border-light pt-4">
            <h3 className="text-sm font-bold text-poros-navy uppercase mb-3 tracking-wide">Social Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="facebook" placeholder="Facebook URL" defaultValue={settings?.socialLinksFacebook || ''} className="rounded-lg border border-border-light px-3 py-2 text-sm" />
              <input name="twitter" placeholder="Twitter/X URL" defaultValue={settings?.socialLinksTwitter || ''} className="rounded-lg border border-border-light px-3 py-2 text-sm" />
              <input name="instagram" placeholder="Instagram URL" defaultValue={settings?.socialLinksInstagram || ''} className="rounded-lg border border-border-light px-3 py-2 text-sm" />
              <input name="youtube" placeholder="YouTube URL" defaultValue={settings?.socialLinksYoutube || ''} className="rounded-lg border border-border-light px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="md:col-span-2 border-t border-border-light pt-4">
            <h3 className="text-sm font-bold text-poros-navy uppercase mb-3 tracking-wide">SEO &amp; RSS Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="defaultSeoTitle" placeholder="Default SEO Title" defaultValue={settings?.defaultSeoTitle || ''} className="rounded-lg border border-border-light px-3 py-2 text-sm" />
              <input name="defaultSeoDescription" placeholder="Default SEO Description" defaultValue={settings?.defaultSeoDescription || ''} className="rounded-lg border border-border-light px-3 py-2 text-sm" />
              <input name="googleAnalyticsId" placeholder="Google Analytics ID" defaultValue={settings?.googleAnalyticsId || ''} className="rounded-lg border border-border-light px-3 py-2 text-sm" />
              <input name="rssTitle" placeholder="RSS Title" defaultValue={settings?.rssTitle || ''} className="rounded-lg border border-border-light px-3 py-2 text-sm" />
              <input name="rssDescription" placeholder="RSS Description" defaultValue={settings?.rssDescription || ''} className="rounded-lg border border-border-light px-3 py-2 text-sm" />
              <input name="newsPublicationName" placeholder="News Publication Name" defaultValue={settings?.newsPublicationName || ''} className="rounded-lg border border-border-light px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end pt-3">
            <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-poros-red px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors shadow-sm">
              <Save size={16} /> Simpan Settings
            </button>
          </div>
        </form>
      </section>



      {/* Slot Iklan Section */}
      <section className="overflow-hidden rounded-xl border border-border-light bg-white shadow-sm">
        <div className="border-b border-border-light px-6 py-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-poros-navy">Slot Iklan</h2>
          <button
            onClick={openCreateSlot}
            className="inline-flex items-center gap-2 rounded-lg bg-poros-red px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition-colors"
          >
            <Plus size={14} /> Slot Baru
          </button>
        </div>
        <div className="overflow-x-auto">
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
                <tr key={slot.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900">{slot.label}</p>
                    {slot.description && <p className="text-xs text-text-secondary mt-0.5">{slot.description}</p>}
                  </td>
                  <td className="px-4 py-3 text-text-secondary font-mono text-xs">{slot.placement}</td>
                  <td className="px-4 py-3 text-xs">
                    <span className="font-semibold">{slot.fallbackType || 'none'}</span>
                    {slot.isFallbackActive ? (
                      <span className="ml-1.5 text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded text-[10px] uppercase">aktif</span>
                    ) : (
                      <span className="ml-1.5 text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded text-[10px] uppercase">nonaktif</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                        slot.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {slot.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEditSlot(slot)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border-light px-3 py-1.5 text-xs font-bold text-poros-red hover:bg-red-50 hover:border-poros-red transition-colors"
                    >
                      <Pencil size={13} /> Edit
                    </button>
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
        </div>
      </section>



      {/* Ad Slots Modal */}
      <CmsTaxonomyModal
        open={slotModalOpen}
        onClose={() => setSlotModalOpen(false)}
        title={editSlot ? 'Edit Slot Iklan' : 'Tambah Slot Iklan'}
      >
        <AdSlotForm slot={editSlot} onClose={() => setSlotModalOpen(false)} />
      </CmsTaxonomyModal>
    </div>
  )
}
