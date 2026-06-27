import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { inArray } from 'drizzle-orm'
import { posts } from './schema'

function loadDotEnv() {
  const envPath = resolve(process.cwd(), '.env')
  if (!existsSync(envPath)) return

  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue

    const [key, ...valueParts] = trimmed.split('=')
    if (!key || process.env[key] !== undefined) continue

    process.env[key] = valueParts.join('=').trim().replace(/^['"]|['"]$/g, '')
  }
}

loadDotEnv()

const [{ db }, { removePostFromIndex }] = await Promise.all([
  import('./index'),
  import('../lib/search'),
])

const demoSlugs = [
  'jembatan-suramadu-akan-ditambah-jalur-khusus-logistik-untuk-dorong-ekonomi-madura',
  'menjelang-pilkada-suhu-politik-di-bangkalan-mulai-memanas',
  'harga-garam-anjlok-petani-garam-sampang-minta-skema-perlindungan',
  'madura-united-targetkan-poin-penuh-di-kandang-lawan',
  'festival-karapan-sapi-digelar-meriah-ribuan-warga-padati-arena',
  'pemuda-pamekasan-ciptakan-aplikasi-pemasaran-batik-madura',
]

async function run() {
  const rows = await db
    .select({ id: posts.id, slug: posts.slug, title: posts.title })
    .from(posts)
    .where(inArray(posts.slug, demoSlugs))

  if (!rows.length) {
    console.log('No demo posts found.')
    return
  }

  console.log('Deleting demo posts:')
  for (const row of rows) {
    console.log(`- ${row.id}: ${row.title} (${row.slug})`)
  }

  await db.delete(posts).where(inArray(posts.id, rows.map((row) => row.id)))
  await Promise.all(rows.map((row) => removePostFromIndex(String(row.id))))
  console.log(`Deleted ${rows.length} demo posts.`)
}

run()
  .catch((error) => {
    console.error('Cleanup demo content failed:', error)
    process.exitCode = 1
  })
  .finally(() => {
    process.exit()
  })
