FROM node:22-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS dev
RUN apk add --no-cache libc6-compat wget
WORKDIR /app
ENV NODE_ENV=development \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json* ./
EXPOSE 3000
ENV PORT=3000
CMD ["npm", "run", "dev"]

FROM base AS builder
ARG DATABASE_URI
ARG REDIS_URL
ARG NEXT_PUBLIC_SITE_URL
ARG BETTER_AUTH_SECRET
ARG BETTER_AUTH_URL
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG MEILISEARCH_ENABLED
ARG MEILISEARCH_HOST
ARG MEILISEARCH_API_KEY
ENV DATABASE_URI=$DATABASE_URI \
    REDIS_URL=$REDIS_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET \
    BETTER_AUTH_URL=$BETTER_AUTH_URL \
    GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID \
    GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET \
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
ARG REDIS_URL
ARG NEXT_PUBLIC_SITE_URL
ARG BETTER_AUTH_SECRET
ARG BETTER_AUTH_URL
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG MEILISEARCH_ENABLED
ARG MEILISEARCH_HOST
ARG MEILISEARCH_API_KEY
ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    DATABASE_URI=$DATABASE_URI \
    REDIS_URL=$REDIS_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET \
    BETTER_AUTH_URL=$BETTER_AUTH_URL \
    GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID \
    GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET \
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
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Install tools for health check and privilege drop after fixing mounted volume ownership
RUN apk add --no-cache wget su-exec

# Source files needed for npm run seed (tsx reads .ts sources at runtime)
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/src ./src
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json ./tsconfig.json
COPY --from=builder --chown=nextjs:nodejs /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle

EXPOSE 3000
ENV PORT=3000

HEALTHCHECK --interval=30s --timeout=10s --retries=5 --start-period=90s \
  CMD wget --spider http://127.0.0.1:3000/api/health || exit 1

CMD ["sh", "-c", "chown -R nextjs:nodejs /app/public/media && exec su-exec nextjs:nodejs node server.js"]
