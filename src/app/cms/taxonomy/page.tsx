import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function CmsTaxonomyPage() {
  redirect('/cms/taxonomy/categories')
}
