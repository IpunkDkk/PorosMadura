import { getCmsTaxonomyData } from '@/lib/cms-admin'
import { CmsCategoriesClient } from '@/components/cms/CmsCategoriesClient'

export const dynamic = 'force-dynamic'

export default async function CmsCategoriesPage() {
  const { categories } = await getCmsTaxonomyData()
  return (
    <div className="space-y-6">
      <CmsCategoriesClient categories={categories} />
    </div>
  )
}
