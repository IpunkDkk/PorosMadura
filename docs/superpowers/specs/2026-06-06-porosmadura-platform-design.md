# PorosMadura Platform — Design Spec

**Date:** 2026-06-06  
**Status:** Approved  
**Stack:** Next.js App Router + Payload CMS 3 + Better Auth + PostgreSQL + Redis + Meilisearch  
**Brand:** PorosMadura — "Berita Tepat, Fakta Kuat"

---

## Overview

PorosMadura adalah platform website berita modern berbasis Next.js App Router dengan Payload CMS 3 embedded untuk admin panel, Better Auth untuk autentikasi, PostgreSQL untuk database, Meilisearch untuk pencarian, dan Redis untuk caching. Platform ini memiliki 4 fase implementasi yang dibangun secara berurutan.

---

## 1. Fase Implementasi

### Fase 1: Foundation (Core Setup + Collections + Auth)

#### 1.1 Project Init

- **Next.js 15** App Router + TypeScript + Tailwind CSS 4
- **Payload CMS 3.x** embedded langsung dalam Next.js via `next.config`
- **Better Auth** untuk autentikasi (login session, future OAuth Google)
- **PostgreSQL** via Docker Compose

#### 1.2 Better Auth + Payload Integration

Better Auth dan Payload berjalan side-by-side:

| Lapisan | Tools | Fungsi |
|---------|-------|--------|
| Auth (Login/Session) | Better Auth | Login page kustom, session management, OAuth-ready |
| Admin Panel (CMS) | Payload Admin | CRUD collections, rich text, media upload |
| User Data & Roles | Payload Users collection | Data user, role (admin/editor/author/viewer) |
| Sync | Better Auth → Payload API | Saat login, sinkronisasi user |

**Login flow:**
```
User → /admin/login (custom branded page)
     → Better Auth validate credentials & create session
     → Redirect to Payload Admin Panel
```

#### 1.3 Docker Compose Services

```yaml
services:
  app:         # Next.js + Payload + Better Auth
  postgres:    # PostgreSQL 16
  redis:       # Redis 7 (digunakan di Fase 4)
  meilisearch: # Meilisearch (digunakan di Fase 4)
```

#### 1.4 Branding Implementation

Dari assets `img/`:
- `logo-warna.jpeg` → crop jadi favicon, logo, apple-icon
- `branding-warna-cropped.jpeg` → OG Image default
- Tailwind config dengan custom colors sesuai brand palette
- Google Fonts: Merriweather (heading) + Inter (body)

#### 1.5 Directory Structure

```
porosmadura/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx                       # Homepage
│   │   │   ├── [category]/
│   │   │   │   └── [slug]/page.tsx            # Detail artikel
│   │   │   ├── category/[slug]/page.tsx       # Halaman kategori
│   │   │   ├── tag/[slug]/page.tsx            # Halaman tag
│   │   │   ├── author/[slug]/page.tsx         # Halaman author
│   │   │   └── search/page.tsx                # Search page
│   │   ├── (admin)/
│   │   │   ├── login/page.tsx                 # Custom Better Auth login
│   │   │   └── admin/[[...segments]]/page.tsx # Payload Admin
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   └── rss.xml/route.ts
│   ├── collections/           # Payload collections
│   │   ├── Users.ts
│   │   ├── Authors.ts
│   │   ├── Posts.ts
│   │   ├── Categories.ts
│   │   ├── Tags.ts
│   │   ├── Media.ts
│   │   ├── Pages.ts
│   │   ├── Redirects.ts
│   │   └── Settings.ts
│   ├── components/
│   │   ├── layout/            # Header, Footer, Navbar, MobileMenu
│   │   ├── article/           # ArticleCard, ArticleDetail, HeroNews
│   │   ├── category/          # CategoryBadge, CategoryNav
│   │   ├── media/             # ImageWithFallback, MediaUrl
│   │   └── seo/               # JsonLd, Breadcrumb
│   ├── lib/
│   │   ├── payload.ts         # Payload client
│   │   ├── seo.ts             # SEO helpers
│   │   ├── media.ts           # getMediaUrl() helper
│   │   ├── cache.ts           # Redis helpers
│   │   ├── search.ts          # Meilisearch helpers
│   │   ├── redirects.ts       # Redirect helpers
│   │   └── rss.ts             # RSS generation
│   ├── auth/
│   │   └── better-auth.ts     # Better Auth setup
│   ├── hooks/
│   │   ├── syncPostToSearch.ts
│   │   ├── invalidateCache.ts
│   │   └── createRedirectOnSlugChange.ts
│   ├── css/
│   │   └── globals.css        # Tailwind + brand tokens
│   └── payload.config.ts
├── public/
│   ├── media/                 # Local storage (persistent volume)
│   ├── favicon.ico
│   ├── og-image.jpg
│   └── logo.png
├── docker-compose.yml
└── package.json
```

