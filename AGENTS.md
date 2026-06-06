# Repository Guidelines

## Project Structure & Module Organization

This repository is a Next.js 15 application with Payload CMS 3. Application code lives in `src/`. Public routes use the App Router under `src/app/(public)`, while Payload admin/API routes are under `src/app/(payload)`. CMS schemas are in `src/collections`, shared hooks in `src/hooks`, reusable UI in `src/components`, and cross-cutting helpers in `src/lib`. Global styles are in `src/css/globals.css`; static assets are in `public/`, with brand/source images in `img/`. Project planning notes live in `docs/superpowers`.

## Build, Test, and Development Commands

- `npm run dev`: start the local Next.js development server.
- `npm run build`: build the production app and run Next/Payload compile checks.
- `npm run start`: serve the built app.
- `npm run lint`: run the configured Next.js lint command.
- `docker compose up -d postgres redis meilisearch`: start local service dependencies.
- `docker compose up --build`: build and run the full stack, including the app container.

Copy `.env.example` to `.env` before local development and keep secrets out of commits.

## Coding Style & Naming Conventions

Use TypeScript with `strict` mode and the `@/*` import alias for files under `src/`. Follow the existing style: two-space indentation, single quotes, no semicolons, and named exports for shared components and helpers. React components use `PascalCase` file and export names, for example `ArticleCard.tsx`; hooks and utilities use `camelCase`, for example `generateSlug.ts`. Keep Payload collections plural and capitalized in `src/collections`.

## Testing Guidelines

No test runner is currently configured. For now, validate changes with `npm run lint` and `npm run build`, and manually check affected public pages, Payload admin workflows, and API routes. When adding automated tests, prefer colocated `*.test.ts` or `*.test.tsx` files near the code under test, and cover collection hooks, route handlers, and utility functions first.

## Commit & Pull Request Guidelines

The existing history mostly uses Conventional Commit style, such as `feat: add custom styles for theme and button interactions`. Continue with short prefixes like `feat:`, `fix:`, `chore:`, or `docs:` followed by a clear imperative summary. Pull requests should include a concise description, linked issue or task when available, screenshots for UI/admin changes, and the commands run for verification.

## Security & Configuration Tips

Do not commit `.env`, generated secrets, database dumps, or uploaded media. Keep `PAYLOAD_SECRET`, `BETTER_AUTH_SECRET`, database credentials, and Meilisearch keys environment-specific. If changing auth, access control, redirects, or cache invalidation, review the related hooks in `src/hooks` and test both public and admin behavior.
