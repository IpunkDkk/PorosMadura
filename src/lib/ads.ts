import type { BasePayload } from 'payload'
import { getPayloadClient } from './payload'
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

  const payload = await getPayloadClient()

  // Cari slot dulu untuk dapat ID
  const slotResult = await payload.find({
    collection: 'ad-slots',
    limit: 1,
    where: { placement: { equals: placement } },
    depth: 0,
  })

  if (!slotResult.docs[0]) {
    const emptyResult: EmptyAdResult = { type: 'empty', placement }
    await setCache(cacheKey, JSON.stringify(emptyResult), 300)
    return emptyResult
  }

  const slot = slotResult.docs[0] as Record<string, unknown>
  const slotId = slot.id

  // Query ads berdasarkan slot ID (relationship)
  const result = await payload.find({
    collection: 'ads',
    limit: 1,
    where: {
      placement: { equals: slotId },
      status: { equals: 'active' },
      startDate: { less_than_equal: new Date().toISOString() },
      endDate: { greater_than_equal: new Date().toISOString() },
    },
    sort: '-priority',
    depth: 1,
  })

  if (result.docs.length > 0) {
    const ad = result.docs[0] as Record<string, unknown>
    const adResult: ManualAdResult = {
      type: 'manual',
      id: ad.id as number | string,
      title: String(ad.title || ''),
      imageDesktop: (ad.imageDesktop as Record<string, unknown>) || null,
      imageMobile: (ad.imageMobile as Record<string, unknown>) || null,
      targetUrl: `/ads/click/${ad.id as string}`,
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
