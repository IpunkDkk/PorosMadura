import { NextRequest, NextResponse } from 'next/server'
import { getAdForPlacement } from '@/lib/ads'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const placement = searchParams.get('placement')

  if (!placement) {
    return NextResponse.json(
      { error: 'Parameter placement wajib diisi' },
      { status: 400 },
    )
  }

  const result = await getAdForPlacement(placement)

  return NextResponse.json(result, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
    },
  })
}
