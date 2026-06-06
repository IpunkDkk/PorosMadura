import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { sql } from 'drizzle-orm'
import * as schema from '../payload-generated-schema'

async function seed() {
  const connectionString = process.env.DATABASE_URI || 'postgres://porosmauser:porosmapass@localhost:5432/porosmadura'
  const queryClient = postgres(connectionString, { max: 1 })
  const db = drizzle(queryClient, { schema })

  console.log('Seeding with Drizzle...')

  // 1. Categories
  const cats = [
    { name: 'Nasional', order: 1 }, { name: 'Madura', order: 2 },
    { name: 'Politik', order: 3 }, { name: 'Ekonomi', order: 4 },
    { name: 'Olahraga', order: 5 }, { name: 'Teknologi', order: 6 },
    { name: 'Lifestyle', order: 7 }, { name: 'Budaya', order: 8 },
    { name: 'Viral', order: 9 }, { name: 'Daerah', order: 10 },
  ]
  for (const c of cats) {
    const slug = c.name.toLowerCase()
    const exist = await db.select({ id: schema.categories.id }).from(schema.categories).where(sql`${schema.categories.slug} = ${slug}`).limit(1)
    if (exist.length === 0) {
      await db.insert(schema.categories).values({ name: c.name, slug, description: 'Berita ' + c.name.toLowerCase(), order: c.order, isActive: true })
      console.log('Category:', c.name)
    }
  }

  // 2. Authors
  const authors = [
    { name: 'Ahmad Fauzi', bio: 'Jurnalis senior Madura.' },
    { name: 'Budi Santoso', bio: 'Wartawan politik.' },
    { name: 'Siti Aminah', bio: 'Reporter ekonomi.' },
    { name: 'Hendra Gunawan', bio: 'Koresponden olahraga.' },
    { name: 'Zainal Abidin', bio: 'Budayawan Madura.' },
    { name: 'Rina Kumala', bio: 'Jurnalis teknologi.' },
  ]
  for (const a of authors) {
    const slug = a.name.toLowerCase().replace(/\s+/g, '-')
    const exist = await db.select({ id: schema.authors.id }).from(schema.authors).where(sql`${schema.authors.slug} = ${slug}`).limit(1)
    if (exist.length === 0) {
      await db.insert(schema.authors).values({ name: a.name, slug, bio: a.bio, isActive: true })
      console.log('Author:', a.name)
    }
  }

  // 3. Posts
  const posts = [
    { title: 'Jembatan Suramadu Akan Ditambah Jalur Khusus Logistik untuk Dorong Ekonomi Madura', cat: 'Madura', author: 'Ahmad Fauzi', featured: true, hoursAgo: 2 },
    { title: 'Menjelang Pilkada, Suhu Politik di Bangkalan Mulai Memanas', cat: 'Politik', author: 'Budi Santoso', featured: true, hoursAgo: 3 },
    { title: 'Harga Garam Anjlok, Petani Garam Sampang Menjerit Minta Solusi', cat: 'Ekonomi', author: 'Siti Aminah', featured: true, hoursAgo: 5 },
    { title: 'Madura United Targetkan Poin Penuh di Kandang Lawan', cat: 'Olahraga', author: 'Hendra Gunawan', featured: false, hoursAgo: 6 },
    { title: 'Festival Karapan Sapi Digelar Megah Tahun Ini', cat: 'Budaya', author: 'Zainal Abidin', featured: false, hoursAgo: 8 },
    { title: 'Inovasi Pemuda Pamekasan Ciptakan Aplikasi Pemasaran Batik', cat: 'Teknologi', author: 'Rina Kumala', featured: false, hoursAgo: 10 },
    { title: 'Cuaca Ekstrem Melanda Perairan Utara, Nelayan Diminta Tunda Melaut', cat: 'Madura', author: 'Ahmad Fauzi', featured: false, hoursAgo: 12 },
    { title: 'Rekomendasi Kuliner Bebek Sinjay yang Melegenda', cat: 'Lifestyle', author: 'Siti Aminah', featured: false, hoursAgo: 14 },
    { title: 'KPU Sumenep Pastikan Logistik Pemilu Aman Terkendali', cat: 'Nasional', author: 'Budi Santoso', featured: false, hoursAgo: 16 },
    { title: 'Investor Asing Mulai Lirik Potensi Pariwisata Gili Iyang', cat: 'Ekonomi', author: 'Ahmad Fauzi', featured: false, hoursAgo: 20 },
  ]

  for (const p of posts) {
    const slug = p.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
    const exist = await db.select({ id: schema.posts.id }).from(schema.posts).where(sql`${schema.posts.slug} = ${slug}`).limit(1)
    if (exist.length > 0) continue

    const [cat] = await db.select({ id: schema.categories.id }).from(schema.categories).where(sql`${schema.categories.slug} = ${p.cat.toLowerCase()}`).limit(1)
    const [auth] = await db.select({ id: schema.authors.id }).from(schema.authors).where(sql`${schema.authors.slug} = ${p.author.toLowerCase().replace(/\s+/g, '-')}`).limit(1)
    if (!cat || !auth) continue

    await db.insert(schema.posts).values({
      title: p.title, slug,
      excerpt: 'Berita terbaru: ' + p.title,
      content: { root: { type: 'root', version: 1, direction: 'ltr', children: [] } },
      category: cat.id, author: auth.id,
      status: 'published',
      publishedAt: new Date(Date.now() - p.hoursAgo * 3600000).toISOString(),
      isFeatured: p.featured, isBreakingNews: p.hoursAgo < 4,
      allowIndex: true, readingTime: 3, views: 500,
    })
    console.log('Post:', p.title.substring(0, 50))
  }

  console.log('Seed complete!')
  await queryClient.end()
}

seed().catch((e) => { console.error('FAILED:', e); process.exit(1) })