#### 1.6 Payload Collections

**Users** (Better Auth + Payload):
- name, email, role (admin|editor|author|viewer), avatar, isActive
- Auth via Better Auth, data & roles via Payload

**Authors:**
- name, slug, bio, avatar, email, socialLinks, user (relasi ke Users), isActive

**Posts:**
- title, slug, excerpt, content (richText), featuredImage (relasi Media)
- category (relasi Categories), tags (relasi Tags), author (relasi Authors)
- status (draft|review|scheduled|published|archived)
- publishedAt, scheduledAt, isFeatured, isBreakingNews
- seoTitle, seoDescription, canonicalUrl, ogImage
- allowIndex, sourceName, sourceUrl, readingTime, views

**Categories:**
- name, slug, description, parent (self-relasi), seoTitle, seoDescription, order, isActive

**Tags:**
- name, slug, description, isActive

**Media:**
- file, alt (wajib), caption, credit, folder, createdBy
- Image sizes: thumbnail (400×300), card (768×432), hero (1280×720), og (1200×630)

**Pages:**
- title, slug, content, seoTitle, seoDescription, status

**Redirects:**
- from, to, statusCode (301|302), isActive

**Settings** (singleton):
- siteName, siteDescription, tagline, siteUrl, logo, favicon, defaultOgImage
- brandPrimaryColor, brandSecondaryColor, contactEmail, socialLinks
- defaultSeoTitle, defaultSeoDescription, googleAnalyticsId
- rssTitle, rssDescription, newsPublicationName

---

### Fase 2: CMS Workflow

#### 2.1 Editorial Workflow

```
Author buat draft → submit review → Editor review
                                    → Publish / Schedule / Return to Draft
```

**Status behavior:**
- **Draft:** Tidak tampil publik, tidak masuk sitemap/RSS/search
- **Review:** Tidak tampil publik, hanya editor/admin bisa lihat
- **Scheduled:** Tidak tampil sebelum scheduledAt, auto-publish
- **Published:** Tampil publik, masuk sitemap + RSS + Meilisearch
- **Archived:** Tidak tampil di listing publik, keluar dari search index

#### 2.2 Role Permissions

| Peran | Akses |
|-------|-------|
| **Admin** | Full access, manage users/roles/settings, clear cache, reindex |
| **Editor** | Create/edit all articles, publish/schedule/archive, set featured & breaking news |
| **Author** | Create own articles, edit own drafts, upload media, submit review |
| **Viewer** | Read-only |

#### 2.3 Slug & Redirect System

- Slug auto-generate dari title, bisa diedit manual
- Unique validation
- Auto-redirect 301 via Payload hook saat slug post atau category berubah
- Format artikel: `/[categorySlug]/[postSlug]`

---

### Fase 3: Public Pages + SEO

#### 3.1 Halaman Publik

Semua public pages menggunakan **Server Components** dengan **generateMetadata** untuk SEO.

