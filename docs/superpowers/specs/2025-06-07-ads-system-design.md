# Sistem Iklan Hybrid — PorosMadura

**Date:** 2025-06-07  
**Status:** Approved  
**Stack:** Next.js 15 + Payload CMS 3 + PostgreSQL + Redis  

## 1. Ringkasan

Sistem iklan hybrid menggabungkan **Iklan Manual** (dari pengiklan lokal) dengan **Google AdSense fallback**. Setiap slot iklan menampilkan iklan manual jika ada yang aktif, otomatis beralih ke AdSense jika slot kosong.

## 2. Pendekatan

**Pendekatan B — Payload Collections + Custom Next.js API**  
- Ads, AdSlots, AdEvents sebagai Payload collections (admin & storage)  
- Custom Next.js API routes untuk publik (ringan, bisa cache, kontrol response)  
- Images via relationship ke Media collection (reuse existing)  
- Redis cache per placement, di-invalidate saat ads berubah

## 3. Data Model

### 3.1 Collection: `ads`

| Field | Type | Keterangan |
|---|---|---|
| `title` | text (required) | Nama iklan |
| `advertiserName` | text | Nama pengiklan |
| `advertiserContact` | text | Kontak |
| `imageDesktop` | relationship → media | Banner desktop |
| `imageMobile` | relationship → media | Banner mobile (opsional) |
| `targetUrl` | text (required) | Link tujuan |
| `placement` | text | Kode placement (denormalized) |
| `startDate` | date (required) | Mulai tayang |
| `endDate` | date (required) | Selesai tayang |
| `status` | select: draft / active / inactive | Default: draft |
| `priority` | number | Default: 0 (makin besar makin tinggi) |
| `impressionsCount` | number (readOnly) | Counter tayangan |
| `clicksCount` | number (readOnly) | Counter klik |

**Admin group:** Iklan  
**Access:** admin/editor create/update, admin delete

### 3.2 Collection: `ad-slots`

| Field | Type | Keterangan |
|---|---|---|
| `placement` | text (required, unique) | Kode unik, contoh: `article_middle` |
| `label` | text (required) | Nama display |
| `description` | textarea | Deskripsi lokasi |
| `fallbackType` | select: adsense / none | Default: none |
| `fallbackCode` | textarea | Kode AdSense/ad network |
| `isFallbackActive` | checkbox | Default: false |
| `isActive` | checkbox | Default: true |

**Admin group:** Iklan  
**Access:** admin only untuk create/update/delete

### 3.3 Collection: `ad-events`

| Field | Type | Keterangan |
|---|---|---|
| `ad` | relationship → ads | Iklan terkait |
| `eventType` | select: impression / click | |
| `placement` | text | Placement saat event |
| `pageUrl` | text | URL halaman |
| `userAgent` | text (optional) | User agent |
| `ipHash` | text (optional) | IP terhash |
| `createdAt` | date (auto) | Via timestamps |

**Admin group:** Iklan  
**Access:** admin read-only (no create/update/delete via admin)

## 4. API

### 4.1 GET `/api/ads?placement={key}`

Mengembalikan iklan untuk placement tertentu. Logika:
1. Cari iklan manual dengan status=active, startDate <= now, endDate >= now, placement cocok
2. Jika ada, urutkan by priority DESC, ambil 1 (random jika priority sama)
3. Jika tidak ada, cek ad_slot → jika fallback aktif & ada code → return fallback
4. Jika tidak ada → return empty

**Cache:** Redis dengan key `ads:{placement}`, TTL 5 menit.

### 4.2 POST `/api/ads/{id}/impression`

Body opsional: `{ "placement": "...", "pageUrl": "..." }`  
Aksi: increment `impressionsCount` + buat `AdEvent` (event_type: impression)

### 4.3 GET `/ads/click/{id}`

Aksi: increment `clicksCount` + buat `AdEvent` (event_type: click) → 301 redirect ke `targetUrl`

## 5. Frontend

### 5.1 Component `<AdSlot placement="..." />`

- **Type:** Client component  
- **Behavior:**
  - Fetch `/api/ads?placement=...` on mount
  - Jika `type: manual` → render banner dengan `<picture>` untuk responsive desktop/mobile, link ke `/ads/click/{id}`, kirim impression via IntersectionObserver
  - Jika `type: fallback` → render AdSense code via `dangerouslySetInnerHTML`
  - Jika `type: empty` → render null
- **Loading state:** Placeholder abu-abu sesuai dimensi placement
- **Error state:** Sembunyikan slot

### 5.2 Penempatan

- **Homepage:** `home_top_banner` (setelah hero), `home_sidebar_top`, `home_sidebar_bottom` (di sidebar)
- **Artikel:** `article_top` (setelah judul), `article_middle` (tengah konten), `article_bottom` (setelah konten)
- **Kategori:** `category_top` (sebelum daftar artikel), `category_sidebar`
- **Mobile:** `mobile_sticky_bottom`, `mobile_article_middle`

## 6. Admin Panel

Semua collection di bawah group **"Iklan"** di sidebar Payload:
- **Ads** → CRUD dengan list view: Title | Advertiser | Placement | Tanggal | Status | Tayang | Klik | CTR
- **Ad Slots** → Konfigurasi placement + fallback
- **Ad Events** → Read-only laporan detail

## 7. Caching

- Key pattern: `ads:{placement}` di Redis
- TTL: 300 detik
- Invalidate via `invalidateAdCache` hook pada Ads afterChange / afterDelete
- Tracking endpoints (impression/click): no cache

## 8. Access Control

| Collection | Read | Create | Update | Delete |
|---|---|---|---|---|
| Ads | admin/editor | admin/editor | admin/editor | admin |
| AdSlots | admin/editor | admin | admin | admin |
| AdEvents | admin | admin | - | - |

## 9. File Structure

```
src/
├── collections/Ads.ts
├── collections/AdSlots.ts
├── collections/AdEvents.ts
├── hooks/invalidateCache.ts  ← +invalidateAdCache
├── lib/cache.ts              ← +CacheKeys.ads
├── lib/ads.ts
├── components/ads/AdSlot.tsx
├── app/api/ads/route.ts
├── app/api/ads/[id]/impression/route.ts
├── app/ads/click/[id]/route.ts
└── payload.config.ts         ← +3 collections
```

## 10. Seed Data

Default 13 ad slots di-seed saat awal (lihat plan).

## 11. Prioritas Implementasi

1. Buat 3 collection: Ads, AdSlots, AdEvents
2. Update payload.config.ts
3. Buat lib/ads.ts helpers
4. Buat API routes (GET /api/ads, POST impression, GET click redirect)
5. Buat invalidateAdCache hook, update cache.ts
6. Buat komponen AdSlot.tsx
7. Integrasi komponen ke halaman (homepage, artikel, kategori)
8. Update seed.ts dengan default ad slots
