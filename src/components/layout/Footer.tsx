import Link from 'next/link'
import { getActiveCategories, getSiteSettings } from '@/lib/custom-cms'
import { normalizeCategory, normalizeSettings, type PublicCategory } from '@/lib/cms'
import { getMediaUrl } from '@/lib/media'

export default async function Footer() {
  const [categoriesResult, settingsResult] = await Promise.all([
    getActiveCategories(),
    getSiteSettings(),
  ])
  const categories = categoriesResult.docs
    .map(normalizeCategory)
    .filter((category): category is PublicCategory => Boolean(category))
    .slice(0, 9)
  const settings = normalizeSettings(settingsResult)

  return (
    <footer className="bg-white border-t border-border-light pt-16 pb-8 mt-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <img
                src={settings.logo
                  ? getMediaUrl(settings.logo as Record<string, unknown>)
                  : '/logo.png'
                }
                alt={settings.siteName}
                className="h-10 w-auto object-contain"
              />
              <span className="font-heading font-black text-3xl tracking-tight text-poros-navy">
                {settings.siteName}
              </span>
            </Link>
            <p className="text-sm text-gray-500 mb-4 font-heading italic font-medium">
              &ldquo;{settings.tagline}&rdquo;
            </p>
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              {settings.siteDescription}
            </p>
          </div>

          <div>
            <h4 className="font-black text-poros-navy text-lg mb-5 font-heading">
              Kategori Utama
            </h4>
            <ul className="space-y-3 text-sm text-gray-600 font-semibold">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/category/${cat.slug}`} className="hover:text-poros-red transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-black text-poros-navy text-lg mb-5 font-heading">
              Perusahaan
            </h4>
            <ul className="space-y-3 text-sm text-gray-600 font-semibold">
              {[
                ['Perusahaan', '/perusahaan'],
                ['Tentang Kami', '/tentang-kami'],
                ['Susunan Redaksi', '/susunan-redaksi'],
                ['Pedoman Media Siber', '/pedoman-media-siber'],
                ['Disclaimer', '/disclaimer'],
                ['Kebijakan Privasi', '/kebijakan-privasi'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-poros-red transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-black text-poros-navy text-lg mb-5 font-heading">
              Hubungi Kami
            </h4>
            <ul className="space-y-3 text-sm text-gray-600 font-medium">
              <li>
                <span className="font-bold">Email:</span> {settings.contactEmail}
              </li>
              <li className="mt-6 pt-6 border-t border-border-light">
                <Link
                  href="/advertise"
                  className="inline-flex items-center justify-center bg-poros-navy text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-poros-red transition-colors w-full"
                >
                  Pasang Iklan / Advertise
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border-light text-center flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500 font-medium">
            &copy; {new Date().getFullYear()} {settings.siteName}. Hak Cipta Dilindungi.
          </p>
          <div className="flex gap-6 text-sm font-bold text-gray-400">
            <Link href="/syarat-ketentuan" className="hover:text-poros-navy">
              Syarat &amp; Ketentuan
            </Link>
            <Link href="/privacy-policy" className="hover:text-poros-navy">
              Kebijakan Privasi
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
