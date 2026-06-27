import { and, desc, eq, gte, lte } from 'drizzle-orm'
import { db } from '@/db'
import { ads, adSlots } from '@/db/schema'
import { getCached, setCache } from './cache'
import { CacheKeys } from './cache'

export interface ManualAdResult {
  type: 'manual'
  id: number | string
  title: string
  imageDesktop: Record<string, unknown> | null
  imageMobile: Record<string, unknown> | null
  targetUrl: string
  placement: string
}

export interface FallbackAdResult {
  type: 'fallback'
  provider: string
  placement: string
  code: string
}

export interface EmptyAdResult {
  type: 'empty'
  placement: string
}

export type AdResult = ManualAdResult | FallbackAdResult | EmptyAdResult

export async function getAdForPlacement(placement: string): Promise<AdResult> {
  const cacheKey = CacheKeys.ads(placement)
  const cached = await getCached(cacheKey)
  if (cached) {
    try { return JSON.parse(cached) as AdResult } catch { /* ignore */ }
  }

  const slot = await db.query.adSlots.findFirst({
    where: and(eq(adSlots.placement, placement), eq(adSlots.isActive, true)),
  }).catch(() => null)

  if (!slot) {
    const emptyResult: EmptyAdResult = { type: 'empty', placement }
    await setCache(cacheKey, JSON.stringify(emptyResult), 300)
    return emptyResult
  }

  const activeAd = await db.query.ads.findFirst({
    where: and(
      eq(ads.placement, slot.placement),
      eq(ads.status, 'active'),
      lte(ads.startDate, new Date()),
      gte(ads.endDate, new Date()),
    ),
    orderBy: desc(ads.priority),
    with: {
      imageDesktop: true,
      imageMobile: true,
    },
  }).catch(() => null)

  if (activeAd) {
    const adResult: ManualAdResult = {
      type: 'manual',
      id: activeAd.id,
      title: activeAd.title,
      imageDesktop: activeAd.imageDesktop || null,
      imageMobile: activeAd.imageMobile || null,
      targetUrl: `/ads/click/${activeAd.id}`,
      placement,
    }
    await setCache(cacheKey, JSON.stringify(adResult), 300)
    return adResult
  }

  // Fallback AdSense
  if (
    slot.isActive &&
    slot.isFallbackActive &&
    slot.fallbackCode &&
    String(slot.fallbackCode).length > 0
  ) {
    const fallbackResult: FallbackAdResult = {
      type: 'fallback',
      provider: String(slot.fallbackType || 'adsense'),
      placement,
      code: String(slot.fallbackCode),
    }
    await setCache(cacheKey, JSON.stringify(fallbackResult), 300)
    return fallbackResult
  }

  const emptyResult: EmptyAdResult = { type: 'empty', placement }
  await setCache(cacheKey, JSON.stringify(emptyResult), 300)
  return emptyResult
}
