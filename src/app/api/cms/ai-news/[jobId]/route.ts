import { NextRequest, NextResponse } from 'next/server'
import { getAiNewsJob } from '@/lib/ai-news-jobs'
import { getCmsSession } from '@/lib/cms-auth'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const session = await getCmsSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!['admin', 'editor', 'author'].includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { jobId } = await params
  const job = await getAiNewsJob(jobId)
  if (!job) {
    return NextResponse.json({ error: 'Job tidak ditemukan atau sudah kedaluwarsa' }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    job,
  })
}
