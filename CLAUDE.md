# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev              # Start Next.js dev server (localhost:3000)
npm run build            # Production build with type/lint checks
npm run start            # Serve built app
npm run lint             # Next.js lint

# Services (Docker)
docker compose up -d postgres redis meilisearch   # Start dependencies
docker compose up --build                          # Build & run full stack

# Database
npm run seed             # Seed CMS with sample data (categories, authors, tags, posts)
```

Copy `.env.example` → `.env` before developing. `PAYLOAD_SECRET` and `BETTER_AUTH_SECRET` must be set.  
For ngrok/preview URLs, add `CORS_EXTRA_ORIGINS=https://your-ngrok-url.ngrok-free.app` to `.env`.

## Architecture

This is a **Next.js 15 + Payload CMS 3** digital news portal (Indonesian language, Madura-focused).

### Route Groups

- `src/app/(public)/` — Public pages: home, category/[slug], tag/[slug], author/[slug], search, catch-all `[...segments]` (1 segment = static Pages, 2 segments = article Posts)
- `src/app/(payload)/` — Payload CMS admin (`/admin`) and API (`/api`)
- `src/app/api/auth/[...all]` — Better Auth handler
- `src/app/api/search` — Search API (Meilisearch with SQL fallback)
- `src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/rss.xml/route.ts` — SEO feeds

### Payload CMS Collections (`src/collections/`)

| Collection | Purpose |
|---|---|
| Posts | Main content with draft→review→published→archived status workflow, featured/breaking flags, SEO fields, version drafts |
| Authors | Public author profiles with social links |
| Categories | Ordered, active/inactive toggle |
| Tags | Simple tagging |
| Media | File uploads with responsive image sizes |
| Pages | Static pages (about, contact, etc.) |
| Redirects | 301 redirects auto-created on slug change |
| Users | Admin/editor/author roles |
| Settings (Global) | Site name, SEO defaults, social links, GA ID |

### Hooks (`src/hooks/`) — applied to collections

- **`accessControl.ts`** — Role gates: admin, editor, author, or public-read
- **`generateSlug.ts`** — Auto-slugify from title on create
- **`validateStatusTransition.ts`** — State machine enforcement for Post status
- **`syncPostToSearch.ts`** — Index/unindex posts in Meilisearch on publish/delete
- **`createRedirectOnSlugChange.ts`** — Auto-create 301 when post/category slug changes
- **`invalidateCache.ts`** — Bust Redis cache keys on content change

### Lib (`src/lib/`)

- **`payload.ts`** — Payload client singleton + data fetchers (`getPublishedPosts`, `getPostBySlug`, `getCategoryBySlug`, `getSiteSettings`, etc.)
- **`cms.ts`** — Normalizers (`normalizePost`, `normalizeSettings`, `normalizeCategory`, `normalizeAuthor`) + `renderRichText` (Lexical→HTML)
- **`search.ts`** — Meilisearch client; gracefully degrades with `MEILISEARCH_ENABLED=false`
- **`cache.ts`** — Redis helpers with TTL; `CacheKeys` constant maps logical names to keys
- **`media.ts`** — `getMediaUrl`, `getImageSizeUrl` for responsive image sizes
- **`storage.ts`** — Storage driver abstraction (local or S3)
- **`date.ts`** — Indonesian relative time formatting (e.g. "3 jam yang lalu")
- **`seo.ts`** — Default Next.js `Metadata` factory

### Auth

Two independent auth systems:
- **Better Auth** (`src/auth/better-auth.ts`) — public Next.js app (email/password, cookies)
- **Payload CMS auth** — built-in admin panel auth (uses Users collection)

### Styling

Tailwind CSS v4 with custom theme tokens in `src/css/globals.css`. Fonts: Inter (body), Merriweather (headings). Custom color tokens prefixed `--color-poros-*`.

### Key Patterns

- Public pages fetch data server-side via `src/lib/payload.ts` helpers
- Homepage uses ISR (`export const revalidate = 300`, `force-static`)
- Payload collection hooks are registered in the collection config, never called directly
- Post data flows through `normalizePost()` before reaching components
- Search API uses Meilisearch first, falls back to Payload SQL `like` queries
- `view` counts and `readingTime` on Posts are read-only admin fields updated externally
- `depth: 2` is the standard population depth for related data
- Logo: Header uses `logo-putih.png` (navy bg), Footer uses `logo.png` (white bg); both show Settings → logo upload if set
- Media URLs from Payload are made dynamic at render time (local host → relative path) so they work on any domain
