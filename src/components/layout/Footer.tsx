import Link from 'next/link'

const categories = [
  { name: 'Nasional', slug: 'nasional' },
  { name: 'Madura', slug: 'madura' },
  { name: 'Politik', slug: 'politik' },
  { name: 'Ekonomi', slug: 'ekonomi' },
  { name: 'Olahraga', slug: 'olahraga' },
  { name: 'Teknologi', slug: 'teknologi' },
  { name: 'Lifestyle', slug: 'lifestyle' },
  { name: 'Budaya', slug: 'budaya' },
  { name: 'Viral', slug: 'viral' },
]

export default function Footer() {
  return (
    <footer className="bg-white border-t border-border-light pt-16 pb-8 mt-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Column 1: Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-1 mb-4">
              <span className="bg-poros-red text-white font-heading font-bold text-3xl w-10 h-10 flex items-center justify-center rounded-lg">
                P
              </span>
              <span className="font-heading font-black text-3xl tracking-tight text-poros-navy">
                Poros<span className="text-poros-red">Madura</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 mb-4 font-heading italic font-medium">
              &ldquo;Berita Tepat, Fakta Kuat&rdquo;
            </p>
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              Platform berita digital terpercaya yang menyajikan informasi secara
              cepat, akurat, dan kredibel untuk masyarakat Madura dan Nusantara.
            </p>
          </div>

          {/* Column 2: Kategori */}
          <div>
            <h4 className="font-black text-poros-navy text-lg mb-5 font-heading">
              Kategori Utama
            </h4>
            <ul className="space-y-3 text-sm text-gray-600 font-semibold">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="hover:text-poros-red transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Perusahaan */}
          <div>
            <h4 className="font-black text-poros-navy text-lg mb-5 font-heading">
              Perusahaan
            </h4>
            <ul className="space-y-3 text-sm text-gray-600 font-semibold">
              <li>
                <Link
                  href="/tentang-kami"
                  className="hover:text-poros-red transition-colors"
                >
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link
                  href="/redaksi"
                  className="hover:text-poros-red transition-colors"
                >
                  Susunan Redaksi
                </Link>
              </li>
              <li>
                <Link
                  href="/pedoman-media-siber"
                  className="hover:text-poros-red transition-colors"
                >
                  Pedoman Media Siber
                </Link>
              </li>
              <li>
                <Link
                  href="/disclaimer"
                  className="hover:text-poros-red transition-colors"
                >
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="hover:text-poros-red transition-colors"
                >
                  Kebijakan Privasi
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Kontak */}
          <div>
            <h4 className="font-black text-poros-navy text-lg mb-5 font-heading">
              Hubungi Kami
            </h4>
            <ul className="space-y-3 text-sm text-gray-600 font-medium">
              <li>
                <span className="font-bold">Email:</span>{' '}
                redaksi@porosmadura.com
              </li>
              <li>
                <span className="font-bold">Telepon:</span> (0324) 123456
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

        {/* Bottom Footer */}
        <div className="pt-8 border-t border-border-light text-center flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500 font-medium">
            &copy; {new Date().getFullYear()} PorosMadura. Hak Cipta Dilindungi.
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
