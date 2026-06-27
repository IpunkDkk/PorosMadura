import { and, eq, lte } from 'drizzle-orm'
import { db } from './index'
import { posts } from './schema'
import { clearPostsIndex, ensurePostsIndex, indexPosts } from '../lib/search'

async function run() {
  const enabled = await ensurePostsIndex()
  if (!enabled) {
    console.log('Meilisearch disabled or unavailable; skipped reindex.')
    return
  }

  const rows = await db.query.posts.findMany({
    where: and(
      eq(posts.status, 'published'),
      lte(posts.publishedAt, new Date()),
    ),
    with: {
      featuredImage: true,
      category: true,
      author: true,
      postTags: {
        with: {
          tag: true,
        },
      },
    },
  })

  const documents = rows.map((post) => ({
    ...post,
    tags: post.postTags.map((item) => item.tag).filter(Boolean),
  }))

  await clearPostsIndex()
  await indexPosts(documents as unknown as Record<string, unknown>[])

  console.log(`Reindexed ${documents.length} published posts.`)
}

run()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
