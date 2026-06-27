# Repository Guidelines

## Project Structure & Module Organization

This repository is a Next.js 15 application with a custom CMS backed by Drizzle and PostgreSQL. Application code lives in `src/`. Public routes use the App Router under `src/app/(public)`, custom CMS routes are under `src/app/cms`, and legacy redirects/API stubs are under `src/app/(legacy-cms)`. Database schema and seed scripts are in `src/db`, reusable UI in `src/components`, and cross-cutting helpers in `src/lib`. Global styles are in `src/css/globals.css`; static assets are in `public/`, with brand/source images in `img/`. Project planning notes live in `docs/superpowers`.

## Build, Test, and Development Commands

- `docker compose up -d`: start the local development stack (app, postgres, redis, meilisearch).
- `docker compose up --build`: build and run the full stack in the foreground.
- `docker compose exec app npm run seed`: seed the database inside the container.
- `docker compose exec app npm run migrate`: run database migrations inside the container.
- `docker compose exec app npm run lint`: run Next.js lint checks inside the container.

Copy `.env.example` to `.env` before local development and keep secrets out of commits.

## Coding Style & Naming Conventions

Use TypeScript with `strict` mode and the `@/*` import alias for files under `src/`. Follow the existing style: two-space indentation, single quotes, no semicolons, and named exports for shared components and helpers. React components use `PascalCase` file and export names, for example `ArticleCard.tsx`; hooks and utilities use `camelCase`, for example `generateSlug.ts`. Keep database tables in `src/db/schema.ts` and generate SQL migrations into `drizzle/`.

## Testing Guidelines

No test runner is currently configured. For now, validate changes with `npm run lint` and `npm run build`, and manually check affected public pages, custom CMS workflows, and API routes. When adding automated tests, prefer colocated `*.test.ts` or `*.test.tsx` files near the code under test, and cover CMS actions, route handlers, and utility functions first.

## Commit & Pull Request Guidelines

The existing history mostly uses Conventional Commit style, such as `feat: add custom styles for theme and button interactions`. Continue with short prefixes like `feat:`, `fix:`, `chore:`, or `docs:` followed by a clear imperative summary. Pull requests should include a concise description, linked issue or task when available, screenshots for UI/admin changes, and the commands run for verification.

## Security & Configuration Tips

Do not commit `.env`, generated secrets, database dumps, or uploaded media. Keep `CMS_SESSION_SECRET`, `BETTER_AUTH_SECRET`, OAuth credentials, database credentials, and Meilisearch keys environment-specific. If changing auth, access control, redirects, or cache invalidation, review the related helpers in `src/lib` and `src/auth` and test both public and CMS behavior.
