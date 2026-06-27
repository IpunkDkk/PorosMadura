import { getCmsTaxonomyData } from '@/lib/cms-admin'
import { CmsTagsClient } from '@/components/cms/CmsTagsClient'

export const dynamic = 'force-dynamic'

export default async function CmsTagsPage() {
  const { tags } = await getCmsTaxonomyData()
  return (
    <div className="space-y-6">
      <CmsTagsClient tags={tags} />
    </div>
  )
}
