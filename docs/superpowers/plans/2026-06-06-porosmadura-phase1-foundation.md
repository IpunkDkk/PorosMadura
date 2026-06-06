# PorosMadura Phase 1 — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan.

**Goal:** Initialize project with Next.js 15 + Payload CMS 3 + Better Auth + Docker Compose + Branding + 9 Collections

---

### Task 1.1: Initialize Next.js 15 Project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `src/css/globals.css`
- Create: `.env.example`

- [ ] **Step 1: Create package.json with all dependencies**

```json
{
  "name": "porosmadura",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^15.2.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "payload": "^3.0.0",
    "@payloadcms/next": "^3.0.0",
    "@payloadcms/richtext-lexical": "^3.0.0",
    "@payloadcms/plugin-seo": "^3.0.0",
    "better-auth": "^1.2.0",
    "lucide-react": "^0.400.0",
    "clsx": "^2.1.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.7.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "postcss": "^8.4.0"
  }
}
```

- [ ] **Step 2: Create TypeScript config**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create Next.js config with Payload integration**

```ts
import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: false,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
}

export default withPayload(nextConfig)
```

- [ ] **Step 4: Create globals.css with Tailwind v4 + brand tokens**

```css
@import "tailwindcss";

@theme {
  /* Primary colors */
  --color-poros-navy: #0C2A51;
  --color-poros-red: #C61E21;
  --color-poros-white: #F6F6F6;

  /* Secondary colors */
  --color-slate-blue: #627389;
  --color-soft-slate: #95A0AE;
  --color-soft-red: #CF5D61;

  /* Neutral colors */
  --color-text-primary: #111827;
  --color-text-secondary: #4B5563;
  --color-border-light: #E5E7EB;
  --color-surface: #FFFFFF;
  --color-page-bg: #F9FAFB;

  /* Fonts */
  --font-heading: 'Merriweather', serif;
  --font-body: 'Inter', sans-serif;
}

@layer base {
  body {
    @apply bg-page-bg text-text-primary font-body antialiased;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-heading;
  }
}
```

- [ ] **Step 5: Create .env.example**

