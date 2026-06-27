import { readFile, stat } from 'fs/promises'
import path from 'path'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

const contentTypes: Record<string, string> = {
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params
  const safeFilename = path.basename(filename)
  if (!safeFilename || safeFilename !== filename) notFound()

  const filePath = path.join(process.cwd(), 'public', 'media', safeFilename)

  try {
    const [file, info] = await Promise.all([
      readFile(filePath),
      stat(filePath),
    ])

    return new Response(file, {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': String(info.size),
        'Content-Type': contentTypes[path.extname(safeFilename).toLowerCase()] || 'application/octet-stream',
      },
    })
  } catch {
    notFound()
  }
}
