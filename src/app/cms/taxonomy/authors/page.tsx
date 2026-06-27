import { getCmsTaxonomyData } from '@/lib/cms-admin'
import { CmsAuthorsClient } from '@/components/cms/CmsAuthorsClient'

export const dynamic = 'force-dynamic'

export default async function CmsAuthorsPage() {
  const { authors } = await getCmsTaxonomyData()
  return (
    <div className="space-y-6">
      <CmsAuthorsClient authors={authors} />
    </div>
  )
}
