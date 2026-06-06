import { RootPage } from '@payloadcms/next/views'
import config from '@/payload.config'
import { importMap } from '../importMap.js'

export default async function AdminPageHandler({
  params,
  searchParams,
}: {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] }>
}) {
  return RootPage({
    config: config as any,
    importMap: importMap as any,
    params: params as any,
    searchParams: searchParams as any,
  })
}
