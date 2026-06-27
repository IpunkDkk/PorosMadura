import { randomUUID } from 'crypto'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { db } from '@/db'
import { media } from '@/db/schema'

const maxRemoteImageBytes = 10 * 1024 * 1024
const mediaSizes = {
  thumbnail: { width: 320 },
  card: { width: 640 },
  hero: { width: 1280 },
  og: { width: 1200, height: 630 },
}

function extensionFromContentType(contentType: string, imageUrl: string) {
  if (contentType.includes('png')) return '.png'
  if (contentType.includes('webp')) return '.webp'
  if (contentType.includes('gif')) return '.gif'

  const ext = path.extname(new URL(imageUrl).pathname).toLowerCase().replace(/[^a-z0-9.]/g, '')
  return ext || '.jpg'
}

export async function importRemoteImageToMedia(input: {
  imageUrl: string
  alt: string
  caption?: string
  credit?: string
}) {
  const response = await fetch(input.imageUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
      Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    },
    signal: AbortSignal.timeout(15000),
  })

  if (!response.ok) {
    throw new Error(`Gagal mengunduh gambar sumber (${response.status})`)
  }

  const contentType = response.headers.get('content-type') || 'image/jpeg'
  if (!contentType.startsWith('image/')) {
    throw new Error('URL gambar sumber tidak mengembalikan file gambar')
  }

  const contentLength = Number(response.headers.get('content-length') || 0)
  if (contentLength > maxRemoteImageBytes) {
    throw new Error('Ukuran gambar sumber melebihi 10MB')
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.length > maxRemoteImageBytes) {
    throw new Error('Ukuran gambar sumber melebihi 10MB')
  }

  const image = sharp(buffer, { failOn: 'none' }).rotate()
  const metadata = await image.metadata()
  if (!metadata.width || !metadata.height) {
    throw new Error('Gambar sumber tidak valid')
  }

  const ext = extensionFromContentType(contentType, input.imageUrl)
  const filename = `${Date.now()}-${randomUUID()}${ext}`
  const basename = path.basename(filename, ext)
  const mediaDir = path.join(process.cwd(), 'public', 'media')

  await mkdir(mediaDir, { recursive: true })
  await writeFile(path.join(mediaDir, filename), buffer)

  const thumbnailFilename = `${basename}-thumbnail.webp`
  const cardFilename = `${basename}-card.webp`
  const heroFilename = `${basename}-hero.webp`
  const ogFilename = `${basename}-og.webp`

  const [thumbnailInfo, cardInfo, heroInfo, ogInfo] = await Promise.all([
    image.clone().resize({ width: mediaSizes.thumbnail.width, withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(mediaDir, thumbnailFilename)),
    image.clone().resize({ width: mediaSizes.card.width, withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(mediaDir, cardFilename)),
    image.clone().resize({ width: mediaSizes.hero.width, withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(mediaDir, heroFilename)),
    image.clone().resize({ width: mediaSizes.og.width, height: mediaSizes.og.height, fit: 'cover', withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(mediaDir, ogFilename)),
  ])

  const [created] = await db.insert(media).values({
    alt: input.alt,
    caption: input.caption || null,
    credit: input.credit || null,
    folder: '/',
    filename,
    mimeType: contentType,
    filesize: buffer.length,
    width: metadata.width,
    height: metadata.height,
    url: `/media/${filename}`,
    thumbnailURL: `/media/${thumbnailFilename}`,
    sizesThumbnailUrl: `/media/${thumbnailFilename}`,
    sizesThumbnailWidth: thumbnailInfo.width,
    sizesThumbnailHeight: thumbnailInfo.height,
    sizesThumbnailMimeType: 'image/webp',
    sizesThumbnailFilesize: thumbnailInfo.size,
    sizesThumbnailFilename: thumbnailFilename,
    sizesCardUrl: `/media/${cardFilename}`,
    sizesCardWidth: cardInfo.width,
    sizesCardHeight: cardInfo.height,
    sizesCardMimeType: 'image/webp',
    sizesCardFilesize: cardInfo.size,
    sizesCardFilename: cardFilename,
    sizesHeroUrl: `/media/${heroFilename}`,
    sizesHeroWidth: heroInfo.width,
    sizesHeroHeight: heroInfo.height,
    sizesHeroMimeType: 'image/webp',
    sizesHeroFilesize: heroInfo.size,
    sizesHeroFilename: heroFilename,
    sizesOgUrl: `/media/${ogFilename}`,
    sizesOgWidth: ogInfo.width,
    sizesOgHeight: ogInfo.height,
    sizesOgMimeType: 'image/webp',
    sizesOgFilesize: ogInfo.size,
    sizesOgFilename: ogFilename,
    updatedAt: new Date(),
  }).returning({
    id: media.id,
    alt: media.alt,
    filename: media.filename,
    url: media.url,
    sizesThumbnailUrl: media.sizesThumbnailUrl,
    sizesCardUrl: media.sizesCardUrl,
    sizesOgUrl: media.sizesOgUrl,
  })

  return created
}
