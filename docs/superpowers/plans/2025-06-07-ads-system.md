# Ads System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement hybrid ad system (manual ads + AdSense fallback) for PorosMadura news portal

**Architecture:** Payload CMS collections for admin management, custom Next.js API routes for public consumption, Redis caching per placement, React client component for rendering

**Tech Stack:** Next.js 15, Payload CMS 3, PostgreSQL, Redis, Tailwind CSS v4

---

### Task 1: Create AdSlots Collection

**Files:**
- Create: `src/collections/AdSlots.ts`

- [ ] **Step 1: Create the AdSlots collection**

```ts
import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrEditor, canReadAny } from '@/hooks/accessControl'

export const AdSlots: CollectionConfig = {
  slug: 'ad-slots',
  admin: {
    group: 'Iklan',
    useAsTitle: 'label',
    defaultColumns: ['placement', 'label', 'isActive', 'isFallbackActive'],
  },
  access: {
    create: isAdmin,
    read: canReadAny,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'placement',
      type: 'text',
      required: true,
      unique: true,
      label: 'Kode Placement',
    },
    {
      name: 'label',
      type: 'text',
      required: true,
      label: 'Nama Slot',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Deskripsi Lokasi',
    },
    {
      name: 'fallbackType',
      type: 'select',
      defaultValue: 'none',
      options: [
        { label: 'Tidak Ada', value: 'none' },
        { label: 'Google AdSense', value: 'adsense' },
      ],
      label: 'Jenis Fallback',
    },
    {
      name: 'fallbackCode',
      type: 'textarea',
      label: 'Kode AdSense / Ad Network',
    },
    {
      name: 'isFallbackActive',
      type: 'checkbox',
      defaultValue: false,
      label: 'Fallback Aktif',
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      label: 'Slot Aktif',
    },
  ],
}
```

- [ ] **Step 2: Commit**

```bash
git add src/collections/AdSlots.ts
git commit -m "feat: add AdSlots collection for ad placement config"
```

### Task 2: Create Ads Collection

**Files:**
- Create: `src/collections/Ads.ts`

- [ ] **Step 1: Create the Ads collection**

```ts
import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrEditor, isAdminOrEditorOrAuthor, canReadAny } from '@/hooks/accessControl'
import { invalidateAdCache } from '@/hooks/invalidateCache'

export const Ads: CollectionConfig = {
  slug: 'ads',
  admin: {
    group: 'Iklan',
    useAsTitle: 'title',
    defaultColumns: ['title', 'advertiserName', 'placement', 'startDate', 'endDate', 'status', 'impressionsCount', 'clicksCount'],
  },
  access: {
    create: isAdminOrEditor,
    read: canReadAny,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [invalidateAdCache],
    afterDelete: [invalidateAdCache],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Nama Iklan',
    },
    {
      name: 'advertiserName',
      type: 'text',
      label: 'Nama Pengiklan',
    },
    {
      name: 'advertiserContact',
      type: 'text',
      label: 'Kontak Pengiklan',
    },
    {
      name: 'imageDesktop',
      type: 'upload',
      relationTo: 'media',
      label: 'Banner Desktop',
    },
    {
      name: 'imageMobile',
      type: 'upload',
      relationTo: 'media',
      label: 'Banner Mobile',
    },
    {
      name: 'targetUrl',
      type: 'text',
      required: true,
      label: 'Link Tujuan',
    },
    {
      name: 'placement',
      type: 'text',
      required: true,
      label: 'Posisi (Placement)',
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
      label: 'Tanggal Mulai',
    },
    {
      name: 'endDate',
      type: 'date',
      required: true,
      label: 'Tanggal Selesai',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Aktif', value: 'active' },
        { label: 'Nonaktif', value: 'inactive' },
      ],
      label: 'Status',
    },
    {
      name: 'priority',
      type: 'number',
      defaultValue: 0,
      label: 'Prioritas (semakin besar semakin tinggi)',
    },
    {
      name: 'impressionsCount',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true },
      label: 'Jumlah Tayangan',
    },
    {
      name: 'clicksCount',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true },
      label: 'Jumlah Klik',
    },
  ],
}
```

