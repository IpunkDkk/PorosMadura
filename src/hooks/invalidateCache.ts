import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { invalidateCache } from '@/lib/cache'

export const invalidatePostCache: CollectionAfterChangeHook = async ({ doc }) => {
  const d = doc as Record<string, unknown>
  if (d.slug) await invalidateCache(`post:${d.slug as string}`)
  await invalidateCache('homepage')
  await invalidateCache('popular-posts')
  await invalidateCache('breaking-news')
  await invalidateCache('featured-posts')
  return doc
}

export const invalidateCategoryCache: CollectionAfterChangeHook = async ({ doc }) => {
  await invalidateCache('homepage')
  return doc
}

export const invalidateTagCache: CollectionAfterChangeHook = async ({ doc }) => {
  await invalidateCache('homepage')
  return doc
}

export const invalidateAdCache: CollectionAfterChangeHook & CollectionAfterDeleteHook = async ({ doc }) => {
  const d = doc as Record<string, unknown>
  const placement = typeof d.placement === 'object' && d.placement
    ? String((d.placement as Record<string, unknown>).placement || '')
    : String(d.placement || '')
  if (placement) await invalidateCache(`ads:${placement}`)
  return doc
}
