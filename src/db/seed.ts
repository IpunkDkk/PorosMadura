import nextEnv from '@next/env'
import { getPayload } from 'payload'
import postgres from 'postgres'

const { loadEnvConfig } = nextEnv

loadEnvConfig(process.cwd())
process.env.REDIS_URL = ''

const now = Date.now()

const categories = [
  { name: 'Nasional', order: 1 },
  { name: 'Madura', order: 2 },
  { name: 'Politik', order: 3 },
  { name: 'Ekonomi', order: 4 },
  { name: 'Olahraga', order: 5 },
  { name: 'Teknologi', order: 6 },
  { name: 'Lifestyle', order: 7 },
  { name: 'Budaya', order: 8 },
  { name: 'Viral', order: 9 },
  { name: 'Daerah', order: 10 },
]

const authors = [
  { name: 'Ahmad Fauzi', bio: 'Jurnalis senior yang meliput isu pemerintahan dan infrastruktur Madura.' },
  { name: 'Budi Santoso', bio: 'Wartawan politik dengan fokus pemilu, parlemen, dan kebijakan publik.' },
  { name: 'Siti Aminah', bio: 'Reporter ekonomi lokal, UMKM, dan dinamika harga kebutuhan pokok.' },
  { name: 'Hendra Gunawan', bio: 'Koresponden olahraga dan komunitas sepak bola Madura.' },
  { name: 'Zainal Abidin', bio: 'Penulis budaya, tradisi, dan sejarah sosial masyarakat Madura.' },
  { name: 'Rina Kumala', bio: 'Jurnalis teknologi dan inovasi anak muda daerah.' },
]

const tags = [
  'Suramadu',
  'Pilkada',
  'UMKM',
  'Karapan Sapi',
  'Madura United',
  'Batik Madura',
  'Nelayan',
  'Pariwisata',
]

const posts = [
  {
    title: 'Jembatan Suramadu Akan Ditambah Jalur Khusus Logistik untuk Dorong Ekonomi Madura',
    cat: 'Madura',
    author: 'Ahmad Fauzi',
    tags: ['Suramadu', 'UMKM'],
    featured: true,
    breaking: true,
    views: 1420,
    hoursAgo: 2,
  },
  {
    title: 'Menjelang Pilkada, Suhu Politik di Bangkalan Mulai Memanas',
    cat: 'Politik',
    author: 'Budi Santoso',
    tags: ['Pilkada'],
    featured: true,
    breaking: true,
    views: 1160,
    hoursAgo: 3,
  },
  {
    title: 'Harga Garam Anjlok, Petani Garam Sampang Minta Skema Perlindungan',
    cat: 'Ekonomi',
    author: 'Siti Aminah',
    tags: ['UMKM'],
    featured: true,
    breaking: false,
    views: 980,
    hoursAgo: 5,
  },
  {
    title: 'Madura United Targetkan Poin Penuh di Kandang Lawan',
    cat: 'Olahraga',
    author: 'Hendra Gunawan',
    tags: ['Madura United'],
    featured: false,
    breaking: false,
    views: 875,
    hoursAgo: 6,
  },
  {
    title: 'Festival Karapan Sapi Digelar Meriah, Ribuan Warga Padati Arena',
    cat: 'Budaya',
    author: 'Zainal Abidin',
    tags: ['Karapan Sapi'],
    featured: false,
    breaking: false,
    views: 790,
    hoursAgo: 8,
  },
  {
    title: 'Pemuda Pamekasan Ciptakan Aplikasi Pemasaran Batik Madura',
    cat: 'Teknologi',
    author: 'Rina Kumala',
    tags: ['Batik Madura', 'UMKM'],
    featured: false,
    breaking: false,
    views: 720,
    hoursAgo: 10,
  },
  {
    title: 'Cuaca Ekstrem Melanda Perairan Utara, Nelayan Diminta Tunda Melaut',
    cat: 'Daerah',
    author: 'Ahmad Fauzi',
    tags: ['Nelayan'],
    featured: false,
    breaking: false,
    views: 690,
    hoursAgo: 12,
  },
  {
    title: 'Rekomendasi Kuliner Bebek Sinjay yang Melegenda di Bangkalan',
    cat: 'Lifestyle',
    author: 'Siti Aminah',
    tags: ['Pariwisata'],
    featured: false,
    breaking: false,
    views: 640,
    hoursAgo: 14,
  },
  {
    title: 'KPU Sumenep Pastikan Distribusi Logistik Pemilu Aman Terkendali',
    cat: 'Nasional',
    author: 'Budi Santoso',
    tags: ['Pilkada'],
    featured: false,
    breaking: false,
    views: 580,
    hoursAgo: 16,
  },
  {
    title: 'Investor Mulai Lirik Potensi Pariwisata Gili Iyang',
    cat: 'Ekonomi',
    author: 'Ahmad Fauzi',
    tags: ['Pariwisata', 'UMKM'],
    featured: false,
    breaking: false,
    views: 530,
    hoursAgo: 20,
  },
]