- [ ] **Step 2: Commit**

```bash
git add src/collections/Ads.ts
git commit -m "feat: add Ads collection for manual ad management"
```

### Task 3: Create AdEvents Collection

**Files:**
- Create: `src/collections/AdEvents.ts`

- [ ] **Step 1: Create the AdEvents collection**

```ts
import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/hooks/accessControl'

export const AdEvents: CollectionConfig = {
  slug: 'ad-events',
  admin: {
    group: 'Iklan',
    useAsTitle: 'id',
    defaultColumns: ['ad', 'eventType', 'placement', 'createdAt'],
    listSearchableFields: ['placement', 'eventType'],
  },
  access: {
    create: () => true,
    read: isAdmin,
    update: () => false,
    delete: () => false,
  },
  timestamps: true,
  fields: [
    {
      name: 'ad',
      type: 'relationship',
      relationTo: 'ads',
      label: 'Iklan',
    },
    {
      name: 'eventType',
      type: 'select',
      required: true,
      options: [
        { label: 'Impression', value: 'impression' },
        { label: 'Click', value: 'click' },
      ],
      label: 'Tipe Event',
    },
    {
      name: 'placement',
      type: 'text',
      label: 'Placement',
    },
    {
      name: 'pageUrl',
      type: 'text',
      label: 'URL Halaman',
    },
    {
      name: 'userAgent',
      type: 'text',
      label: 'User Agent',
    },
    {
      name: 'ipHash',
      type: 'text',
      label: 'IP (hash)',
    },
  ],
}
```

- [ ] **Step 2: Commit**

```bash
git add src/collections/AdEvents.ts
git commit -m "feat: add AdEvents collection for impression/click tracking"
```

### Task 4: Register Collections in Payload Config

**Files:**
- Modify: `src/payload.config.ts`

- [ ] **Step 1: Add import and register new collections**

Add imports after line 13:
```ts
import { Ads } from './collections/Ads'
import { AdSlots } from './collections/AdSlots'
import { AdEvents } from './collections/AdEvents'
```

Add to the `collections` array after `Redirects`:
```ts
    Ads,
    AdSlots,
    AdEvents,
```

- [ ] **Step 2: Commit**

```bash
git add src/payload.config.ts
git commit -m "feat: register Ads, AdSlots, AdEvents collections"
```

### Task 5: Update Cache Keys and Invalidation Hook

**Files:**
- Modify: `src/lib/cache.ts`
- Modify: `src/hooks/invalidateCache.ts`

- [ ] **Step 1: Add ads cache key in cache.ts**

After `views:` line, add:
```ts
  ads: (placement: string) => `ads:${placement}`,
```

- [ ] **Step 2: Add invalidateAdCache hook in invalidateCache.ts**

Add after `invalidateTagCache`:
```ts
export const invalidateAdCache: CollectionAfterChangeHook = async ({ doc }) => {
  const d = doc as Record<string, unknown>
  if (d.placement) await invalidateCache(`ads:${d.placement as string}`)
  return doc
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/cache.ts src/hooks/invalidateCache.ts
git commit -m "feat: add ad cache key and invalidation hook"
```

### Task 6: Create Ads Helper Library

**Files:**
- Create: `src/lib/ads.ts`

- [ ] **Step 1: Create lib/ads.ts**

