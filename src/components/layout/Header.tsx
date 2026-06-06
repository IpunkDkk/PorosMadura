import { getActiveCategories, getSiteSettings } from '@/lib/payload'
import { normalizeCategory, normalizeSettings, type PublicCategory } from '@/lib/cms'
import HeaderClient from '@/components/layout/HeaderClient'

export default async function Header() {
  const [categoriesResult, settingsResult] = await Promise.all([
    getActiveCategories(),
    getSiteSettings(),
  ])

  return (
    <HeaderClient
      categories={categoriesResult.docs
        .map(normalizeCategory)
        .filter((category): category is PublicCategory => Boolean(category))}
      settings={normalizeSettings(settingsResult)}
    />
  )
}
