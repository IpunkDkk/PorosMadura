'use client'

import { useState } from 'react'
import { Menu, Search, X, TrendingUp } from 'lucide-react'
import Link from 'next/link'

const categories = [
  'Nasional',
  'Madura',
  'Politik',
  'Ekonomi',
  'Olahraga',
  'Teknologi',
  'Lifestyle',
  'Budaya',
  'Viral',
]

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <>
      {/* HEADER TOP BAR (Navy) */}
      <header className="w-full bg-poros-navy text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <div className="flex flex-col">
              <Link href="/" className="flex items-center gap-1 group">
                <span className="bg-poros-red text-white font-heading font-bold text-2xl w-8 h-8 flex items-center justify-center rounded">
                  P
                </span>
                <h1 className="font-heading font-black text-2xl tracking-tight">
                  Poros<span className="font-normal text-white/90">Madura</span>
                </h1>
              </Link>
              <span className="text-[10px] text-white/70 tracking-widest mt-0.5 uppercase hidden md:block font-medium">
                Berita Tepat, Fakta Kuat
              </span>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-6">
              <span className="text-sm text-white/80 font-medium">{today}</span>
              <div className="h-4 w-px bg-white/20" />
              <button
                className="hover:text-poros-red transition-colors"
                aria-label="Cari"
              >
                <Search size={20} />
              </button>
              <Link
                href="/login"
                className="bg-poros-red hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Login / Daftar
              </Link>
            </div>

            {/* Mobile Actions */}
            <div className="lg:hidden flex items-center gap-4">
              <button
                className="hover:text-poros-red transition-colors"
                aria-label="Cari"
              >
                <Search size={22} />
              </button>
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

      {/* STICKY CATEGORY BAR (White) */}
      <div className="bg-white border-b border-border-light sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 lg:px-8">
          <nav className="flex items-center py-3 overflow-x-auto hide-scrollbar gap-6">
            <Link
              href="/"
              className="text-sm font-bold text-poros-red whitespace-nowrap"
            >
              HOME
            </Link>
            <Link
              href="/trending"
              className="text-sm font-bold text-poros-navy whitespace-nowrap flex items-center gap-1"
            >
              <TrendingUp size={16} className="text-poros-red" /> TRENDING
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/category/${cat.toLowerCase()}`}
                className="text-sm font-semibold text-gray-600 hover:text-poros-red transition-colors whitespace-nowrap"
              >
                {cat.toUpperCase()}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* MOBILE MENU OVERLAY */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[120px] bg-white z-50 overflow-y-auto border-t border-border-light p-4 shadow-xl">
          <nav className="flex flex-col gap-4">
            <Link
              href="/login"
              className="bg-poros-navy text-white py-3 rounded-xl font-bold w-full text-center mb-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login / Daftar
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/category/${cat.toLowerCase()}`}
                className="py-2 border-b border-border-light text-base font-bold text-gray-800 hover:text-poros-red"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {cat}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}
