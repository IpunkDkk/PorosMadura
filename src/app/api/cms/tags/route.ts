import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { tags } from '@/db/schema'
import { getCmsSession } from '@/lib/cms-auth'

export const dynamic = 'force-dynamic'

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

async function uniqueTagSlug(baseSlug: string) {
  const base = slugify(baseSlug) || `tag-${Date.now()}`
  let candidate = base
  let suffix = 2

  while (true) {
    const existing = await db.query.tags.findFirst({
      where: eq(tags.slug, candidate),
    })
    if (!existing) return candidate
    candidate = `${base}-${suffix}`
    suffix += 1
  }
}

export async function POST(request: NextRequest) {
  const session = await getCmsSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!['admin', 'editor'].includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 80) : ''
  if (!name) {
    return NextResponse.json({ error: 'Nama tag wajib diisi' }, { status: 400 })
  }

  const existing = await db.query.tags.findFirst({
    where: eq(tags.name, name),
  })
  if (existing) {
    return NextResponse.json({ success: true, tag: existing })
  }

  const [tag] = await db.insert(tags).values({
    name,
    slug: await uniqueTagSlug(name),
    isActive: true,
    updatedAt: new Date(),
  }).returning({
    id: tags.id,
    name: tags.name,
    slug: tags.slug,
  })

  return NextResponse.json({ success: true, tag })
}
