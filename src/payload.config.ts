import { buildConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { postgresAdapter } from '@payloadcms/db-postgres'
import sharp from 'sharp'
import { Users } from './collections/Users'
import { Authors } from './collections/Authors'
import { Posts } from './collections/Posts'
import { Categories } from './collections/Categories'
import { Tags } from './collections/Tags'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Redirects } from './collections/Redirects'
import { Settings } from './collections/Settings'

export default buildConfig({
  admin: {
    user: Users.slug,
    components: {
      beforeDashboard: ['@/components/admin/PorosAdminDashboard'],
      beforeLogin: ['@/components/admin/PorosLoginHeader'],
      graphics: {
        Icon: '@/components/admin/PorosAdminIcon',
        Logo: '@/components/admin/PorosAdminLogo',
      },
    },
    meta: {
      titleSuffix: '| PorosMadura CMS',
      icons: {
        icon: '/favicon.ico',
      },
      openGraph: {
        images: '/og-image.jpg',
      },
    },
  },
  editor: lexicalEditor({}),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI!,
    },
  }),
  collections: [
    Users,
    Authors,
    Posts,
    Categories,
    Tags,
    Media,
    Pages,
    Redirects,
  ],
  globals: [Settings],
  sharp,
  secret: process.env.PAYLOAD_SECRET!,
  serverURL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  typescript: {
    autoGenerate: false,
  },
  cors: [
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    ...(process.env.CORS_EXTRA_ORIGINS
      ? process.env.CORS_EXTRA_ORIGINS.split(',').map((s) => s.trim())
      : []),
  ],
  csrf: [
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    ...(process.env.CORS_EXTRA_ORIGINS
      ? process.env.CORS_EXTRA_ORIGINS.split(',').map((s) => s.trim())
      : []),
  ],
})
