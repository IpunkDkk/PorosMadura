import { getCmsMediaList } from '@/lib/cms-admin'
import { MediaGrid } from '@/components/cms/MediaGrid'

export const dynamic = 'force-dynamic'

export default async function CmsMediaPage() {
  const mediaItems = await getCmsMediaList()
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold uppercase text-poros-red">Assets</p>
        <h1 className="font-heading text-3xl font-black text-poros-navy">Media</h1>
      </div>
      <MediaGrid initialItems={mediaItems} />
    </div>
  )
}