**Homepage** (`/`):
- Header Navy → Logo + Tagline + Date + Search + Login
- Sticky Category Bar (white) — HOME, TRENDING, categories
- Breaking News Ticker (red bg #C61E21)
- Hero Grid (3 kolom: 1 besar span-2 + 2 stacked kanan)
- Latest News Feed (horizontal cards image|content)
- Sidebar: Terpopuler (big numbers 1-5) + Ikuti Kami card
- Footer: Brand/Kategori/Perusahaan/Kontak

**Detail Artikel** (`/[category]/[slug]`):
- Breadcrumb, Featured image, Title (Merriweather), Excerpt
- Author, Published/Updated date
- Rich text content, Tags, Share buttons
- Related posts, Popular posts sidebar
- JSON-LD NewsArticle + OG metadata

**Halaman Kategori** (`/category/[slug]`):
- Nama + deskripsi, Grid artikel with pagination, SEO metadata

**Halaman Tag** (`/tag/[slug]`):
- Nama + deskripsi, Artikel list with pagination

**Halaman Author** (`/author/[slug]`):
- Profile (avatar, bio, social links), Artikel list with pagination

**Search** (`/search?q=`):
- Search input + Meilisearch results
- Filter kategori, Typo tolerance
- Hasil: title, excerpt, category, thumbnail, date

**Static Pages:** `/tentang-kami`, `/redaksi`, `/kontak`, dll via Pages collection

#### 3.2 SEO Features

Per artikel:
- Dynamic metadata (generateMetadata)
- Open Graph (title, description, image)
- Twitter Card, Canonical URL
- JSON-LD NewsArticle schema
- allowIndex (robots meta)

Global:
- `/sitemap.xml` → published posts, categories, tags, authors, pages
- `/news-sitemap.xml` → published posts (Google News)
- `/rss.xml` → latest published posts
- `/robots.txt` → disallow /admin, /api
- BreadcrumbList structured data

#### 3.3 Server Components Strategy

- ✅ Semua public pages Server Components
- ✅ generateMetadata untuk SEO dinamis
- ✅ Client components minimal: search input, mobile menu, share buttons
- ✅ ISR atau SSR with cache untuk homepage & listing
- ✅ Fetch dengan cache strategy + Redis layer nanti

---

### Fase 4: Infrastructure

#### 4.1 Meilisearch

- Index: `posts`
- Sync via Payload hooks: afterChange, afterDelete
- Masuk index: status=published & publishedAt≤now & allowIndex=true
- Keluar index: archived, deleted, unpublished
- Search page consume Meilisearch API langsung

#### 4.2 Redis Cache

Cache keys:
- `homepage`, `category:{slug}:page:{n}`, `tag:{slug}:page:{n}`
- `post:{slug}`, `popular-posts`, `breaking-news`, `featured-posts`
- `views:post:{id}` (view counter → sync ke DB)

Invalidate via hooks saat: artikel publish/edit/delete, kategori/tag/author berubah, setting berubah.

#### 4.3 Hook Pipeline

```
Posts.afterChange ──┬──→ Meilisearch sync
                    ├──→ Redis cache invalidation
                    ├──→ Redirect auto-create (slug change)
                    └──→ Regenerate sitemap

Posts.beforeDelete ──→ Meilisearch remove
                     → Redis cache invalidation
```

#### 4.4 R2/S3 Ready

- `getMediaUrl()` helper — semua URL media lewat sini
- `STORAGE_DRIVER=local|s3` via env
- Tidak ada hardcode path media di frontend
- Image component terpusat

#### 4.5 Deployment

- 1 VPS → Docker Compose (4 services)
- Nginx/Caddy reverse proxy + SSL
- Cloudflare DNS + CDN
- Backup: PostgreSQL harian + media folder + .env

---

## Data Model Diagram

```
Users ──> Authors (via user field)
Authors ──> Posts.author
Categories ──> Posts.category, Categories.parent (self)
Tags ──> Posts.tags (hasMany)
Media ──> Posts.featuredImage, Posts.ogImage, Authors.avatar, Settings.logo
Posts ──> Redirects (auto slug change)
Pages ──> Redirects (auto slug change)
Settings — singleton, no relations
```

## Brand Token Reference

```css
--color-navy: #0C2A51;
--color-red: #C61E21;
--color-white: #F6F6F6;
--color-slate-blue: #627389;
--color-soft-slate: #95A0AE;
--color-soft-red: #CF5D61;
--color-text-primary: #111827;
--color-text-secondary: #4B5563;
--color-border: #E5E7EB;
--color-surface: #FFFFFF;
--color-page-bg: #F9FAFB;

--font-heading: 'Merriweather', serif;
--font-body: 'Inter', sans-serif;
```
