export function getMediaUrl(media: Record<string, unknown> | string | null | undefined): string {
  if (!media) return '/og-image.jpg'
  if (typeof media === 'string') return media

  const rec = media as Record<string, unknown>
  const baseUrl = process.env.NEXT_PUBLIC_MEDIA_URL || '/media'
  const filename =
    typeof rec.filename === 'string'
      ? rec.filename
      : typeof rec.url === 'string'
        ? rec.url
        : null

  if (!filename) return '/og-image.jpg'
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    try {
      const url = new URL(filename)
      // Jika URL absolut mengarah ke localhost, ubah jadi relative
      // supaya tetap berfungsi di domain manapun (ngrok, production, dll)
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        return url.pathname + url.search
      }
    } catch {
      /* ignore invalid URL */
    }
    return filename
  }

  return `${baseUrl}/${filename.replace(/^\//, '')}`
}

interface MediaSizes {
  thumbnail?: { url: string }
  card?: { url: string }
  hero?: { url: string }
  og?: { url: string }
  [key: string]: { url: string } | undefined
}

export function getImageSizeUrl(
  media: Record<string, unknown> | null | undefined,
  size: 'thumbnail' | 'card' | 'hero' | 'og' = 'card'
): string {
  if (!media) return '/og-image.jpg'
  if (typeof media === 'string') return getMediaUrl(media)

  const rec = media as Record<string, unknown>
  const sizes = rec.sizes as MediaSizes | undefined
  const sizeUrl = sizes?.[size]?.url
  if (sizeUrl) {
    return getMediaUrl(sizeUrl)
  }

  return getMediaUrl(media)
}
