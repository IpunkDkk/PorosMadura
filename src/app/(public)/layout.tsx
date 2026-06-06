import type { Metadata } from 'next'
import { Inter, Merriweather } from 'next/font/google'
import '@/css/globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

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

export const metadata: Metadata = {
  title: {
    default: 'PorosMadura - Berita Tepat, Fakta Kuat',
    template: '%s | PorosMadura',
  },
  description:
    'Platform berita digital terpercaya yang menyajikan informasi secara cepat, akurat, dan kredibel untuk masyarakat Madura dan Nusantara.',
  openGraph: {
    title: 'PorosMadura',
    description:
      'Berita Tepat, Fakta Kuat - Platform berita digital terpercaya untuk masyarakat Madura dan Nusantara.',
    siteName: 'PorosMadura',
    locale: 'id_ID',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
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
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