```ts
import type { BasePayload } from 'payload'
import { getPayloadClient } from './payload'
import { getCached, setCache } from './cache'
import { CacheKeys } from './cache'

export interface ManualAdResult {
  type: 'manual'
  id: number | string
  title: string
  imageDesktop: Record<string, unknown> | null
  imageMobile: Record<string, unknown> | null
  targetUrl: string
  placement: string
}

export interface FallbackAdResult {
  type: 'fallback'
  provider: string
  placement: string
  code: string
}

export interface EmptyAdResult {
  type: 'empty'
  placement: string
}

export type AdResult = ManualAdResult | FallbackAdResult | EmptyAdResult

export async function getAdForPlacement(placement: string): Promise<AdResult> {
  const cacheKey = CacheKeys.ads(placement)
  const cached = await getCached(cacheKey)
  if (cached) {
    try { return JSON.parse(cached) as AdResult } catch { /* ignore */ }
  }

  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'ads',
    limit: 1,
    where: {
      placement: { equals: placement },
      status: { equals: 'active' },
      startDate: { less_than_equal: new Date().toISOString() },
      endDate: { greater_than_equal: new Date().toISOString() },
    },
    sort: '-priority',
    depth: 1,
  })

  if (result.docs.length > 0) {
    const ad = result.docs[0] as Record<string, unknown>
    const adResult: ManualAdResult = {
      type: 'manual',
      id: ad.id as number | string,
      title: String(ad.title || ''),
      imageDesktop: (ad.imageDesktop as Record<string, unknown>) || null,
      imageMobile: (ad.imageMobile as Record<string, unknown>) || null,
      targetUrl: `/ads/click/${ad.id as string}`,
      placement,
    }
    await setCache(cacheKey, JSON.stringify(adResult), 300)
    return adResult
  }

  const slotResult = await payload.find({
    collection: 'ad-slots',
    limit: 1,
    where: {
      placement: { equals: placement },
      isActive: { equals: true },
      isFallbackActive: { equals: true },
      fallbackType: { not_equals: 'none' },
    },
    depth: 0,
  })

  if (slotResult.docs.length > 0) {
    const slot = slotResult.docs[0] as Record<string, unknown>
    if (slot.fallbackCode && String(slot.fallbackCode).length > 0) {
      const fallbackResult: FallbackAdResult = {
        type: 'fallback',
        provider: String(slot.fallbackType || 'adsense'),
        placement,
        code: String(slot.fallbackCode),
      }
      await setCache(cacheKey, JSON.stringify(fallbackResult), 300)
      return fallbackResult
    }
  }

  const emptyResult: EmptyAdResult = { type: 'empty', placement }
  await setCache(cacheKey, JSON.stringify(emptyResult), 300)
  return emptyResult
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/ads.ts
git commit -m "feat: add ads helper library with placement resolution"
```

### Task 7: Create GET /api/ads Endpoint

**Files:**
- Create: `src/app/api/ads/route.ts`

- [ ] **Step 1: Create the API route**

```ts
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
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/ads/route.ts
git commit -m "feat: add GET /api/ads endpoint for placement-based ad serving"
```

### Task 8: Create POST Impression Tracking Endpoint

**Files:**
- Create: `src/app/api/ads/[id]/impression/route.ts`

