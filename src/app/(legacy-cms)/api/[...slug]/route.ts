import { NextResponse } from 'next/server'

function disabledLegacyCmsApi() {
  return NextResponse.json(
    { error: 'Legacy CMS API disabled. Use the custom CMS routes.' },
    { status: 410 },
  )
}

export const GET = disabledLegacyCmsApi
export const POST = disabledLegacyCmsApi
export const DELETE = disabledLegacyCmsApi
export const PATCH = disabledLegacyCmsApi
export const PUT = disabledLegacyCmsApi
export const OPTIONS = disabledLegacyCmsApi