```env
# Database
DATABASE_URI=postgres://porosmadura:porosmadura@localhost:5432/porosmadura

# Payload
PAYLOAD_SECRET=your-payload-secret-key-change-in-production

# Better Auth
BETTER_AUTH_SECRET=your-better-auth-secret-change-in-production
BETTER_AUTH_URL=http://localhost:3000

# Storage (local)
STORAGE_DRIVER=local
NEXT_PUBLIC_MEDIA_URL=/media

# Redis (optional for now)
REDIS_URL=redis://localhost:6379

# Meilisearch (optional for now)
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=master-key

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- [ ] **Step 6: Install dependencies and verify**

Run: `npm install`
Expected: All packages installed without errors

Run: `npx next --version`
Expected: Shows Next.js version at http://localhost:3000

### Task 1.2: Setup Payload CMS 3

**Files:**
- Create: `src/payload.config.ts`
- Create: `src/app/(admin)/admin/[[...segments]]/page.tsx`
- Create: `src/app/(admin)/admin/[[...segments]]/not-found.tsx`
- Modify: `src/app/(public)/layout.tsx`

- [ ] **Step 1: Create payload.config.ts**

```ts
import { buildConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { postgresAdapter } from '@payloadcms/db-postgres'
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
    meta: {
      titleSuffix: '| PorosMadura CMS',
      favicon: '/favicon.ico',
      ogImage: '/og-image.jpg',
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
  secret: process.env.PAYLOAD_SECRET!,
  typescript: {
    autoGenerate: true,
    outputFile: 'src/payload-types.ts',
  },
  cors: [process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'],
  csrf: [process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'],
})
```

- [ ] **Step 2: Create Payload Admin route handler**

```ts
import { RootAdminLayout, AdminPage } from '@payloadcms/next/views'
import type { AdminViewServerProps } from 'payload'
import { headers as getHeaders } from 'next/headers'
import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'

// This is the catch-all route for Payload Admin
export default async function AdminPageHandler({ params }: { params: Promise<{ segments: string[] }> }) {
  const segments = (await params).segments || []
  const headers = await getHeaders()
  
  return AdminPage({
    initPageReq: {
      payloadConfig: config,
      headers,
    },
    routeSegments: segments,
  })
}

// Layout for admin area
export async function generateLayout({ params }: { params: Promise<{ segments: string[] }> }) {
  const segments = (await params).segments || []
  const headers = await getHeaders()

  return RootAdminLayout({
    initPageReq: {
      payloadConfig: config,
      headers,
    },
    routeSegments: segments,
  })
}
```

- [ ] **Step 3: Create Payload admin not-found page**

```ts
import { NotFoundPage } from '@payloadcms/next/views'
import type { AdminViewServerProps } from 'payload'
import { headers as getHeaders } from 'next/headers'
import config from '@/payload.config'

export default async function AdminNotFound() {
  const headers = await getHeaders()
  return NotFoundPage({
    initPageReq: {
      payloadConfig: config,
      headers,
    },
    routeSegments: [],
  })
}
```

- [ ] **Step 4: Create placeholder public layout**

```tsx
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

- [ ] **Step 5: Add PostCSS config**

```ts
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

- [ ] **Step 6: Verify Payload starts**

Run: `cp .env.example .env` then edit `.env` with real values

Run: `npx next dev`
Expected: Payload admin accessible at http://localhost:3000/admin

### Task 1.3: Setup Docker Compose

**Files:**
- Create: `docker-compose.yml`
- Create: `Dockerfile`
- Create: `.dockerignore`

- [ ] **Step 1: Create docker-compose.yml**

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: porosmadura
      POSTGRES_USER: porosmadura
      POSTGRES_PASSWORD: porosmadura
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U porosmadura"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  meilisearch:
    image: getmeili/meilisearch:v1.10
    ports:
      - "7700:7700"
    environment:
      MEILI_MASTER_KEY: master-key
      MEILI_NO_ANALYTICS: "true"
    volumes:
      - meilidata:/meili_data

  app:
    build: .
    ports:
      - "3000:3000"
    env_file: .env
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./public/media:/app/public/media

volumes:
  pgdata:
  redisdata:
  meilidata:
```

- [ ] **Step 2: Create Dockerfile**

```dockerfile
FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production

FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir -p /app/public/media && \
    chown -R nextjs:nodejs /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/package.json ./package.json
USER nextjs
EXPOSE 3000
CMD ["npm", "start"]
```

- [ ] **Step 3: Create .dockerignore**

```
node_modules
.next
.git
.env
media
```

- [ ] **Step 4: Update .env for Docker compatibility**

Ensure `.env` has:
```env
DATABASE_URI=postgres://porosmadura:porosmadura@localhost:5432/porosmadura
# For Docker: DATABASE_URI=postgres://porosmadura:porosmadura@postgres:5432/porosmadura
```

- [ ] **Step 5: Start Docker services and verify**

Run: `docker compose up -d postgres`
Expected: PostgreSQL container running on port 5432

Run: `docker compose ps`
Expected: postgres service status "healthy"

### Task 1.4: Setup Better Auth

**Files:**
- Create: `src/auth/better-auth.ts`
- Create: `src/components/layout/AuthButton.tsx`
- Modify: `src/app/(admin)/login/page.tsx`
- Modify: `src/app/(public)/layout.tsx`

- [ ] **Step 1: Create Better Auth server config**

```ts
import { betterAuth } from 'better-auth'
import { nextCookies } from 'better-auth/next-js'
import { payloadAdapter } from 'better-auth/adapters/payload'

export const auth = betterAuth({
  database: payloadAdapter({
    // Will connect to Payload Users collection
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  plugins: [
    nextCookies(),
  ],
  socialProviders: {}, // Ready for future Google OAuth
})

export type Session = typeof auth.$Infer.Session
```

- [ ] **Step 2: Create custom admin login page**

```tsx
import { auth } from '@/auth/better-auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (session) {
    redirect('/admin')
  }

  return (
    <div className="min-h-screen bg-poros-navy flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="bg-poros-red text-white font-heading font-bold text-3xl w-10 h-10 flex items-center justify-center rounded">
                P
              </span>
              <h1 className="font-heading font-black text-2xl text-poros-navy">
                Poros<span className="text-poros-red">Madura</span>
              </h1>
            </div>
            <p className="text-sm text-gray-500 font-medium">CMS — Masuk ke Dashboard</p>
          </div>

          <form action="/api/auth/login" method="POST" className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poros-red focus:border-transparent outline-none"
                placeholder="admin@porosmadura.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poros-red focus:border-transparent outline-none"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-poros-red hover:bg-red-700 text-white font-bold py-2.5 rounded-lg transition-colors"
            >
              Masuk
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create Better Auth API route**

```ts
import { auth } from '@/auth/better-auth'
import { toNextJsHandler } from 'better-auth/next-js'

export const { GET, POST } = toNextJsHandler(auth.handler)
```

- [ ] **Step 4: Add PublicLayout with auth context**

```tsx
// src/app/(public)/layout.tsx
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  )
}
```

### Task 1.5: Branding Setup (Assets + Fonts + Layout)

**Files:**
- Create: `public/favicon.ico`
- Create: `public/og-image.jpg`
- Create: `public/logo.png`
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/Footer.tsx`
- Modify: `src/app/(public)/layout.tsx`

- [ ] **Step 1: Convert brand assets to web-optimized format**

Run: Install ImageMagick if not available, then:

