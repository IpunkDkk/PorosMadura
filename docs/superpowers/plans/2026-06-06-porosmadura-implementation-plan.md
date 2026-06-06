# PorosMadura Platform — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready news platform PorosMadura with Next.js 15 + Payload CMS 3 + Better Auth + PostgreSQL + Redis + Meilisearch

**Architecture:** Single Next.js 15 App Router project with Payload CMS 3 embedded as a plugin. Better Auth handles admin authentication with custom branded login page. 9 Payload collections for all data models. Public pages rendered as Server Components with generateMetadata for SEO. Meilisearch for full-text search, Redis for caching. Docker Compose for local dev and production deployment.

**Tech Stack:** Next.js 15 (App Router), Payload CMS 3.x, Better Auth, TypeScript, Tailwind CSS 4, PostgreSQL 16, Redis 7, Meilisearch, Docker Compose

**Phases:**
1. [Phase 1 — Foundation](./2026-06-06-porosmadura-phase1-foundation.md) — Project setup, Payload, Better Auth, Docker, Branding, Layout components
2. [Phase 1b — Collections (Tasks 1.6–1.14)](./2026-06-06-porosmadura-p1-collections.md) — All 9 Payload collections (separate file for manageable size)
3. [Phase 2 — CMS Workflow](./2026-06-06-porosmadura-phase2-cms-workflow.md) — Editorial workflow, role permissions, slug & redirect system
4. [Phase 3 — Public Pages + SEO](./2026-06-06-porosmadura-phase3-public-pages.md) — All public pages from sample design, SEO metadata, sitemap, RSS, JSON-LD
5. [Phase 4 — Infrastructure](./2026-06-06-porosmadura-phase4-infrastructure.md) — Meilisearch, Redis cache, R2/S3 adapter, production Docker deploy

---

### File Structure (Complete)

```
porosmadura/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── layout.tsx                    # Public layout (Header + Footer)
│   │   │   ├── page.tsx                      # Homepage
│   │   │   ├── [category]/
│   │   │   │   └── [slug]/page.tsx           # Article detail
│   │   │   ├── category/
│   │   │   │   └── [slug]/page.tsx           # Category page
│   │   │   ├── tag/
│   │   │   │   └── [slug]/page.tsx           # Tag page
│   │   │   ├── author/
│   │   │   │   └── [slug]/page.tsx           # Author page
│   │   │   └── search/page.tsx               # Search page
│   │   ├── (admin)/
│   │   │   ├── login/page.tsx                # Custom Better Auth login
│   │   │   └── admin/[[...segments]]/page.tsx # Payload Admin
│   │   ├── sitemap.ts                        # Main sitemap
│   │   ├── robots.ts                         # Robots.txt
│   │   └── rss.xml/route.ts                  # RSS feed
│   ├── collections/
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
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── MobileMenu.tsx
│   │   ├── article/
│   │   │   ├── ArticleCard.tsx
│   │   │   ├── HeroNews.tsx
│   │   │   ├── BreakingNews.tsx
│   │   │   └── RelatedPosts.tsx
│   │   ├── sidebar/
│   │   │   ├── PopularPosts.tsx
│   │   │   └── SocialFollow.tsx
│   │   ├── media/
│   │   │   └── ImageWithFallback.tsx
│   │   └── seo/
│   │       ├── JsonLd.tsx
│   │       └── Breadcrumb.tsx
│   ├── lib/
│   │   ├── payload.ts         # Payload REST client
│   │   ├── seo.ts             # SEO metadata helpers
│   │   ├── media.ts           # getMediaUrl() helper
│   │   ├── cache.ts           # Redis client + helpers
│   │   ├── search.ts          # Meilisearch client + helpers
│   │   └── rss.ts             # RSS feed generation
│   ├── auth/
│   │   └── better-auth.ts     # Better Auth setup
│   ├── hooks/
│   │   ├── syncPostToSearch.ts
│   │   ├── invalidateCache.ts
│   │   └── createRedirectOnSlugChange.ts
│   ├── css/
│   │   └── globals.css
│   └── payload.config.ts
├── public/
│   ├── media/                 # Local storage volume
│   ├── favicon.ico
│   ├── og-image.jpg
│   └── logo.png
├── img/                       # Source branding assets
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```
