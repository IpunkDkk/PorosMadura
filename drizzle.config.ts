import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/payload-generated-schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URI || 'postgres://porosmauser:porosmapass@localhost:5432/porosmadura',
  },
})
