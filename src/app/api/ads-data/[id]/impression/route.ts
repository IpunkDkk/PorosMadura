import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const payload = await getPayloadClient()

  try {
    const ad = await payload.findByID({
      collection: 'ads',
      id,
      depth: 1,
    })

    if (!ad) {
      return NextResponse.json({ error: 'Iklan tidak ditemukan' }, { status: 404 })
    }

    const adRecord = ad as Record<string, unknown>
    const currentImpressions = typeof adRecord.impressionsCount === 'number'
      ? adRecord.impressionsCount
      : 0

    await payload.update({
      collection: 'ads',
      id,
      data: { impressionsCount: currentImpressions + 1 },
    })

    await payload.create({
      collection: 'ad-events',
      overrideAccess: true,
      data: {
        ad: Number(id),
        eventType: 'impression',
        placement: body.placement || (typeof adRecord.placement === 'object' && adRecord.placement ? String((adRecord.placement as Record<string, unknown>).placement || '') : ''),
        pageUrl: body.pageUrl || '',
        userAgent: request.headers.get('user-agent') || '',
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Impression error:', err)
    return NextResponse.json({ error: 'Gagal mencatat impression' }, { status: 500 })
  }
}
