'use client'

import { PublicErrorState } from '@/components/layout/PublicErrorState'

export default function PublicError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <PublicErrorState
      code="500"
      eyebrow="Gangguan halaman"
      title="Halaman belum bisa ditampilkan."
      description="Terjadi gangguan saat memuat konten. Coba muat ulang atau kembali ke halaman utama."
      reset={reset}
    />
  )
}
