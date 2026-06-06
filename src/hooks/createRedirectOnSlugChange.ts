import type { CollectionAfterChangeHook } from 'payload'

export const createRedirectOnSlugChange: CollectionAfterChangeHook = async ({
  collection,
  doc,
  previousDoc,
  req,
  operation,
}) => {
  if (operation === 'update' && previousDoc?.slug && doc?.slug) {
    if (previousDoc.slug !== doc.slug) {
      const collectionSlug = collection?.slug || 'unknown'
      let fromPath = ''
      let toPath = ''

      if (collectionSlug === 'posts') {
        const prevCategorySlug =
          typeof previousDoc.category === 'object' ? previousDoc.category?.slug : previousDoc.category || ':category'
        const newCategorySlug =
          typeof doc.category === 'object' ? doc.category?.slug : doc.category || ':category'
        fromPath = `/${prevCategorySlug}/${previousDoc.slug}`
        toPath = `/${newCategorySlug}/${doc.slug}`
      } else {
        fromPath = `/${previousDoc.slug}`
        toPath = `/${doc.slug}`
      }

      try {
        await req.payload.create({
          collection: 'redirects',
          data: {
            from: fromPath,
            to: toPath,
            statusCode: '301',
            isActive: true,
          },
          req,
        })
      } catch (err) {
        console.error('Failed to create redirect:', err)
      }
    }
  }
  return doc
}