const legacyPostTitles = [
  'Harga Garam Anjlok, Petani Garam Sampang Menjerit Minta Solusi',
  'Festival Karapan Sapi Digelar Megah Tahun Ini',
  'Inovasi Pemuda Pamekasan Ciptakan Aplikasi Pemasaran Batik',
  'Rekomendasi Kuliner Bebek Sinjay yang Melegenda',
  'KPU Sumenep Pastikan Logistik Pemilu Aman Terkendali',
  'Investor Asing Mulai Lirik Potensi Pariwisata Gili Iyang',
]

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function richText(title: string, category: string) {
  const paragraphs = [
    `${title}. Redaksi PorosMadura merangkum perkembangan terbaru ini dari dinamika lapangan dan kebutuhan pembaca lokal.`,
    `Isu ${category.toLowerCase()} ini menjadi perhatian karena berdampak langsung pada aktivitas warga, pelaku usaha, dan pemerintah daerah.`,
    'Tim redaksi akan terus memperbarui informasi ketika ada keterangan resmi, data tambahan, atau respons dari pihak terkait.',
  ]

  return {
    root: {
      type: 'root',
      version: 1,
      direction: 'ltr',
      format: '',
      indent: 0,
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        version: 1,
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        children: [
          {
            type: 'text',
            version: 1,
            text,
            format: 0,
            style: '',
            mode: 'normal',
            detail: 0,
          },
        ],
      })),
    },
  }
}

async function upsertBySlug<T extends 'categories' | 'authors' | 'tags'>(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: T,
  slug: string,
  data: Record<string, unknown>,
) {
  const existing = await payload.find({
    collection,
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: slug } },
  })

  if (existing.docs[0]) {
    const doc = await payload.update({
      collection,
      id: existing.docs[0].id,
      data,
      overrideAccess: true,
    })
    console.log(`Updated ${collection}: ${slug}`)
    return doc
  }

  const doc = await payload.create({
    collection,
    data,
    overrideAccess: true,
  })
  console.log(`Created ${collection}: ${slug}`)
  return doc
}

async function deletePostRowBySlug(sql: postgres.Sql, slug: string) {
  await sql`delete from posts where slug = ${slug}`
}

async function deleteSeedPostRows(sql: postgres.Sql) {
  const slugs = [
    ...posts.map((post) => slugify(post.title)),
    ...legacyPostTitles.map(slugify),
  ]

  await sql`
    delete from posts
    where slug in ${sql(slugs)}
      or (slug is null and title is null)
  `
}

async function markPostAsPayloadPublished(sql: postgres.Sql, id: number | string) {
  await sql`
    update posts
    set _status = 'published'
    where id = ${id}
  `
}

async function seed() {
  const databaseURI = process.env.DATABASE_URI
  if (!databaseURI) {
    throw new Error('DATABASE_URI is required to run the seed script.')
  }

  const sql = postgres(databaseURI, { max: 1 })
  const { default: config } = await import('../payload.config')
  const payload = await getPayload({ config })

  console.log('Seeding Payload CMS content...')

  const categoryMap = new Map<string, number>()
  for (const category of categories) {
    const slug = slugify(category.name)
    const doc = await upsertBySlug(payload, 'categories', slug, {
      name: category.name,
      slug,
      description: `Berita terbaru seputar ${category.name}.`,
      order: category.order,
      isActive: true,
    })
    categoryMap.set(category.name, Number(doc.id))
  }

  const authorMap = new Map<string, number>()
  for (const author of authors) {
    const slug = slugify(author.name)
    const doc = await upsertBySlug(payload, 'authors', slug, {
      ...author,
      slug,
      isActive: true,
    })
    authorMap.set(author.name, Number(doc.id))
  }

  const tagMap = new Map<string, number>()
  for (const tag of tags) {
    const slug = slugify(tag)
    const doc = await upsertBySlug(payload, 'tags', slug, {
      name: tag,
      slug,
      description: `Topik berita ${tag}.`,
      isActive: true,
    })
    tagMap.set(tag, Number(doc.id))
  }

  await deleteSeedPostRows(sql)

  for (const post of posts) {
    const slug = slugify(post.title)
    const categoryID = categoryMap.get(post.cat)
    const authorID = authorMap.get(post.author)
    const tagIDs = post.tags.map((tag) => tagMap.get(tag)).filter(Boolean)

    if (!categoryID || !authorID) {
      throw new Error(`Missing relation for seeded post: ${post.title}`)
    }

    await deletePostRowBySlug(sql, slug)

    const createdPost = await payload.create({
      collection: 'posts',
      context: { skipSearchSync: true },
      draft: false,
      overrideAccess: true,
      data: {
        title: post.title,
        slug,
        excerpt: `Berita terbaru PorosMadura: ${post.title}`,
        content: richText(post.title, post.cat),
        category: categoryID,
        author: authorID,
        tags: tagIDs,
        status: 'published',
        publishedAt: new Date(now - post.hoursAgo * 60 * 60 * 1000).toISOString(),
        isFeatured: post.featured,
        isBreakingNews: post.breaking,
        allowIndex: true,
        readingTime: 3,
        views: post.views,
        seoTitle: post.title,
        seoDescription: `Baca berita ${post.cat.toLowerCase()} terbaru di PorosMadura: ${post.title}`,
      },
    })
    await markPostAsPayloadPublished(sql, createdPost.id)

    console.log(`Created post: ${slug}`)
  }

  console.log('Seed complete.')
  await sql.end()
  await payload.destroy()
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
