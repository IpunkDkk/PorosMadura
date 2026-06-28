import { NextRequest, NextResponse } from 'next/server'
import { enqueueAiNewsJob } from '@/lib/ai-news-jobs'
import { getCmsSession } from '@/lib/cms-auth'
import type { AiNewsTaxonomyOption } from '@/lib/ai-news'

export const dynamic = 'force-dynamic'

function taxonomyOptions(value: unknown): AiNewsTaxonomyOption[] {
  if (!Array.isArray(value)) return []
  const options: AiNewsTaxonomyOption[] = []

  for (const item of value) {
      if (!item || typeof item !== 'object') continue
      const record = item as Record<string, unknown>
      const name = typeof record.name === 'string' ? record.name.trim() : ''
      if (!name) continue
      const id = Number(record.id)
      options.push({
        id: Number.isFinite(id) ? id : undefined,
        name: name.slice(0, 80),
      })
      if (options.length >= 80) break
  }

  return options
}

export async function POST(request: NextRequest) {
  const session = await getCmsSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!['admin', 'editor', 'author'].includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const articleUrl = typeof body?.articleUrl === 'string' ? body.articleUrl.trim() : ''
  const importImage = body?.importImage === true
  const categories = taxonomyOptions(body?.categories)
  const tags = taxonomyOptions(body?.tags)
  if (!articleUrl) {
    return NextResponse.json({ error: 'URL artikel wajib diisi' }, { status: 400 })
  }
  if (articleUrl.length > 2048) {
    return NextResponse.json({ error: 'URL artikel terlalu panjang' }, { status: 400 })
  }

  try {
    return NextResponse.json({
      success: true,
      jobId: await enqueueAiNewsJob(articleUrl, { importImage, categories, tags }),
    })
  } catch (error) {
    console.error('AI news generation failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Gagal generate artikel AI' },
      { status: 500 },
    )
  }
}
