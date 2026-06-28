import { NextRequest, NextResponse } from 'next/server'
import { checkAllDueSourceLinks } from '@/lib/source-link-check'

export const dynamic = 'force-dynamic'

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV !== 'production'

  const authorization = request.headers.get('authorization')
  const headerSecret = request.headers.get('x-cron-secret')
  return authorization === `Bearer ${secret}` || headerSecret === secret
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await checkAllDueSourceLinks({
    limit: Number(process.env.SOURCE_LINK_CHECK_LIMIT || 50),
    maxAgeHours: Number(process.env.SOURCE_LINK_CHECK_MAX_AGE_HOURS || 24),
    detectContentChanges: process.env.SOURCE_LINK_CHECK_DETECT_CHANGES !== 'false',
  })

  return NextResponse.json(result)
}
