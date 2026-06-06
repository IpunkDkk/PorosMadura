import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

export const syncPostToSearch: CollectionAfterChangeHook = async ({ context, doc, operation }) => {
  if (context?.skipSearchSync) return doc

  const d = doc as Record<string, unknown>
  const shouldIndex = d.status === 'published' &&
    d.publishedAt &&
    new Date(d.publishedAt as string) <= new Date() &&
    d.allowIndex !== false

  if (shouldIndex) {
    const { indexPost } = await import('@/lib/search')
    await indexPost(d)
  } else if (operation === 'update' && d.status !== 'published') {
    const { removePostFromIndex } = await import('@/lib/search')
    await removePostFromIndex(d.id as string)
  }
  return doc
}

export const removePostFromSearch: CollectionAfterDeleteHook = async ({ context, doc }) => {
  if (context?.skipSearchSync) return doc

  const { removePostFromIndex } = await import('@/lib/search')
  await removePostFromIndex((doc as Record<string, unknown>).id as string)
}
