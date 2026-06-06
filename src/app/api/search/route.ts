import { searchPosts } from '@/lib/search'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') || ''
  const category = searchParams.get('category') || undefined
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')

  if (!q.trim()) {
    return NextResponse.json({ items: [], total: 0, page: 1, limit })
  }

  const results = await searchPosts(q, { category, page, limit })
  return NextResponse.json(results, {
    headers: { 'Cache-Control': 'public, max-age=60' },
  })
}
