# Repository Guidelines

## Project Overview

This repository is a Next.js application for the Poros Madura news portal. It uses the App Router, a custom CMS, Drizzle ORM, PostgreSQL, Redis caching, Meilisearch search, and Better Auth. The public site is Indonesian-language and Madura-focused.

## Project Structure & Module Organization

Application code lives in `src/`. Public routes use the App Router under `src/app/(public)`, custom CMS routes are under `src/app/cms`, and legacy CMS redirects/API stubs are under `src/app/(legacy-cms)`. API routes live in `src/app/api`, ad click routes live in `src/app/ads`, media serving lives in `src/app/media`, and SEO feeds live in `src/app/robots.ts`, `src/app/sitemap.ts`, and `src/app/rss.xml/route.ts`.

Database schema, migrations, and seed scripts are in `src/db` and `drizzle/`. Reusable UI lives in `src/components`, auth helpers in `src/auth`, cross-cutting helpers in `src/lib`, and global styles in `src/css/globals.css`. Static assets are in `public/`, with uploaded media served from `public/media`. Project planning notes live in `docs/superpowers`.

## Route Map

- `src/app/(public)/` - public pages, including home, category, tag, author, search, and catch-all content routes.
- `src/app/(public)/[...segments]/page.tsx` - resolves one segment as static pages and two segments as article posts.
- `src/app/cms/` - custom CMS dashboard, posts, pages, media, ads, settings, taxonomy, and users.
- `src/app/(legacy-cms)/` - disabled legacy CMS routes that redirect or return compatibility responses.
- `src/app/api/auth/[...all]` - Better Auth handler.
- `src/app/api/search` - search API using Meilisearch with database fallback.
- `src/app/api/health` - health endpoint for Docker checks.

## Build, Test, and Development Commands

- `docker compose up -d`: start the local development stack (app, postgres, redis, meilisearch).
- `docker compose up -d --build`: rebuild the local app image, then start the stack.
- `docker compose down`: stop the local stack without deleting volumes.
- `docker compose logs -f app`: follow the app container logs.
- `docker compose exec app npm run seed`: seed the database inside the container.
- `docker compose exec app npm run migrate`: run database migrations inside the container.
- `docker compose exec app npm run lint`: run Next.js lint checks inside the container.
- `docker compose exec app npm run build`: run a production build inside the container.

For local development, copy `.env.example` to `.env` and keep secrets out of commits. For ngrok or preview URLs, add `CORS_EXTRA_ORIGINS=https://your-ngrok-url.ngrok-free.app` to `.env`.

## Environment Variables

Local development should keep `.env` small. The local Docker Compose file provides internal service URLs for PostgreSQL, Redis, and Meilisearch, so do not add `DATABASE_URI`, `REDIS_URL`, `MEILISEARCH_HOST`, or `MEILISEARCH_API_KEY` to local `.env` unless debugging outside Docker. Local Meilisearch uses the fixed `master-key` value directly in `docker-compose.yml`.

Use `BETTER_AUTH_SECRET` as the only auth/session secret. Do not reintroduce `CMS_SESSION_SECRET`; the custom CMS uses Better Auth sessions through `src/auth/better-auth.ts` and CMS role checks through `src/lib/cms-auth.ts`.

For Coolify production, set environment variables from `.env.example.production` in the Coolify UI. `MEILISEARCH_API_KEY` is still required in production because the same value must be passed to the Meilisearch service as `MEILI_MASTER_KEY` and to the app as `MEILISEARCH_API_KEY`.

## Docker Notes

The default `docker-compose.yml` is optimized for local development. The app service uses the Dockerfile `dev` target, bind mounts the repository into `/app`, and stores `node_modules` plus `.next` in Docker volumes. Normal source edits should hot reload without rebuilding or recreating the container.

Use `docker compose restart app` after changing runtime environment variables. Use `docker compose up -d --build` after changing `package.json`, `package-lock.json`, the Dockerfile, or dependency installation behavior.

Coolify deployment should keep using `docker-compose.coolify.yml` or the production Dockerfile flow. Do not point Coolify at the local development compose file.

## Coding Style & Naming Conventions

Use TypeScript with `strict` mode and the `@/*` import alias for files under `src/`. Follow the existing style: two-space indentation, single quotes, no semicolons, and named exports for shared components and helpers.

React components use `PascalCase` file and export names, for example `ArticleCard.tsx`. Hooks and utilities use `camelCase`, for example `generateSlug.ts`. Keep database tables in `src/db/schema.ts` and generate SQL migrations into `drizzle/`.

## Data & CMS Patterns

Use `src/lib/custom-cms.ts` for public content fetchers such as `getPublishedPosts`, `getPostBySlug`, `getPageBySlug`, `getActiveCategories`, and taxonomy lookups. Normalize public data through helpers in `src/lib/cms.ts`, including `normalizePost`, `normalizeCategory`, `normalizeAuthor`, and rich text rendering helpers before passing content to UI components.

CMS server actions and admin mutations live in `src/lib/cms-admin.ts`. CMS auth/session helpers live in `src/lib/cms-auth.ts` and integrate with Better Auth where needed. Keep role checks, session handling, and mutation validation close to these helpers instead of duplicating them in pages.

Search integration lives in `src/lib/search.ts`. Prefer Meilisearch when enabled and keep SQL/database fallback behavior for local or degraded environments. Redis helpers and cache key definitions live in `src/lib/cache.ts`; use `CacheKeys` instead of hard-coded cache key strings.

## Auth

Better Auth is the primary auth system and is configured under `src/auth` plus `src/app/api/auth/[...all]`. The custom CMS login lives under `src/app/cms/login` and should continue to respect existing CMS session helpers and role checks.

If changing auth, access control, redirects, or cache invalidation, review the related helpers in `src/lib` and `src/auth`, then test both public and CMS behavior.

## Styling & UI

Tailwind CSS v4 and custom theme tokens are defined in `src/css/globals.css`. Keep visual changes consistent with the current news portal and CMS patterns. Public-facing pages should preserve the Poros Madura identity and readability; CMS pages should stay dense, practical, and admin-focused.

Logo behavior is centralized in the layout components. Header and footer should respect site settings and existing asset conventions.

## Testing Guidelines

No dedicated test runner is currently configured. Validate changes with `npm run lint` and `npm run build` where practical, usually through Docker:

- `docker compose exec app npm run lint`
- `docker compose exec app npm run build`

Manually check affected public pages, custom CMS workflows, auth paths, media upload/display, search, ads, and API routes. When adding automated tests, prefer colocated `*.test.ts` or `*.test.tsx` files near the code under test, and cover CMS actions, route handlers, and utility functions first.

## Commit & Pull Request Guidelines

The existing history mostly uses Conventional Commit style, such as `feat: add custom styles for theme and button interactions`. Continue with short prefixes like `feat:`, `fix:`, `chore:`, or `docs:` followed by a clear imperative summary.

Pull requests should include a concise description, linked issue or task when available, screenshots for UI/admin changes, and the commands run for verification.

## Security & Configuration Tips

Do not commit `.env`, generated secrets, database dumps, uploaded media, or local Docker volume data. Keep `BETTER_AUTH_SECRET`, OAuth credentials, database credentials, Redis URLs, and Meilisearch keys environment-specific.

Do not use `docker compose down -v` unless intentionally deleting local database, search, cache, and media volumes.
