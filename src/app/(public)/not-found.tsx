import type { Metadata } from 'next'
import { PublicErrorState } from '@/components/layout/PublicErrorState'

export const metadata: Metadata = {
  title: 'Halaman Tidak Ditemukan',
  robots: {
    index: false,
    follow: false,
  },
}

export default function PublicNotFound() {
  return (
    <PublicErrorState
      code="404"
      eyebrow="Halaman tidak ditemukan"
      title="Alamat yang Anda tuju tidak tersedia."
      description="Berita, halaman, atau kategori ini mungkin sudah dipindahkan, diganti slug, atau belum dipublikasikan."
    />
  )
}
