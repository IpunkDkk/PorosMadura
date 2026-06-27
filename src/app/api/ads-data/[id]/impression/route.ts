import { NextRequest, NextResponse } from 'next/server'
import { eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import { adEvents, ads } from '@/db/schema'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const adId = parseInt(id, 10)
  if (!Number.isFinite(adId)) {
    return NextResponse.json({ error: 'ID iklan tidak valid' }, { status: 400 })
  }

  try {
    const ad = await db.query.ads.findFirst({ where: eq(ads.id, adId) })
    if (!ad) {
      return NextResponse.json({ error: 'Iklan tidak ditemukan' }, { status: 404 })
    }

    await db.update(ads)
      .set({ impressionsCount: sql`${ads.impressionsCount} + 1`, updatedAt: new Date() })
      .where(eq(ads.id, adId))

    await db.insert(adEvents).values({
      adId,
      eventType: 'impression',
      placement: typeof body.placement === 'string' ? body.placement : ad.placement,
      pageUrl: typeof body.pageUrl === 'string' ? body.pageUrl : '',
      userAgent: request.headers.get('user-agent') || '',
      ipHash: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Impression error:', err)
    return NextResponse.json({ error: 'Gagal mencatat impression' }, { status: 500 })
  }
}
