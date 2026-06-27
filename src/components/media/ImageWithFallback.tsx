'use client'

import { useState } from 'react'
import Image from 'next/image'
import { getImageSizeUrl } from '@/lib/media'

interface ImageWithFallbackProps {
  src: Record<string, unknown> | string | null | undefined
  alt: string
  size?: 'thumbnail' | 'card' | 'hero' | 'og'
  className?: string
}

export function ImageWithFallback({ src, alt, size = 'card', className = '' }: ImageWithFallbackProps) {
  const [error, setError] = useState(false)
  const imgSrc = error ? '/og-image.jpg' : getImageSizeUrl(src as Record<string, unknown> | null | undefined, size)

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={640}
      height={360}
      className={className}
      loading="lazy"
      onError={() => setError(true)}
    />
  )
}
