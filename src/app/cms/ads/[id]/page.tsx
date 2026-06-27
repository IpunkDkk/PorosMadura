import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import { getCmsAdsData, saveAdAction } from '@/lib/cms-admin'
import { AdForm } from '@/components/cms/AdForm'

export const dynamic = 'force-dynamic'

export default async function CmsEditAdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { ads, adSlots, media } = await getCmsAdsData()
  const ad = ads.find((a) => String(a.id) === id)
  if (!ad) notFound()

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/cms/ads" className="flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-poros-red">
          <ArrowLeft size={16} /> Kembali
        </Link>
        <div>
          <p className="text-sm font-bold uppercase text-poros-red">Monetisasi</p>
          <h1 className="font-heading text-3xl font-black text-poros-navy">Edit Iklan</h1>
        </div>
      </div>
      <div className="rounded-xl border border-border-light bg-white p-6 shadow-sm">
        <AdForm ad={ad} adSlots={adSlots} mediaItems={media} action={saveAdAction} backHref="/cms/ads" />
      </div>
    </div>
  )
}
