import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const payload = await getPayloadClient()

  try {
    const ad = await payload.findByID({
      collection: 'ads',
      id,
      depth: 0,
    })

    if (!ad) {
      return NextResponse.redirect(new URL('/', _request.url))
    }

    const adRecord = ad as Record<string, unknown>
    const currentClicks = typeof adRecord.clicksCount === 'number'
      ? adRecord.clicksCount
      : 0

    await payload.update({
      collection: 'ads',
      id,
      data: { clicksCount: currentClicks + 1 },
    })

    await payload.create({
      collection: 'ad-events',
      data: {
        ad: id,
        eventType: 'click',
        placement: adRecord.placement || '',
        pageUrl: '',
        userAgent: '',
      },
    })

    const targetUrl = String(adRecord.targetUrl || '/')
    return NextResponse.redirect(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`)
  } catch {
    return NextResponse.redirect(new URL('/', _request.url))
  }
}
