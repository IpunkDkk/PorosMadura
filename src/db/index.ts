import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URI || 'postgres://porosmadura:porosmadura@localhost:5435/porosmadura'

// For Next.js hot-reloading and connection pooling
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined
}

const conn = globalForDb.conn ?? postgres(connectionString)
if (process.env.NODE_ENV !== 'production') globalForDb.conn = conn

export const db = drizzle(conn, { schema })
