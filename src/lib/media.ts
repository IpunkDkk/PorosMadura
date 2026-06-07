export function getMediaUrl(media: Record<string, unknown> | string | null | undefined): string {
  if (!media) return '/og-image.jpg'
  if (typeof media === 'string') return media

  const rec = media as Record<string, unknown>
  // Payload v3 nyimpen url absolut di field `url`
  // Contoh: http://localhost:3000/api/media/file/image.png
  // Kita pake url dari record dulu, baru fallback ke filename
  const storedUrl =
    typeof rec.url === 'string'
      ? rec.url
      : null

  if (storedUrl) {
    try {
      const parsed = new URL(storedUrl)
      // Kalau localhost/127.0.0.1, ambil pathnya aja (biar work di domain manapun)
      if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
        return parsed.pathname + parsed.search
      }
    } catch {
      /* ignore invalid URL */
    }
    return storedUrl
  }

  // Fallback: construct dari filename
  const baseUrl = process.env.NEXT_PUBLIC_MEDIA_URL || '/media'
  const filename =
    typeof rec.filename === 'string'
      ? rec.filename
      : null

  if (!filename) return '/og-image.jpg'
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
