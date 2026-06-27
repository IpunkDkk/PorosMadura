import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { eq } from "drizzle-orm";
import {
  adSlots,
  authors,
  categories,
  pages,
  posts,
  postTags,
  settings,
  tags,
  users,
} from "./schema";

function loadDotEnv() {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

    const [key, ...valueParts] = trimmed.split("=");
    if (!key || process.env[key] !== undefined) continue;

    const value = valueParts
      .join("=")
      .trim()
      .replace(/^['"]|['"]$/g, "");
    process.env[key] = value;
  }
}

loadDotEnv();

const [{ db }, { hashCmsPassword }, { auth }] = await Promise.all([
  import("./index"),
  import("../lib/cms-auth"),
  import("../auth/better-auth"),
]);

const now = Date.now();
const isProduction = process.env.NODE_ENV === "production";
const seedDemoContent = process.env.SEED_DEMO_CONTENT === "true";
const seedStaticPages = process.env.SEED_STATIC_PAGES !== "false";
const overwriteStaticPages = process.env.SEED_OVERWRITE_STATIC_PAGES === "true";
const seedAdSlots = process.env.SEED_AD_SLOTS !== "false";

function requireProductionValue(key: string) {
  const value = process.env[key]?.trim();
  if (!value && isProduction) {
    throw new Error(`${key} wajib diisi untuk production seed.`);
  }
  return value;
}

const seedCategories = [
  { name: "Nasional", order: 1 },
  { name: "Madura", order: 2 },
  { name: "Politik", order: 3 },
  { name: "Ekonomi", order: 4 },
  { name: "Olahraga", order: 5 },
  { name: "Teknologi", order: 6 },
  { name: "Lifestyle", order: 7 },
  { name: "Budaya", order: 8 },
  { name: "Viral", order: 9 },
  { name: "Daerah", order: 10 },
];

const seedAuthors = [
  {
    name: "Ahmad Fauzi",
    bio: "Jurnalis senior yang meliput isu pemerintahan dan infrastruktur Madura.",
  },
  {
    name: "Budi Santoso",
    bio: "Wartawan politik dengan fokus pemilu, parlemen, dan kebijakan publik.",
  },
  {
    name: "Siti Aminah",
    bio: "Reporter ekonomi lokal, UMKM, dan dinamika harga kebutuhan pokok.",
  },
  {
    name: "Hendra Gunawan",
    bio: "Koresponden olahraga dan komunitas sepak bola Madura.",
  },
  {
    name: "Zainal Abidin",
    bio: "Penulis budaya, tradisi, dan sejarah sosial masyarakat Madura.",
  },
  {
    name: "Rina Kumala",
    bio: "Jurnalis teknologi dan inovasi anak muda daerah.",
  },
];

const seedTags = [
  "Suramadu",
  "Pilkada",
  "UMKM",
  "Karapan Sapi",
  "Madura United",
  "Batik Madura",
  "Nelayan",
  "Pariwisata",
];

const seedPosts = [
  {
    title:
      "Jembatan Suramadu Akan Ditambah Jalur Khusus Logistik untuk Dorong Ekonomi Madura",
    category: "Madura",
    author: "Ahmad Fauzi",
    tags: ["Suramadu", "UMKM"],
    featured: true,
    breaking: true,
    views: 1420,
    hoursAgo: 2,
  },
  {
    title: "Menjelang Pilkada, Suhu Politik di Bangkalan Mulai Memanas",
    category: "Politik",
    author: "Budi Santoso",
    tags: ["Pilkada"],
    featured: true,
    breaking: true,
    views: 1160,
    hoursAgo: 3,
  },
  {
    title: "Harga Garam Anjlok, Petani Garam Sampang Minta Skema Perlindungan",
    category: "Ekonomi",
    author: "Siti Aminah",
    tags: ["UMKM"],
    featured: true,
    breaking: false,
    views: 980,
    hoursAgo: 5,
  },
  {
    title: "Madura United Targetkan Poin Penuh di Kandang Lawan",
    category: "Olahraga",
    author: "Hendra Gunawan",
    tags: ["Madura United"],
    featured: false,
    breaking: false,
    views: 875,
    hoursAgo: 6,
  },
  {
    title: "Festival Karapan Sapi Digelar Meriah, Ribuan Warga Padati Arena",
    category: "Budaya",
    author: "Zainal Abidin",
    tags: ["Karapan Sapi"],
    featured: false,
    breaking: false,
    views: 790,
    hoursAgo: 8,
  },
  {
    title: "Pemuda Pamekasan Ciptakan Aplikasi Pemasaran Batik Madura",
    category: "Teknologi",
    author: "Rina Kumala",
    tags: ["Batik Madura", "UMKM"],
    featured: false,
    breaking: false,
    views: 720,
    hoursAgo: 10,
  },
];

const defaultSlots = [
  {
    placement: "header_banner",
    label: "Header Banner",
    description: "Banner full-width di atas header",
  },
  {
    placement: "home_skyscraper_left",
    label: "Home Skyscraper Left",
    description: "Iklan vertikal di kiri konten homepage",
  },
  {
    placement: "home_skyscraper_right",
    label: "Home Skyscraper Right",
    description: "Iklan vertikal di kanan konten homepage",
  },
  {
    placement: "home_top_banner",
    label: "Homepage Top Banner",
    description: "Banner besar di bagian atas homepage",
  },
  {
    placement: "home_before_latest",
    label: "Homepage Before Latest",
    description: "Iklan sebelum bagian berita terbaru",
  },
  {
    placement: "home_middle_banner",
    label: "Homepage Middle Banner",
    description: "Banner di tengah daftar berita",
  },
  {
    placement: "home_sidebar_top",
    label: "Homepage Sidebar Top",
    description: "Sidebar kanan/kiri bagian atas",
  },
  {
    placement: "home_sidebar_bottom",
    label: "Homepage Sidebar Bottom",
    description: "Sidebar kanan/kiri bagian bawah",
  },
  {
    placement: "article_top",
    label: "Article Top",
    description: "Di bawah judul/gambar utama artikel",
  },
  {
    placement: "article_middle",
    label: "Article Middle",
    description: "Di tengah isi artikel",
  },
  {
    placement: "article_bottom",
    label: "Article Bottom",
    description: "Setelah isi artikel",
  },
  {
    placement: "article_sidebar",
    label: "Article Sidebar",
    description: "Sidebar artikel",
  },
  {
    placement: "category_top",
    label: "Category Top",
    description: "Banner atas halaman kategori",
  },
  {
    placement: "category_sidebar",
    label: "Category Sidebar",
    description: "Sidebar halaman kategori",
  },
  {
    placement: "mobile_sticky_bottom",
    label: "Mobile Sticky Bottom",
    description: "Iklan sticky bawah di mobile",
  },
  {
    placement: "mobile_article_middle",
    label: "Mobile Article Middle",
    description: "Iklan tengah artikel versi mobile",
  },
  {
    placement: "popup_campaign",
    label: "Popup Campaign",
    description: "Popup promosi/campaign",
  },
  {
    placement: "home_horizontal_ad",
    label: "Home Horizontal Ad",
    description: "Iklan horizontal lebar-rendah di bawah scroll section",
  },
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function richText(title: string, category: string) {
  const paragraphs = [
    `${title}. Redaksi PorosMadura merangkum perkembangan terbaru ini dari dinamika lapangan dan kebutuhan pembaca lokal.`,
    `Isu ${category.toLowerCase()} ini menjadi perhatian karena berdampak langsung pada aktivitas warga, pelaku usaha, dan pemerintah daerah.`,
    "Tim redaksi akan terus memperbarui informasi ketika ada keterangan resmi, data tambahan, atau respons dari pihak terkait.",
  ];

  return {
    root: {
      type: "root",
      version: 1,
      direction: "ltr",
      format: "",
      indent: 0,
      children: paragraphs.map((text) => ({
        type: "paragraph",
        version: 1,
        direction: "ltr",
        format: "",
        indent: 0,
        textFormat: 0,
        textStyle: "",
        children: [
          {
            type: "text",
            version: 1,
            text,
            format: 0,
            style: "",
            mode: "normal",
            detail: 0,
          },
        ],
      })),
    },
  };
}

async function seed() {
  console.log(
    `Running seed (${isProduction ? "production" : "development"}) with demo=${seedDemoContent}, staticPages=${seedStaticPages}, overwriteStaticPages=${overwriteStaticPages}, adSlots=${seedAdSlots}`,
  );

  const categoryMap = new Map<string, number>();
  for (const category of seedCategories) {
    const slug = slugify(category.name);
    const [row] = await db
      .insert(categories)
      .values({
        name: category.name,
        slug,
        description: `Berita terbaru seputar ${category.name}.`,
        order: category.order,
        isActive: true,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: categories.slug,
        set: {
          name: category.name,
          description: `Berita terbaru seputar ${category.name}.`,
          order: category.order,
          isActive: true,
          updatedAt: new Date(),
        },
      })
      .returning({ id: categories.id });
    categoryMap.set(category.name, row.id);
  }

  const authorMap = new Map<string, number>();
  const authorsToSeed = seedDemoContent
    ? seedAuthors
    : [
        {
          name: "Redaksi PorosMadura",
          bio: "Tim redaksi PorosMadura.",
        },
      ];
  for (const author of authorsToSeed) {
    const slug = slugify(author.name);
    const [row] = await db
      .insert(authors)
      .values({ ...author, slug, isActive: true, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: authors.slug,
        set: {
          name: author.name,
          bio: author.bio,
          isActive: true,
          updatedAt: new Date(),
        },
      })
      .returning({ id: authors.id });
    authorMap.set(author.name, row.id);
  }

  const tagMap = new Map<string, number>();
  const tagsToSeed = seedDemoContent ? seedTags : [];
  for (const tagName of tagsToSeed) {
    const slug = slugify(tagName);
    const [row] = await db
      .insert(tags)
      .values({
        name: tagName,
        slug,
        description: `Topik berita ${tagName}.`,
        isActive: true,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: tags.slug,
        set: {
          name: tagName,
          description: `Topik berita ${tagName}.`,
          isActive: true,
          updatedAt: new Date(),
        },
      })
      .returning({ id: tags.id });
    tagMap.set(tagName, row.id);
  }

  if (seedDemoContent) for (const post of seedPosts) {
    const slug = slugify(post.title);
    const categoryId = categoryMap.get(post.category);
    const authorId = authorMap.get(post.author);
    if (!categoryId || !authorId)
      throw new Error(`Missing relation for seeded post: ${post.title}`);

    const [row] = await db
      .insert(posts)
      .values({
        title: post.title,
        slug,
        excerpt: `Berita terbaru PorosMadura: ${post.title}`,
        content: richText(post.title, post.category),
        categoryId,
        authorId,
        status: "published",
        publishedAt: new Date(now - post.hoursAgo * 60 * 60 * 1000),
        isFeatured: post.featured,
        isBreakingNews: post.breaking,
        allowIndex: true,
        readingTime: 3,
        views: post.views,
        seoTitle: post.title,
        seoDescription: `Baca berita ${post.category.toLowerCase()} terbaru di PorosMadura: ${post.title}`,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: posts.slug,
        set: {
          title: post.title,
          excerpt: `Berita terbaru PorosMadura: ${post.title}`,
          content: richText(post.title, post.category),
          categoryId,
          authorId,
          status: "published",
          publishedAt: new Date(now - post.hoursAgo * 60 * 60 * 1000),
          isFeatured: post.featured,
          isBreakingNews: post.breaking,
          allowIndex: true,
          readingTime: 3,
          views: post.views,
          seoTitle: post.title,
          seoDescription: `Baca berita ${post.category.toLowerCase()} terbaru di PorosMadura: ${post.title}`,
          updatedAt: new Date(),
        },
      })
      .returning({ id: posts.id });

    await db.delete(postTags).where(eq(postTags.parentId, row.id));
    for (const tagName of post.tags) {
      const tagId = tagMap.get(tagName);
      if (!tagId) continue;
      await db.insert(postTags).values({
        parentId: row.id,
        path: "tags",
        tagId,
      });
    }
  }

  await db
    .insert(settings)
    .values({
      siteName: "PorosMadura",
      tagline: "Berita Tepat, Fakta Kuat",
      siteDescription:
        "Portal berita digital Madura yang menyajikan informasi cepat, akurat, dan kredibel.",
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      contactEmail: "redaksi@porosmadura.com",
      updatedAt: new Date(),
    })
    .onConflictDoNothing();

  const adminEmail = requireProductionValue("CMS_ADMIN_EMAIL") || "admin@porosmadura.local";
  const adminPassword = requireProductionValue("CMS_ADMIN_PASSWORD") || "admin12345";
  if (isProduction && adminPassword.length < 12) {
    throw new Error("CMS_ADMIN_PASSWORD production minimal 12 karakter.");
  }
  const adminName = "Admin PorosMadura";
  await db
    .insert(users)
    .values({
      name: adminName,
      email: adminEmail,
      role: "admin",
      isActive: true,
      ...hashCmsPassword(adminPassword),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoNothing();

  try {
    await auth.api.signUpEmail({
      body: {
        name: adminName,
        email: adminEmail,
        password: adminPassword,
      },
    });
  } catch {
    /* Better Auth account already exists. */
  }

  if (seedAdSlots) for (const slot of defaultSlots) {
    await db
      .insert(adSlots)
      .values({ ...slot, isActive: true, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: adSlots.placement,
        set: {
          label: slot.label,
          description: slot.description,
          isActive: true,
          updatedAt: new Date(),
        },
      });
  }

  const defaultPages = [
    {
      title: "Perusahaan",
      slug: "perusahaan",
      content: `<h1>Profil Perusahaan PorosMadura</h1><p>PorosMadura adalah media berita independen yang menyajikan informasi aktual, tepercaya, dan berimbang seputar Madura.</p><p>Kami berkomitmen menjadi jembatan informasi utama bagi warga Madura dan masyarakat luas.</p>`,
      status: "published",
      updatedAt: new Date(),
    },
    {
      title: "Tentang Kami",
      slug: "tentang-kami",
      content: `<h1>Tentang Kami</h1><p>PorosMadura berkomitmen untuk memberikan pemberitaan terbaik mengenai dinamika sosial, ekonomi, politik, dan budaya di wilayah Madura.</p><p>Didukung oleh jurnalis profesional di lapangan, kami berfokus pada akurasi dan kredibilitas informasi.</p>`,
      status: "published",
      updatedAt: new Date(),
    },
    {
      title: "Susunan Redaksi",
      slug: "susunan-redaksi",
      content: `<h1>Susunan Redaksi</h1><p><strong>Pemimpin Umum / Pemimpin Redaksi:</strong> Ipunk Dkk</p><p><strong>Redaktur Pelaksana:</strong> Tim PorosMadura</p><p><strong>Reporter:</strong> Kontributor PorosMadura di seluruh wilayah Kabupaten Madura (Bangkalan, Sampang, Pamekasan, Sumenep).</p>`,
      status: "published",
      updatedAt: new Date(),
    },
    {
      title: "Pedoman Media Siber",
      slug: "pedoman-media-siber",
      content: `<h1>Pedoman Pemberitaan Media Siber</h1><p>Kemerdekaan berpendapat, kemerdekaan berekspresi, dan kemerdekaan pers adalah hak asasi manusia yang dilindungi Pancasila, Undang-Undang Dasar 1945, dan Deklarasi Universal Hak Asasi Manusia PBB.</p><p>Dalam melaksanakan tugasnya jurnalis PorosMadura mematuhi undang-undang pers dan kode etik jurnalistik demi menjaga netralitas dan profesionalisme.</p>`,
      status: "published",
      updatedAt: new Date(),
    },
    {
      title: "Disclaimer",
      slug: "disclaimer",
      content: `<h1>Disclaimer</h1><p>Semua informasi di website PorosMadura diterbitkan dengan tujuan baik dan untuk informasi umum saja.</p><p>PorosMadura tidak bertanggung jawab atas segala kerugian dan/atau kerusakan sehubungan dengan penggunaan informasi di situs web kami.</p>`,
      status: "published",
      updatedAt: new Date(),
    },
    {
      title: "Kebijakan Privasi",
      slug: "kebijakan-privasi",
      content: `<h1>Kebijakan Privasi</h1><p>Kebijakan privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda ketika menggunakan layanan PorosMadura.</p><p>Kami berkomitmen menjaga kerahasiaan data pembaca kami sesuai dengan hukum perlindungan data yang berlaku.</p>`,
      status: "published",
      updatedAt: new Date(),
    },
    {
      title: "Kontak",
      slug: "kontak",
      content: `<h1>Kontak Kami</h1><p>Silakan hubungi redaksi PorosMadura melalui saluran komunikasi resmi berikut:</p><p><strong>Email:</strong> redaksi@porosmadura.com</p><p>Kami menerima kiriman rilis berita, opini, maupun saran dan kritik yang membangun.</p>`,
      status: "published",
      updatedAt: new Date(),
    },
  ];

  if (seedStaticPages) {
    for (const pageItem of defaultPages) {
      const insert = db.insert(pages).values(pageItem);
      if (overwriteStaticPages) {
        await insert.onConflictDoUpdate({
          target: pages.slug,
          set: {
            title: pageItem.title,
            content: pageItem.content,
            status: pageItem.status,
            updatedAt: new Date(),
          },
        });
      } else {
        await insert.onConflictDoNothing();
      }
    }
  }
}

seed()
  .then(() => {
    console.log("Custom CMS seed complete.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Custom CMS seed failed:", error);
    process.exit(1);
  });
