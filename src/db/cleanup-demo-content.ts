import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { eq, inArray } from 'drizzle-orm'
import { authors, posts, postTags, tags } from './schema'

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

const demoAuthorNames = [
  'Ahmad Fauzi',
  'Budi Santoso',
  'Siti Aminah',
  'Hendra Gunawan',
  'Zainal Abidin',
  'Rina Kumala',
]

const demoTagNames = [
  'Suramadu',
  'Pilkada',
  'UMKM',
  'Karapan Sapi',
  'Madura United',
  'Batik Madura',
  'Nelayan',
  'Pariwisata',
]

const redaksiAuthor = {
  name: 'Redaksi PorosMadura',
  slug: 'redaksi-porosmadura',
  bio: 'Tim redaksi PorosMadura.',
}

async function run() {
  const [redaksi] = await db
    .insert(authors)
    .values({ ...redaksiAuthor, isActive: true, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: authors.slug,
      set: {
        name: redaksiAuthor.name,
        bio: redaksiAuthor.bio,
        isActive: true,
        updatedAt: new Date(),
      },
    })
    .returning({ id: authors.id })

  const rows = await db
    .select({ id: posts.id, slug: posts.slug, title: posts.title })
    .from(posts)
    .where(inArray(posts.slug, demoSlugs))

  if (rows.length) {
    console.log('Deleting demo posts:')
    for (const row of rows) {
      console.log(`- ${row.id}: ${row.title} (${row.slug})`)
    }

    await db.delete(posts).where(inArray(posts.id, rows.map((row) => row.id)))
    await Promise.all(rows.map((row) => removePostFromIndex(String(row.id))))
    console.log(`Deleted ${rows.length} demo posts.`)
  } else {
    console.log('No demo posts found.')
  }

  const demoAuthors = await db
    .select({ id: authors.id, name: authors.name })
    .from(authors)
    .where(inArray(authors.name, demoAuthorNames))

  if (demoAuthors.length) {
    const demoAuthorIds = demoAuthors.map((author) => author.id)
    await db.update(posts)
      .set({ authorId: redaksi.id, updatedAt: new Date() })
      .where(inArray(posts.authorId, demoAuthorIds))
    await db.delete(authors).where(inArray(authors.id, demoAuthorIds))
    console.log(`Deleted ${demoAuthors.length} demo authors.`)
  } else {
    console.log('No demo authors found.')
  }

  const demoTags = await db
    .select({ id: tags.id, name: tags.name })
    .from(tags)
    .where(inArray(tags.name, demoTagNames))

  if (demoTags.length) {
    const demoTagIds = demoTags.map((tag) => tag.id)
    await db.delete(postTags).where(inArray(postTags.tagId, demoTagIds))
    await db.delete(tags).where(inArray(tags.id, demoTagIds))
    console.log(`Deleted ${demoTags.length} demo tags.`)
  } else {
    console.log('No demo tags found.')
  }

  await db.update(authors)
    .set({ isActive: true, updatedAt: new Date() })
    .where(eq(authors.id, redaksi.id))
}

run()
  .catch((error) => {
    console.error('Cleanup demo content failed:', error)
    process.exitCode = 1
  })
  .finally(() => {
    process.exit()
  })
