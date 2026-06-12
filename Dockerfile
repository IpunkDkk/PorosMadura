FROM node:22-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Patch: @better-auth/kysely-adapter imports DEFAULT_MIGRATION_* from "kysely"
# barrel, but kysely only exports them from "kysely/migration".
# Adding re-exports from migration module to the main barrel file.
RUN echo 'export { DEFAULT_MIGRATION_TABLE, DEFAULT_MIGRATION_LOCK_TABLE } from "./migration/migrator.js";' \
      >> /app/node_modules/kysely/dist/index.js

FROM base AS builder
ARG DATABASE_URI
ARG PAYLOAD_SECRET
ARG REDIS_URL
ARG NEXT_PUBLIC_SITE_URL
ARG BETTER_AUTH_SECRET
ARG BETTER_AUTH_URL
ARG MEILISEARCH_ENABLED
ARG MEILISEARCH_HOST
ARG MEILISEARCH_API_KEY
ENV DATABASE_URI=$DATABASE_URI \
    PAYLOAD_SECRET=$PAYLOAD_SECRET \
    REDIS_URL=$REDIS_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET \
    BETTER_AUTH_URL=$BETTER_AUTH_URL \
    MEILISEARCH_ENABLED=$MEILISEARCH_ENABLED \
    MEILISEARCH_HOST=$MEILISEARCH_HOST \
    MEILISEARCH_API_KEY=$MEILISEARCH_API_KEY \
    NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ARG DATABASE_URI
ARG PAYLOAD_SECRET
ARG REDIS_URL
ARG NEXT_PUBLIC_SITE_URL
ARG BETTER_AUTH_SECRET
ARG BETTER_AUTH_URL
ARG MEILISEARCH_ENABLED
ARG MEILISEARCH_HOST
ARG MEILISEARCH_API_KEY
ENV NODE_ENV=production \
    DATABASE_URI=$DATABASE_URI \
    PAYLOAD_SECRET=$PAYLOAD_SECRET \
    REDIS_URL=$REDIS_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET \
    BETTER_AUTH_URL=$BETTER_AUTH_URL \
    MEILISEARCH_ENABLED=$MEILISEARCH_ENABLED \
    MEILISEARCH_HOST=$MEILISEARCH_HOST \
    MEILISEARCH_API_KEY=$MEILISEARCH_API_KEY \
    NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir -p /app/public/media && \
    chown -R nextjs:nodejs /app
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Install tools for health check and seed script
RUN apk add --no-cache wget && \
    npm install -g tsx@^4.22.4

# Full node_modules needed for seed script (standalone output only has traced deps)
COPY --from=deps /app/node_modules ./node_modules

# Source files needed for npm run seed (tsx reads .ts sources at runtime)
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/src ./src
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json ./tsconfig.json

USER nextjs
EXPOSE 3000
ENV PORT 3000

HEALTHCHECK --interval=30s --timeout=10s --retries=5 --start-period=90s \
  CMD wget --spider http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
