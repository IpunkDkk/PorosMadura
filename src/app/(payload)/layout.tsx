import type { ServerFunctionClient } from 'payload'
import '@payloadcms/next/css'
import './custom.scss'
import config from '@/payload.config'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import { importMap } from './admin/importMap.js'

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootLayout config={config as any} importMap={importMap as any} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  )
}
