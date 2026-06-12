'use client'

import { useState } from 'react'
import { Menu, Search, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { PublicCategory, PublicSettings } from '@/lib/cms'
import { getMediaUrl } from '@/lib/media'

interface HeaderClientProps {
  categories: PublicCategory[]
  settings: PublicSettings
}

export default function HeaderClient({ categories, settings }: HeaderClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActiveCategory = (slug: string) => pathname === `/category/${slug}`

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <>
      <header className="w-full bg-poros-navy text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex flex-col">
              <Link href="/" className="flex items-center gap-2 group">
                <img
                  src={settings.logo
                    ? getMediaUrl(settings.logo as Record<string, unknown>)
                    : '/logo-putih.png'
                  }
                  alt={settings.siteName}
                  className="h-10 w-auto object-contain"
                />
                <h1 className="font-heading font-black text-2xl tracking-tight">
                  {settings.siteName}
                </h1>
              </Link>
              <span className="text-[10px] text-white/70 tracking-widest mt-0.5 uppercase hidden md:block font-medium">
                {settings.tagline}
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-6">
              <span className="text-sm text-white/80 font-medium">{today}</span>
              <div className="h-4 w-px bg-white/20" />
              <Link href="/admin" className="text-sm text-white/70 hover:text-poros-red transition-colors font-medium" title="Dashboard Admin">
                Dashboard
              </Link>
              <Link className="hover:text-poros-red transition-colors" aria-label="Cari" href="/search">
                <Search size={20} />
              </Link>
              {/* Login/Daftar di-hide sementara sampai fitur siap */}
            </div>

            <div className="lg:hidden flex items-center gap-4">
              <Link href="/admin" className="text-sm text-white/70 hover:text-poros-red transition-colors" title="Dashboard Admin">
                Dashboard
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white"
                aria-label={isMobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
              >
                {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-border-light sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 lg:px-8">
          <nav className="flex items-center py-3 overflow-x-auto hide-scrollbar gap-6">
            <Link href="/" className="text-sm font-bold text-poros-red whitespace-nowrap">
              HOME
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className={`text-sm font-semibold whitespace-nowrap transition-colors ${
                  isActiveCategory(cat.slug)
                    ? 'text-poros-red'
                    : 'text-gray-600 hover:text-poros-red'
                }`}
              >
                {cat.name.toUpperCase()}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[120px] bg-white z-50 overflow-y-auto border-t border-border-light p-4 shadow-xl">
          <nav className="flex flex-col gap-4">
            {/* Login/Daftar di-hide sementara */}
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className={`py-2 border-b border-border-light text-base font-bold transition-colors ${
                  isActiveCategory(cat.slug)
                    ? 'text-poros-red'
                    : 'text-gray-800 hover:text-poros-red'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}