```bash
# Create favicon (32x32)
convert img/logo-warna.jpeg -resize 32x32 public/favicon.ico

# Create OG Image (1200x630) from branding-cropped
cp img/branding-warna-cropped.jpeg public/og-image.jpg

# Create Apple Touch Icon (180x180)
convert img/logo-warna.jpeg -resize 180x180 public/apple-icon.png

# Create logo for header (use SVG text instead of raster)
```

Expected: Files created in `public/`

- [ ] **Step 2: Create Header component from sample design**

```tsx
'use client'

import { useState } from 'react'
import { Menu, Search, X } from 'lucide-react'

const categories = ['Nasional', 'Madura', 'Politik', 'Ekonomi', 'Olahraga', 'Teknologi', 'Lifestyle', 'Budaya', 'Viral']

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="w-full bg-poros-navy text-white">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-4">
          <div className="flex flex-col">
            <a href="/" className="flex items-center gap-1 group">
              <span className="bg-poros-red text-white font-heading font-bold text-2xl w-8 h-8 flex items-center justify-center rounded">
                P
              </span>
              <h1 className="font-heading font-black text-2xl tracking-tight">
                Poros<span className="font-normal text-white/90">Madura</span>
              </h1>
            </a>
            <span className="text-[10px] text-white/70 tracking-widest mt-0.5 uppercase hidden md:block font-medium">
              Berita Tepat, Fakta Kuat
            </span>
          </div>

          {/* Desktop */}
          <div className="hidden lg:flex items-center gap-6">
            <span className="text-sm text-white/80 font-medium">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <div className="h-4 w-px bg-white/20" />
            <button className="hover:text-poros-red transition-colors"><Search size={20} /></button>
          </div>

          {/* Mobile */}
          <div className="lg:hidden flex items-center gap-4">
            <button className="hover:text-poros-red"><Search size={22} /></button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white">
              {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 3: Create Footer component from sample design**

```tsx
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react'

const categories = ['Nasional', 'Madura', 'Politik', 'Ekonomi', 'Olahraga']
const footerLinks = [
  { title: 'Tentang Kami', href: '/tentang-kami' },
  { title: 'Susunan Redaksi', href: '/redaksi' },
  { title: 'Pedoman Media Siber', href: '/pedoman-media-siber' },
  { title: 'Disclaimer', href: '/disclaimer' },
  { title: 'Kebijakan Privasi', href: '/privacy-policy' },
]

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 pt-16 pb-8 mt-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <a href="/" className="flex items-center gap-1 mb-4">
              <span className="bg-poros-red text-white font-heading font-bold text-3xl w-10 h-10 flex items-center justify-center rounded-lg">P</span>
              <span className="font-heading font-black text-3xl tracking-tight text-poros-navy">
                Poros<span className="text-poros-red">Madura</span>
              </span>
            </a>
            <p className="text-sm text-gray-500 mb-4 font-heading italic font-medium">
              &ldquo;Berita Tepat, Fakta Kuat&rdquo;
            </p>
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              Platform berita digital terpercaya yang menyajikan informasi secara cepat, akurat, dan kredibel.
            </p>
          </div>

          {/* Kategori */}
          <div>
            <h4 className="font-black text-poros-navy text-lg mb-5 font-heading">Kategori Utama</h4>
            <ul className="space-y-3 text-sm text-gray-600 font-semibold">
              {categories.map((cat, idx) => (
                <li key={idx}>
                  <a href={`/category/${cat.toLowerCase()}`} className="hover:text-poros-red transition-colors">{cat}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Perusahaan */}
          <div>
            <h4 className="font-black text-poros-navy text-lg mb-5 font-heading">Perusahaan</h4>
            <ul className="space-y-3 text-sm text-gray-600 font-semibold">
              {footerLinks.map((link, idx) => (
                <li key={idx}>
                  <a href={link.href} className="hover:text-poros-red transition-colors">{link.title}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h4 className="font-black text-poros-navy text-lg mb-5 font-heading">Hubungi Kami</h4>
            <ul className="space-y-3 text-sm text-gray-600 font-medium">
              <li><span className="font-bold">Email:</span> redaksi@porosmadura.com</li>
              <li><span className="font-bold">Telepon:</span> (0324) 123456</li>
              <li className="mt-6 pt-6 border-t border-gray-200">
                <a href="/advertise" className="inline-flex items-center justify-center bg-poros-navy text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-poros-red transition-colors w-full">
                  Pasang Iklan / Advertise
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200 text-center flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500 font-medium">&copy; {new Date().getFullYear()} PorosMadura. Hak Cipta Dilindungi.</p>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 4: Add Google Fonts to public layout**

Add to `src/app/(public)/layout.tsx`:
```tsx
import { Merriweather, Inter } from 'next/font/google'

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-merriweather',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
})

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${merriweather.variable} ${inter.variable}`}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

- [ ] **Step 5: Verify branding**

Run: `npm run dev`
Expected: http://localhost:3000 shows Header with navy background, logo "P", tagline, and Footer




