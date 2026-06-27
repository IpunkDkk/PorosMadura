import { sql, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { posts } from '@/db/schema'

type Params = {
  params: Promise<{ id: string }>
}

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params
  const postId = Number(id)

  if (!Number.isInteger(postId) || postId <= 0) {
    return NextResponse.json({ error: 'Invalid post id' }, { status: 400 })
  }

  await db
    .update(posts)
    .set({
      views: sql`${posts.views} + 1`,
    })
    .where(eq(posts.id, postId))

  return NextResponse.json(
    { ok: true },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  )
}
