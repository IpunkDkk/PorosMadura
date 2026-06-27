import type { Metadata } from 'next'
import { Inter, Merriweather } from 'next/font/google'
import '@/css/globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import MobileStickyAd from '@/components/ads/MobileStickyAd'
import PopupCampaign from '@/components/ads/PopupCampaign'
import AdSlot from '@/components/ads/AdSlot'
import { getSiteSettings } from '@/lib/custom-cms'
import { getSettingsOgImage, normalizeSettings } from '@/lib/cms'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const merriweather = Merriweather({
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const settings = normalizeSettings(await getSiteSettings())
  const image = getSettingsOgImage(settings)

  return {
    title: {
      default: `${settings.siteName} - ${settings.tagline}`,
      template: `%s | ${settings.siteName}`,
    },
    description: settings.siteDescription,
    metadataBase: new URL(settings.siteUrl),
    openGraph: {
      title: settings.siteName,
      description: settings.siteDescription,
      siteName: settings.siteName,
      locale: 'id_ID',
      type: 'website',
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image',
      images: [image],
    },
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-icon.png',
    },
  }
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${merriweather.variable}`}
    >
      <body className="min-h-screen bg-page-bg text-text-primary font-body antialiased flex flex-col">
        <AdSlot placement="header_banner" className="w-full bg-gray-100" />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <MobileStickyAd />
        <PopupCampaign />
      </body>
    </html>
  )
}
