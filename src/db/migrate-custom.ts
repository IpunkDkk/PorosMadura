import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URI || 'postgres://porosmadura:porosmadura@localhost:5435/porosmadura'
const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), '../../drizzle')

const sql = postgres(connectionString, { max: 1, onnotice: () => {} })

function hashSql(sqlText: string) {
  return createHash('sha256').update(sqlText).digest('hex')
}

function escapeLiteral(value: string) {
  return value.replaceAll("'", "''")
}

function makeStatementIdempotent(statement: string) {
  const trimmed = statement.trim().replace(/;+\s*$/, '')
  if (!trimmed) return null

  if (/^CREATE TABLE\s+"/i.test(trimmed)) {
    return trimmed.replace(/^CREATE TABLE\s+"/i, 'CREATE TABLE IF NOT EXISTS "')
  }

  const constraintMatch = trimmed.match(/^ALTER TABLE\s+"[^"]+"\s+ADD CONSTRAINT\s+"([^"]+)"\s+/i)
  if (constraintMatch) {
    const constraintName = escapeLiteral(constraintMatch[1])

    return `
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = '${constraintName}'
  ) THEN
    ${trimmed};
  END IF;
END $$`
  }

  return trimmed
}

async function run() {
  await sql`
    CREATE TABLE IF NOT EXISTS custom_migrations (
      id serial PRIMARY KEY,
      filename text NOT NULL UNIQUE,
      hash text NOT NULL,
      applied_at timestamp DEFAULT now() NOT NULL
    )
  `

  const files = (await readdir(migrationsDir))
    .filter((file) => file.endsWith('.sql'))
    .sort()

  if (files.length === 0) {
    console.log('No SQL migrations found.')
    return
  }

  for (const filename of files) {
    const sqlText = await readFile(join(migrationsDir, filename), 'utf8')
    const hash = hashSql(sqlText)
    const existing = await sql<{ hash: string }[]>`
      SELECT hash FROM custom_migrations WHERE filename = ${filename} LIMIT 1
    `

    if (existing[0]) {
      if (existing[0].hash !== hash) {
        throw new Error(`Migration ${filename} was already applied with a different hash.`)
      }

      console.log(`Skipped ${filename}`)
      continue
    }

    const statements = sqlText
      .split('--> statement-breakpoint')
      .map(makeStatementIdempotent)
      .filter((statement): statement is string => Boolean(statement))

    await sql.begin(async (tx) => {
      for (const statement of statements) {
        await tx.unsafe(statement)
      }

      await tx`
        INSERT INTO custom_migrations (filename, hash)
        VALUES (${filename}, ${hash})
      `
    })

    console.log(`Applied ${filename}`)
  }
}

run()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await sql.end()
  })
