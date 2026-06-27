import { NextRequest, NextResponse } from 'next/server'
import { enqueueAiNewsJob } from '@/lib/ai-news-jobs'
import { getCmsSession } from '@/lib/cms-auth'

export const dynamic = 'force-dynamic'

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
  if (!articleUrl) {
    return NextResponse.json({ error: 'URL artikel wajib diisi' }, { status: 400 })
  }
  if (articleUrl.length > 2048) {
    return NextResponse.json({ error: 'URL artikel terlalu panjang' }, { status: 400 })
  }

  try {
    return NextResponse.json({
      success: true,
      jobId: await enqueueAiNewsJob(articleUrl, { importImage }),
    })
  } catch (error) {
    console.error('AI news generation failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Gagal generate artikel AI' },
      { status: 500 },
    )
  }
}
