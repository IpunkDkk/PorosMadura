import { getCmsSettingsData } from '@/lib/cms-admin'
import { CmsSettingsClient } from '@/components/cms/CmsSettingsClient'

export const dynamic = 'force-dynamic'

export default async function CmsSettingsPage() {
  const { settings, adSlots, media } = await getCmsSettingsData()

  const formattedAdSlots = adSlots.map(s => ({
    id: s.id,
    placement: s.placement,
    label: s.label,
    description: s.description,
    fallbackType: s.fallbackType,
    fallbackCode: s.fallbackCode,
    isFallbackActive: s.isFallbackActive,
    isActive: s.isActive
  }))

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase text-poros-red">Konfigurasi</p>
        <h1 className="font-heading text-3xl font-black text-poros-navy">Settings</h1>
      </div>
      <CmsSettingsClient
        settings={settings || null}
        adSlots={formattedAdSlots}
        media={media}
      />
    </div>
  )
}
