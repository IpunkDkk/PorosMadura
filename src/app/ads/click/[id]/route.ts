import { NextRequest, NextResponse } from 'next/server'
import { eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import { adEvents, ads } from '@/db/schema'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const adId = parseInt(id, 10)
  if (!Number.isFinite(adId)) {
    return NextResponse.redirect(new URL('/', _request.url))
  }

  try {
    const ad = await db.query.ads.findFirst({ where: eq(ads.id, adId) })
    if (!ad) {
      return NextResponse.redirect(new URL('/', _request.url))
    }

    await db.update(ads)
      .set({ clicksCount: sql`${ads.clicksCount} + 1`, updatedAt: new Date() })
      .where(eq(ads.id, adId))

    await db.insert(adEvents).values({
      adId,
      eventType: 'click',
      placement: ad.placement,
      pageUrl: '',
      userAgent: _request.headers.get('user-agent') || '',
      ipHash: _request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null,
    })

    const targetUrl = ad.targetUrl || '/'
    return NextResponse.redirect(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`)
  } catch {
    return NextResponse.redirect(new URL('/', _request.url))
  }
}
