import type { CollectionAfterChangeHook } from 'payload'
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

export const invalidateAdCache: CollectionAfterChangeHook = async ({ doc }) => {
  const d = doc as Record<string, unknown>
  if (d.placement) await invalidateCache(`ads:${d.placement as string}`)
  return doc
}