- [ ] **Step 1: Create the impression route**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const payload = await getPayloadClient()

  try {
    const ad = await payload.findByID({
      collection: 'ads',
      id,
      depth: 0,
    })

    if (!ad) {
      return NextResponse.json({ error: 'Iklan tidak ditemukan' }, { status: 404 })
    }

    const adRecord = ad as Record<string, unknown>
    const currentImpressions = typeof adRecord.impressionsCount === 'number'
      ? adRecord.impressionsCount
      : 0

    await payload.update({
      collection: 'ads',
      id,
      data: { impressionsCount: currentImpressions + 1 },
    })

    await payload.create({
      collection: 'ad-events',
      data: {
        ad: id,
        eventType: 'impression',
        placement: body.placement || adRecord.placement || '',
        pageUrl: body.pageUrl || '',
        userAgent: request.headers.get('user-agent') || '',
      },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Gagal mencatat impression' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/ads/[id]/impression/route.ts
git commit -m "feat: add POST impression tracking endpoint"
```

### Task 9: Create Click Tracking & Redirect Endpoint

**Files:**
- Create: `src/app/ads/click/[id]/route.ts`

- [ ] **Step 1: Create the click route**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const payload = await getPayloadClient()

  try {
    const ad = await payload.findByID({
      collection: 'ads',
      id,
      depth: 0,
    })

    if (!ad) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    const adRecord = ad as Record<string, unknown>
    const currentClicks = typeof adRecord.clicksCount === 'number'
      ? adRecord.clicksCount
      : 0

    await payload.update({
      collection: 'ads',
      id,
      data: { clicksCount: currentClicks + 1 },
    })

    await payload.create({
      collection: 'ad-events',
      data: {
        ad: id,
        eventType: 'click',
        placement: adRecord.placement || '',
        pageUrl: '',
        userAgent: '',
      },
    })

    const targetUrl = String(adRecord.targetUrl || '/')
    return NextResponse.redirect(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`)
  } catch {
    return NextResponse.redirect(new URL('/', request.url))
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/ads/click/[id]/route.ts
git commit -m "feat: add click tracking and redirect endpoint"
```

### Task 10: Create AdSlot Client Component

**Files:**
- Create: `src/components/ads/AdSlot.tsx`

- [ ] **Step 1: Create the AdSlot component**

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { getMediaUrl } from '@/lib/media'

interface AdResult {
  type: 'manual' | 'fallback' | 'empty'
  id?: string | number
  title?: string
  imageDesktop?: { url?: string } | null
  imageMobile?: { url?: string } | null
  targetUrl?: string
  provider?: string
  code?: string
  placement?: string
}

interface AdSlotProps {
  placement: string
  className?: string
}

const PLACEMENT_DIMENSIONS: Record<string, { h: number }> = {
  home_top_banner: { h: 250 },
  home_middle_banner: { h: 90 },
  home_sidebar_top: { h: 250 },
  home_sidebar_bottom: { h: 600 },
  article_top: { h: 90 },
  article_middle: { h: 90 },
  article_bottom: { h: 90 },
  article_sidebar: { h: 250 },
  category_top: { h: 250 },
  category_sidebar: { h: 250 },
  mobile_sticky_bottom: { h: 50 },
  mobile_article_middle: { h: 100 },
  popup_campaign: { h: 400 },
}

export default function AdSlot({ placement, className = '' }: AdSlotProps) {
  const [ad, setAd] = useState<AdResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const impressionSent = useRef(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(false)

    fetch(`/api/ads?placement=${encodeURIComponent(placement)}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load ad')
        return res.json()
      })
      .then((data: AdResult) => {
        setAd(data)
        setLoading(false)
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(true)
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [placement])

  useEffect(() => {
    if (ad?.type !== 'manual' || impressionSent.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !impressionSent.current) {
            impressionSent.current = true
            fetch(`/api/ads/${ad.id}/impression`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ placement, pageUrl: window.location.href }),
            }).catch(() => {})
          }
        })
      },
      { threshold: 0.5 },
    )

    const el = imgRef.current
    if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [ad, placement])

  if (loading) {
    const height = PLACEMENT_DIMENSIONS[placement]?.h || 90
    return (
      <div
        className={`bg-gray-100 animate-pulse rounded-lg ${className}`}
        style={{ height, width: '100%' }}
        role="status"
        aria-label="Memuat iklan"
      />
    )
  }

  if (error || !ad) return null

  if (ad.type === 'empty') return null

  if (ad.type === 'fallback') {
    return (
      <div
        className={`ad-fallback ${className}`}
        dangerouslySetInnerHTML={{ __html: ad.code || '' }}
      />
    )
  }

  return (
    <div ref={imgRef} className={`ad-manual ${className}`}>
      <a
        href={ad.targetUrl || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <picture>
          {ad.imageDesktop && (
            <source
              media="(min-width: 768px)"
              srcSet={getMediaUrl(ad.imageDesktop as Record<string, unknown>)}
            />
          )}
          <img
            src={getMediaUrl(
              (ad.imageMobile || ad.imageDesktop) as Record<string, unknown>,
            )}
            alt={ad.title || 'Iklan'}
            className="w-full h-auto"
            loading="lazy"
          />
        </picture>
      </a>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ads/AdSlot.tsx
git commit -m "feat: add AdSlot client component with impression tracking"
```

### Task 11: Integrate AdSlot into Homepage

**Files:**
- Modify: `src/app/(public)/page.tsx`

- [ ] **Step 1: Import AdSlot and place ads on homepage**

Add import at top:
```ts
import AdSlot from '@/components/ads/AdSlot'
```

Add after HeroNews section (after `</div>` closing the hero section):
```tsx
        {/* Homepage Top Banner */}
        <AdSlot placement="home_top_banner" className="my-6" />
```

Add AdSlot in sidebar section (after `<SocialFollow />`):
```tsx
            <AdSlot placement="home_sidebar_top" />
            <AdSlot placement="home_sidebar_bottom" />
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(public\)/page.tsx
git commit -m "feat: integrate AdSlot into homepage"
```

### Task 12: Integrate AdSlot into Article Page

**Files:**
- Modify: `src/app/(public)/[...segments]/page.tsx`

- [ ] **Step 1: Import AdSlot**

Add import:
```ts
import AdSlot from '@/components/ads/AdSlot'
```

- [ ] **Step 2: Place AdSlot in article content**

In the ArticlePage component, after the featured image section and before the prose content div:
```tsx
        <AdSlot placement="article_top" className="my-6" />
```

After the prose content div and before tags:
```tsx
        <AdSlot placement="article_bottom" className="my-6" />
```

(article_middle will need content splitting - for MVP, only top and bottom to keep it simple)

- [ ] **Step 3: Commit**

```bash
git add src/app/\(public\)/\[...segments\]/page.tsx
git commit -m "feat: integrate AdSlot into article page"
```

### Task 13: Integrate AdSlot into Category Page

**Files:**
- Modify: `src/app/(public)/category/[slug]/page.tsx`

- [ ] **Step 1: Import AdSlot**

Add import:
```ts
import AdSlot from '@/components/ads/AdSlot'
```

- [ ] **Step 2: Place AdSlot**

After the category description `<p>` and before the article list `<div>`:
```tsx
      <AdSlot placement="category_top" className="my-6" />
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(public\)/category/\[slug\]/page.tsx
git commit -m "feat: integrate AdSlot into category page"
```

### Task 14: Update Seed Script with Default Ad Slots

**Files:**
- Modify: `src/db/seed.ts`

- [ ] **Step 1: Add default ad slots seeding**

Before the final "Seed complete" log, add:
```ts
  // Seed default ad slots
  const defaultSlots = [
    { placement: 'home_top_banner', label: 'Homepage Top Banner', description: 'Banner besar di bagian atas homepage' },
    { placement: 'home_middle_banner', label: 'Homepage Middle Banner', description: 'Banner di tengah daftar berita' },
    { placement: 'home_sidebar_top', label: 'Homepage Sidebar Top', description: 'Sidebar kanan/kiri bagian atas' },
    { placement: 'home_sidebar_bottom', label: 'Homepage Sidebar Bottom', description: 'Sidebar kanan/kiri bagian bawah' },
    { placement: 'article_top', label: 'Article Top', description: 'Di bawah judul/gambar utama artikel' },
    { placement: 'article_middle', label: 'Article Middle', description: 'Di tengah isi artikel' },
    { placement: 'article_bottom', label: 'Article Bottom', description: 'Setelah isi artikel' },
    { placement: 'article_sidebar', label: 'Article Sidebar', description: 'Sidebar artikel' },
    { placement: 'category_top', label: 'Category Top', description: 'Banner atas halaman kategori' },
    { placement: 'category_sidebar', label: 'Category Sidebar', description: 'Sidebar halaman kategori' },
    { placement: 'mobile_sticky_bottom', label: 'Mobile Sticky Bottom', description: 'Iklan sticky bawah di mobile' },
    { placement: 'mobile_article_middle', label: 'Mobile Article Middle', description: 'Iklan tengah artikel versi mobile' },
    { placement: 'popup_campaign', label: 'Popup Campaign', description: 'Popup promosi/campaign' },
  ]

  for (const slot of defaultSlots) {
    const existing = await payload.find({
      collection: 'ad-slots',
      limit: 1,
      overrideAccess: true,
      where: { placement: { equals: slot.placement } },
    })

    if (!existing.docs[0]) {
      await payload.create({
        collection: 'ad-slots',
        data: slot,
        overrideAccess: true,
      })
      console.log(`Created ad slot: ${slot.placement}`)
    }
  }
```

- [ ] **Step 2: Commit**

```bash
git add src/db/seed.ts
git commit -m "feat: add default ad slots to seed script"
```
