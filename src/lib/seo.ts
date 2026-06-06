import type { Metadata } from 'next'

interface DefaultMeta {
  title?: string
  description?: string
  image?: string
}

export function getDefaultMetadata(overrides?: DefaultMeta): Metadata {
  return {
    title: overrides?.title || 'PorosMadura | Berita Tepat, Fakta Kuat',
    description: overrides?.description || 'Portal berita digital Madura yang menyajikan informasi cepat, akurat, dan kredibel.',
    openGraph: {
      siteName: 'PorosMadura',
      locale: 'id_ID',
      type: 'website',
      images: overrides?.image ? [{ url: overrides.image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
    },
    robots: { index: true, follow: true },
  }
}
