import Link from 'next/link'
import { ArrowLeft, Home, RefreshCcw, Search } from 'lucide-react'

type PublicErrorStateProps = {
  code: string
  eyebrow: string
  title: string
  description: string
  reset?: () => void
}

export function PublicErrorState({
  code,
  eyebrow,
  title,
  description,
  reset,
}: PublicErrorStateProps) {
  return (
    <section className="container mx-auto px-4 lg:px-8 py-12 md:py-20">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="border-l-4 border-poros-red bg-white px-6 py-8 shadow-sm md:px-10 md:py-12">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-poros-red">
            {eyebrow}
          </p>
          <p className="mb-5 font-heading text-7xl font-black leading-none text-poros-navy md:text-8xl">
            {code}
          </p>
          <h1 className="max-w-3xl font-heading text-3xl font-black leading-tight text-poros-navy md:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-text-secondary md:text-lg">
            {description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-poros-red px-5 py-3 text-sm font-black text-white transition-colors hover:bg-red-700"
            >
              <Home size={17} />
              Beranda
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border-light bg-white px-5 py-3 text-sm font-black text-poros-navy transition-colors hover:border-poros-red hover:text-poros-red"
            >
              <Search size={17} />
              Cari Berita
            </Link>
            {reset ? (
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-border-light bg-white px-5 py-3 text-sm font-black text-poros-navy transition-colors hover:border-poros-red hover:text-poros-red"
              >
                <RefreshCcw size={17} />
                Muat Ulang
              </button>
            ) : null}
          </div>
        </div>

        <aside className="bg-poros-navy px-6 py-7 text-white shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-white/60">
            PorosMadura
          </p>
          <h2 className="mt-3 font-heading text-2xl font-black leading-tight">
            Berita Tepat, Fakta Kuat
          </h2>
          <p className="mt-4 text-sm leading-6 text-white/75">
            Telusuri berita terbaru Madura melalui halaman utama, pencarian, atau kategori pilihan redaksi.
          </p>
          <Link
            href="/category/madura"
            className="mt-6 inline-flex items-center gap-2 text-sm font-black text-white hover:text-white/80"
          >
            Kategori Madura
            <ArrowLeft size={16} className="rotate-180" />
          </Link>
        </aside>
      </div>
    </section>
  )
}
