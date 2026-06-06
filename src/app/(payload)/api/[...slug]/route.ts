import { REST_GET, REST_POST, REST_DELETE, REST_PATCH, REST_PUT, REST_OPTIONS } from '@payloadcms/next/routes'
import config from '@/payload.config'

type RouteContext = { params: Promise<{ slug?: string[] }> }

export const GET = (request: Request, ctx: RouteContext) => REST_GET(config)(request, ctx as any)
export const POST = (request: Request, ctx: RouteContext) => REST_POST(config)(request, ctx as any)
export const DELETE = (request: Request, ctx: RouteContext) => REST_DELETE(config)(request, ctx as any)
export const PATCH = (request: Request, ctx: RouteContext) => REST_PATCH(config)(request, ctx as any)
export const PUT = (request: Request, ctx: RouteContext) => REST_PUT(config)(request, ctx as any)
export const OPTIONS = (request: Request, ctx: RouteContext) => REST_OPTIONS(config)(request, ctx as any)
