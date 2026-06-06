# PRD — PorosMadura News Platform

## 1. Ringkasan Produk

### 1.1 Nama Produk

**PorosMadura**

### 1.2 Tagline

**Berita Tepat, Fakta Kuat**

### 1.3 Deskripsi Produk

PorosMadura adalah platform website berita modern yang dirancang untuk menyajikan informasi secara cepat, akurat, kredibel, dan mudah diakses oleh pembaca. Platform ini memiliki CMS internal untuk tim redaksi, sistem publikasi artikel, kategori, tag, author, pencarian berita, optimasi SEO, sitemap, RSS feed, dan structured data untuk mendukung indexing mesin pencari.

Platform ini dibangun menggunakan stack:

```txt
Next.js App Router
Payload CMS
PostgreSQL
Local Storage first
Redis
Meilisearch
Cloudflare CDN-ready
Cloudflare R2 / S3-ready
```

### 1.4 Tujuan Produk

Membangun website berita yang:

* SEO-friendly.
* Cepat diakses di desktop dan mobile.
* Mudah digunakan oleh admin, editor, dan penulis.
* Mendukung workflow editorial.
* Mendukung upload media lokal terlebih dahulu.
* Siap migrasi ke Cloudflare R2 / S3 tanpa rombak besar.
* Mendukung CDN untuk performa lebih baik.
* Memiliki search berita cepat menggunakan Meilisearch.
* Memiliki fondasi teknis yang scalable untuk jangka panjang.

---

## 2. Brand Identity

### 2.1 Nama Brand

**PorosMadura**

### 2.2 Tagline Brand

**Berita Tepat, Fakta Kuat**

### 2.3 Karakter Brand

PorosMadura memiliki karakter brand:

* Kredibel
* Tegas
* Informatif
* Modern
* Lokal
* Profesional
* Mudah dipercaya

### 2.4 Brand Positioning

PorosMadura diposisikan sebagai media berita digital yang fokus pada kecepatan informasi, ketepatan berita, dan kekuatan fakta. Brand ini cocok untuk portal berita lokal Madura yang tetap memiliki potensi berkembang ke cakupan regional maupun nasional.

### 2.5 Logo Usage

Logo PorosMadura terdiri dari:

* Simbol huruf **P**
* Wordmark **PorosMadura**
* Tagline **Berita Tepat, Fakta Kuat**

Aturan penggunaan logo:

* Logo utama digunakan di header website.
* Simbol logo digunakan untuk favicon dan app icon.
* Logo horizontal digunakan untuk desktop header.
* Logo compact digunakan untuk mobile header.
* Logo digunakan di halaman login CMS.
* Logo digunakan pada default Open Graph image.
* Dilarang mengubah proporsi logo.
* Dilarang mengganti warna logo di luar brand palette tanpa kebutuhan khusus.

---

## 3. Color Palette

### 3.1 Primary Colors

| Nama Warna  |       Hex | Fungsi                                             |
| ----------- | --------: | -------------------------------------------------- |
| Poros Navy  | `#0C2A51` | Warna utama brand, header, footer, title, navbar   |
| Poros Red   | `#C61E21` | CTA, breaking news, badge, highlight, active state |
| Poros White | `#F6F6F6` | Background terang utama                            |

### 3.2 Secondary Colors

| Nama Warna |       Hex | Fungsi                                    |
| ---------- | --------: | ----------------------------------------- |
| Slate Blue | `#627389` | Teks sekunder, metadata, icon             |
| Soft Slate | `#95A0AE` | Border, divider, caption                  |
| Soft Red   | `#CF5D61` | Hover merah, alert ringan, aksen sekunder |

### 3.3 Neutral Colors

| Nama Warna      |       Hex | Fungsi                        |
| --------------- | --------: | ----------------------------- |
| Text Primary    | `#111827` | Isi artikel dan heading gelap |
| Text Secondary  | `#4B5563` | Metadata dan deskripsi        |
| Border Light    | `#E5E7EB` | Border card, input, divider   |
| Surface         | `#FFFFFF` | Card, modal, form             |
| Page Background | `#F9FAFB` | Background halaman umum       |

### 3.4 Color Usage Guidelines

Distribusi warna:

```txt
60% neutral / white background
30% Poros Navy
10% Poros Red
```

Penggunaan:

* Header utama menggunakan `#0C2A51`.
* Footer menggunakan `#0C2A51`.
* Breaking news menggunakan `#C61E21`.
* Tombol utama menggunakan `#C61E21`.
* Link hover menggunakan `#C61E21`.
* Judul section menggunakan `#0C2A51`.
* Body artikel menggunakan `#111827`.
* Metadata menggunakan `#4B5563`.

---

## 4. Typography

### 4.1 Rekomendasi Font

Rekomendasi utama:

```txt
Heading: Merriweather
Body: Inter
```

### 4.2 Alasan Pemilihan

**Merriweather** cocok untuk judul berita karena memberi kesan editorial, serius, dan terpercaya.

**Inter** cocok untuk body text karena modern, bersih, mudah dibaca, dan nyaman untuk tampilan mobile.

### 4.3 Font Usage

| Elemen          | Font                |
| --------------- | ------------------- |
| Logo wordmark   | Mengikuti file logo |
| Heading artikel | Merriweather        |
| Judul section   | Merriweather        |
| Body artikel    | Inter               |
| Metadata        | Inter               |
| Button          | Inter               |
| Admin CMS       | Inter               |

---

## 5. Target Pengguna

### 5.1 Pembaca

Pembaca adalah user publik yang mengakses website PorosMadura.

Kebutuhan:

* Membaca berita terbaru.
* Membaca berita berdasarkan kategori.
* Mencari berita berdasarkan keyword.
* Membaca berita terkait.
* Membagikan berita ke media sosial.
* Mengakses website dengan cepat di mobile.

### 5.2 Author / Penulis

User internal yang bertugas membuat artikel.

Kebutuhan:

* Membuat draft artikel.
* Upload gambar.
* Mengisi judul, isi, excerpt, kategori, tag, dan author.
* Mengisi SEO title dan SEO description.
* Submit artikel ke editor untuk review.

### 5.3 Editor

User internal yang bertugas meninjau dan mempublikasikan artikel.

Kebutuhan:

* Review artikel dari author.
* Edit artikel.
* Publish artikel.
* Schedule artikel.
* Mengatur artikel featured.
* Mengatur breaking news.
* Mengarsipkan artikel.

### 5.4 Admin

User internal dengan akses penuh.

Kebutuhan:

* Mengelola user.
* Mengelola role.
* Mengelola artikel.
* Mengelola kategori.
* Mengelola tag.
* Mengelola author.
* Mengelola media.
* Mengelola halaman statis.
* Mengelola redirect.
* Mengelola setting website.
* Mengelola cache dan search index.

---

## 6. Scope Produk

### 6.1 In Scope MVP

Fitur yang masuk MVP:

* Website publik PorosMadura.
* CMS admin berbasis Payload CMS.
* Login admin.
* Role: Admin, Editor, Author.
* CRUD artikel.
* CRUD kategori.
* CRUD tag.
* CRUD author.
* CRUD media.
* CRUD halaman statis.
* CRUD redirect.
* Global website settings.
* Upload media lokal.
* Homepage berita.
* Detail artikel.
* Halaman kategori.
* Halaman tag.
* Halaman author.
* Search page.
* Draft, review, scheduled, published, archived status.
* Featured article.
* Breaking news.
* Related posts.
* SEO metadata.
* Open Graph metadata.
* JSON-LD NewsArticle schema.
* Sitemap.
* News sitemap.
* RSS feed.
* Robots.txt.
* Redis cache dasar.
* Meilisearch untuk pencarian berita.
* Storage lokal yang siap diganti ke R2/S3.
* Cloudflare CDN-ready.
* Docker Compose untuk development dan production awal.

### 6.2 Out of Scope MVP

Tidak masuk MVP:

* Mobile app.
* Komentar pembaca.
* Membership.
* Paywall.
* Newsletter otomatis.
* Push notification.
* AI article generator.
* Multi-language.
* Multi-site.
* AMP.
* Live blogging.
* Advanced analytics.
* Video streaming internal.
* Sistem iklan kompleks.
* User reader account.

---

## 7. Tech Stack

### 7.1 Frontend

```txt
Next.js App Router
React
TypeScript
Tailwind CSS
```

Fungsi:

* Render website publik.
* Generate metadata dinamis.
* Generate sitemap.
* Generate RSS feed.
* Render halaman artikel, kategori, tag, author, search.
* Optimasi gambar.
* Server-side rendering / static rendering sesuai kebutuhan.

### 7.2 CMS

```txt
Payload CMS
```

Fungsi:

* Admin panel.
* Collection management.
* Auth.
* Role-based access.
* Upload media.
* Editorial workflow.
* API konten.

### 7.3 Database

```txt
PostgreSQL
```

Fungsi:

* Menyimpan artikel.
* Menyimpan kategori.
* Menyimpan tag.
* Menyimpan author.
* Menyimpan user.
* Menyimpan media metadata.
* Menyimpan halaman statis.
* Menyimpan redirect.
* Menyimpan setting website.

### 7.4 Storage

Fase awal:

```txt
Local Storage
```

Target future-ready:

```txt
Cloudflare R2
S3-compatible storage
Cloudflare CDN
```

Prinsip:

* MVP memakai local storage.
* Media disimpan sebagai relasi ke Media Collection.
* Frontend tidak boleh hardcode path media.
* Semua URL media harus lewat helper.
* Nanti bisa pindah ke R2/S3 dengan mengganti adapter dan env.

### 7.5 Cache

```txt
Redis
```

Fungsi:

* Cache homepage.
* Cache kategori.
* Cache tag.
* Cache author.
* Cache artikel populer.
* View counter sementara.
* Rate limit endpoint tertentu.

### 7.6 Search

```txt
Meilisearch
```

Fungsi:

* Full-text search artikel.
* Typo tolerance.
* Filter by kategori.
* Filter by tag.
* Filter by author.
* Sorting by published date.

Future alternative:

```txt
Typesense
```

Dipakai jika nanti search membutuhkan faceted search lebih kompleks.

---

## 8. Arsitektur Sistem

### 8.1 Arsitektur MVP

```txt
User
↓
Cloudflare DNS / CDN
↓
Next.js App Router
↓
Payload CMS API
↓
PostgreSQL

Payload / Next.js
↓
Local Storage

Payload Hooks
↓
Meilisearch

Next.js / API
↓
Redis
```

### 8.2 Arsitektur Storage Lokal

```txt
Editor upload gambar
↓
Payload Media Collection
↓
File masuk local storage
↓
Metadata masuk PostgreSQL
↓
Frontend mengambil URL melalui getMediaUrl()
```

### 8.3 Arsitektur Storage R2/S3 Nanti

```txt
Editor upload gambar
↓
Payload Media Collection
↓
File masuk Cloudflare R2 / S3
↓
Metadata masuk PostgreSQL
↓
Frontend mengambil URL CDN melalui getMediaUrl()
```

### 8.4 Environment Variable Storage

MVP local:

```env
STORAGE_DRIVER=local
LOCAL_UPLOAD_DIR=media
NEXT_PUBLIC_MEDIA_URL=/media
```

Future R2/S3:

```env
STORAGE_DRIVER=s3
S3_BUCKET=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_REGION=auto
S3_ENDPOINT=
S3_PUBLIC_URL=
NEXT_PUBLIC_MEDIA_URL=https://cdn.porosmadura.com
```

---

## 9. Role dan Permission

### 9.1 Admin

Akses:

* Full access.
* Mengelola user.
* Mengelola role.
* Mengelola artikel.
* Mengelola kategori.
* Mengelola tag.
* Mengelola author.
* Mengelola media.
* Mengelola halaman statis.
* Mengelola redirect.
* Mengelola setting website.
* Publish/unpublish artikel.
* Delete artikel.
* Clear cache.
* Reindex search.

### 9.2 Editor

Akses:

* Membuat artikel.
* Mengedit semua artikel.
* Review artikel.
* Publish artikel.
* Schedule artikel.
* Archive artikel.
* Mengatur featured article.
* Mengatur breaking news.
* Upload media.
* Mengelola kategori dan tag jika diizinkan.
* Tidak bisa mengelola user admin.

### 9.3 Author

Akses:

* Membuat artikel sendiri.
* Edit artikel sendiri selama belum published.
* Upload media.
* Submit artikel ke review.
* Tidak bisa publish langsung.
* Tidak bisa edit artikel milik user lain.
* Tidak bisa menghapus artikel published.

### 9.4 Viewer Internal

Akses:

* Hanya melihat data.
* Tidak bisa membuat, mengedit, atau menghapus.

---

## 10. Data Model

## 10.1 Users

Fields:

```txt
name
email
password
role
avatar
isActive
lastLoginAt
createdAt
updatedAt
```

Role enum:

```txt
admin
editor
author
viewer
```

---

## 10.2 Authors

Fields:

```txt
name
slug
bio
avatar
email
socialLinks
user
isActive
createdAt
updatedAt
```

Catatan:

* Author bisa terhubung ke user.
* Data author yang tampil publik adalah author profile, bukan data user internal.

---

## 10.3 Posts

Fields:

```txt
title
slug
excerpt
content
featuredImage
category
tags
author
status
publishedAt
scheduledAt
seoTitle
seoDescription
canonicalUrl
ogImage
isFeatured
isBreakingNews
allowIndex
sourceName
sourceUrl
readingTime
views
createdBy
updatedBy
createdAt
updatedAt
```

Status enum:

```txt
draft
review
scheduled
published
archived
```

Validasi:

* `title` wajib.
* `slug` wajib dan unique.
* `excerpt` wajib.
* `content` wajib.
* `featuredImage` wajib saat published.
* `category` wajib saat published.
* `author` wajib saat published.
* `publishedAt` wajib saat published.
* `seoTitle` direkomendasikan maksimal 60 karakter.
* `seoDescription` direkomendasikan maksimal 160 karakter.
* `allowIndex` default true.

Slug behavior:

* Slug otomatis dari title.
* Slug bisa diedit manual.
* Jika slug artikel published berubah, sistem membuat redirect otomatis dari URL lama ke URL baru.

---

## 10.4 Categories

Fields:

```txt
name
slug
description
parent
seoTitle
seoDescription
order
isActive
createdAt
updatedAt
```

Contoh kategori:

```txt
Nasional
Internasional
Politik
Ekonomi
Teknologi
Olahraga
Hiburan
Lifestyle
Otomotif
Daerah
Madura
Pamekasan
Sampang
Bangkalan
Sumenep
```

---

## 10.5 Tags

Fields:

```txt
name
slug
description
isActive
createdAt
updatedAt
```

---

## 10.6 Media

Fields:

```txt
file
alt
caption
credit
folder
createdBy
createdAt
updatedAt
```

Image sizes:

```txt
thumbnail: 400x300
card: 768x432
hero: 1280x720
og: 1200x630
```

Allowed MIME types:

```txt
image/jpeg
image/png
image/webp
image/avif
```

MVP boleh menggunakan:

```txt
image/*
```

Namun untuk production disarankan membatasi MIME type.

---

## 10.7 Pages

Untuk halaman statis.

Fields:

```txt
title
slug
content
seoTitle
seoDescription
status
createdAt
updatedAt
```

Contoh halaman:

```txt
Tentang Kami
Redaksi
Kontak
Pedoman Media Siber
Privacy Policy
Disclaimer
Advertise
```

---

## 10.8 Redirects

Fields:

```txt
from
to
statusCode
isActive
createdAt
updatedAt
```

Status code:

```txt
301
302
```

Use case:

* Slug artikel berubah.
* Kategori berubah.
* Halaman lama dipindah.
* Migrasi URL dari website lama.

---

## 10.9 Settings

Global settings:

```txt
siteName
siteDescription
tagline
siteUrl
logo
logoDark
favicon
defaultOgImage
brandPrimaryColor
brandSecondaryColor
contactEmail
socialLinks
defaultSeoTitle
defaultSeoDescription
googleAnalyticsId
googleSearchConsoleVerification
robotsTxt
rssTitle
rssDescription
newsPublicationName
```

Default value:

```txt
siteName: PorosMadura
tagline: Berita Tepat, Fakta Kuat
brandPrimaryColor: #0C2A51
brandSecondaryColor: #C61E21
defaultSeoTitle: PorosMadura
defaultSeoDescription: Berita Tepat, Fakta Kuat
newsPublicationName: PorosMadura
```

---

## 11. Halaman Publik

### 11.1 Homepage

URL:

```txt
/
```

Konten:

* Header dengan logo PorosMadura.
* Navbar kategori.
* Breaking news ticker.
* Hero featured news.
* Latest news.
* Popular news.
* Category sections.
* Editor’s choice.
* Sidebar trending.
* Footer.

Requirement:

* Menampilkan artikel published saja.
* Breaking news menggunakan aksen merah.
* Featured article tampil di area hero.
* Latest news urut berdasarkan `publishedAt`.
* Homepage harus cepat dan bisa dicache.
* Layout mobile-first.

---

### 11.2 Detail Artikel

URL:

```txt
/[categorySlug]/[postSlug]
```

Contoh:

```txt
/madura/judul-berita-terbaru
```

Konten:

* Title.
* Excerpt.
* Featured image.
* Caption.
* Credit foto.
* Author.
* Published date.
* Updated date.
* Article content.
* Share buttons.
* Tags.
* Related posts.
* Popular posts.
* Breadcrumb.
* JSON-LD NewsArticle.
* Open Graph metadata.

Requirement:

* Hanya artikel published yang bisa diakses publik.
* Draft/review/scheduled sebelum waktunya tidak boleh bisa diakses publik.
* Archived article tidak tampil di listing publik.
* Jika slug berubah, redirect 301 dari slug lama ke slug baru.

---

### 11.3 Halaman Kategori

URL:

```txt
/category/[categorySlug]
```

Konten:

* Nama kategori.
* Deskripsi kategori.
* List artikel.
* Pagination.
* SEO metadata kategori.

Requirement:

* Hanya menampilkan artikel published.
* Bisa sort by latest.
* Pagination server-side.
* Category page bisa dicache.

---

### 11.4 Halaman Tag

URL:

```txt
/tag/[tagSlug]
```

Konten:

* Nama tag.
* Deskripsi tag.
* List artikel terkait.
* Pagination.

Requirement:

* Hanya menampilkan artikel published.
* Tag page bisa dicache.

---

### 11.5 Halaman Author

URL:

```txt
/author/[authorSlug]
```

Konten:

* Profile author.
* Avatar.
* Bio.
* Social links.
* List artikel author.
* Pagination.

Requirement:

* Hanya menampilkan author aktif.
* Hanya menampilkan artikel published.

---

### 11.6 Search Page

URL:

```txt
/search?q=keyword
```

Konten:

* Search input.
* Result artikel.
* Filter kategori.
* Filter tanggal.
* Pagination.

Requirement:

* Menggunakan Meilisearch.
* Search mendukung typo tolerance.
* Hanya artikel published yang tampil di hasil search.
* Search result menampilkan:

  * title
  * excerpt
  * category
  * published date
  * thumbnail
  * author

---

### 11.7 Static Pages

URL:

```txt
/tentang-kami
/redaksi
/kontak
/pedoman-media-siber
/privacy-policy
/disclaimer
/advertise
```

Konten dikelola dari CMS Pages.

---

## 12. CMS Admin Requirements

### 12.1 Login Page

Requirement:

* Menampilkan logo PorosMadura.
* Menampilkan nama “PorosMadura CMS”.
* Menggunakan warna brand navy dan merah.
* Login menggunakan email dan password.
* Rate limit login.

---

### 12.2 Dashboard

Menampilkan:

* Total artikel.
* Total draft.
* Total review.
* Total published.
* Total scheduled.
* Artikel populer.
* Artikel terbaru.
* Quick action create post.
* Status Meilisearch.
* Status Redis.
* Optional: clear cache button untuk admin.

---

### 12.3 Post Management

Fitur:

* Create artikel.
* Edit artikel.
* Delete artikel sesuai permission.
* Upload featured image.
* Pilih kategori.
* Pilih tag.
* Pilih author.
* Isi excerpt.
* Isi SEO metadata.
* Preview artikel.
* Submit to review.
* Publish.
* Schedule.
* Archive.
* Set featured.
* Set breaking news.

---

### 12.4 Media Management

Fitur:

* Upload image.
* Isi alt text.
* Isi caption.
* Isi credit.
* Preview image.
* Search media.
* Filter media by uploader.
* Filter media by date.
* Delete media jika tidak digunakan.

Validasi:

* Alt text wajib.
* MIME type divalidasi.
* Ukuran file dibatasi.
* File executable ditolak.
* Nama file disanitasi.

---

### 12.5 Category Management

Fitur:

* Create category.
* Edit category.
* Delete category jika tidak dipakai.
* Set parent category.
* Set SEO metadata.
* Set order.
* Set active/inactive.

---

### 12.6 Tag Management

Fitur:

* Create tag.
* Edit tag.
* Delete tag jika tidak dipakai.
* Set active/inactive.

---

### 12.7 Author Management

Fitur:

* Create author.
* Edit author.
* Upload avatar.
* Isi bio.
* Link author ke user internal.
* Set active/inactive.

---

### 12.8 Redirect Management

Fitur:

* Create redirect.
* Edit redirect.
* Delete redirect.
* Auto-create redirect saat slug artikel berubah.
* Support 301 dan 302.

---

### 12.9 Settings Management

Fitur:

* Update site name.
* Update tagline.
* Update logo.
* Update favicon.
* Update default OG image.
* Update default SEO.
* Update social links.
* Update contact email.
* Update analytics ID.
* Update Search Console verification.
* Update RSS title/description.

---

## 13. Editorial Workflow

### 13.1 Flow Artikel Baru

```txt
Author membuat artikel
↓
Status draft
↓
Author submit ke review
↓
Editor review
↓
Editor publish / schedule / return to draft
↓
Artikel tampil di website publik
↓
Artikel masuk sitemap, RSS, dan search index
```

### 13.2 Status Behavior

#### Draft

* Tidak tampil publik.
* Tidak masuk sitemap.
* Tidak masuk news sitemap.
* Tidak masuk RSS.
* Tidak masuk Meilisearch.

#### Review

* Tidak tampil publik.
* Terlihat oleh editor dan admin.
* Tidak masuk sitemap.
* Tidak masuk search index.

#### Scheduled

* Tidak tampil sebelum `scheduledAt`.
* Otomatis menjadi published saat waktunya tiba.
* Masuk search index setelah published.

#### Published

* Tampil publik.
* Masuk sitemap.
* Masuk news sitemap jika memenuhi syarat.
* Masuk RSS.
* Masuk Meilisearch.
* Bisa tampil di homepage, kategori, tag, author.

#### Archived

* Tidak tampil di listing publik.
* Dikeluarkan dari search index.
* Bisa 404 atau redirect sesuai policy.

---

## 14. SEO Requirements

### 14.1 Metadata Artikel

Setiap artikel harus memiliki:

```txt
title
meta title
meta description
canonical URL
OG title
OG description
OG image
Twitter card
published time
modified time
author
category
tags
robots index/follow
```

### 14.2 Structured Data

Detail artikel harus generate JSON-LD:

```txt
NewsArticle
```

Minimal properties:

```txt
headline
description
image
datePublished
dateModified
author
publisher
mainEntityOfPage
articleSection
```

Publisher:

```txt
name: PorosMadura
logo: logo PorosMadura
```

### 14.3 Sitemap

URL:

```txt
/sitemap.xml
```

Berisi:

* Homepage.
* Artikel published.
* Kategori aktif.
* Tag aktif.
* Author aktif.
* Static pages.

Jika URL banyak, gunakan sitemap index:

```txt
/sitemap.xml
/sitemaps/posts-1.xml
/sitemaps/categories.xml
/sitemaps/tags.xml
/sitemaps/pages.xml
```

### 14.4 News Sitemap

URL:

```txt
/news-sitemap.xml
```

Berisi:

* Artikel published terbaru.
* Publication name: PorosMadura.
* Language: id.
* Publication date.
* Title.

Requirement:

* Hanya artikel published.
* Artikel wajib punya `publishedAt`.
* Artikel draft/review/scheduled tidak boleh masuk.
* Artikel archived tidak boleh masuk.

### 14.5 RSS Feed

URL:

```txt
/rss.xml
```

Berisi:

* Artikel terbaru.
* Title.
* Link.
* Excerpt.
* Published date.
* Author.
* Category.

RSS metadata:

```txt
rssTitle: PorosMadura
rssDescription: Berita Tepat, Fakta Kuat
```

### 14.6 Robots.txt

URL:

```txt
/robots.txt
```

Default:

```txt
User-agent: *
Allow: /

Disallow: /admin
Disallow: /api

Sitemap: https://domain.com/sitemap.xml
Sitemap: https://domain.com/news-sitemap.xml
```

### 14.7 URL Structure

Format artikel:

```txt
/[categorySlug]/[postSlug]
```

Contoh:

```txt
/madura/pemkab-pamekasan-gelar-program-baru
```

Slug rules:

* Lowercase.
* Pakai dash.
* Tidak pakai karakter aneh.
* Unique.
* Stabil setelah publish.
* Jika berubah, buat redirect 301.

---

## 15. Search Requirements

### 15.1 Search Engine

Menggunakan:

```txt
Meilisearch
```

Index:

```txt
posts
```

### 15.2 Data yang Masuk Index

```txt
id
title
slug
excerpt
contentPlainText
category
tags
author
publishedAt
updatedAt
featuredImage
url
isFeatured
isBreakingNews
```

### 15.3 Indexing Rules

Masuk Meilisearch jika:

```txt
status = published
publishedAt <= now
allowIndex = true
```

Keluar dari Meilisearch jika:

```txt
status != published
allowIndex = false
archived
deleted
```

### 15.4 Search Features MVP

* Search by title.
* Search by excerpt.
* Search by content.
* Typo tolerance.
* Filter by category.
* Filter by tag.
* Sort latest.

### 15.5 Search Features Future

* Search suggestion.
* Trending search.
* Popular keyword.
* Related keyword.
* Advanced faceted search.

---

## 16. Cache Requirements

### 16.1 Redis Cache Keys

Contoh key:

```txt
homepage
category:{slug}:page:{page}
tag:{slug}:page:{page}
author:{slug}:page:{page}
post:{slug}
popular-posts
breaking-news
featured-posts
```

### 16.2 Cache Invalidation

Cache dibersihkan saat:

* Artikel dipublish.
* Artikel diedit.
* Artikel diarchive.
* Artikel dihapus.
* Kategori berubah.
* Tag berubah.
* Author berubah.
* Setting website berubah.

### 16.3 View Counter

Redis key:

```txt
views:post:{id}
```

Flow:

```txt
User membuka artikel
↓
View count bertambah di Redis
↓
Secara berkala disinkronkan ke PostgreSQL
```

MVP boleh update langsung ke PostgreSQL jika traffic masih kecil.

---

## 17. Storage Requirements

### 17.1 Local Storage MVP

File upload disimpan ke:

```txt
/media
```

Production path:

```txt
/var/www/porosmadura/media
```

Docker volume:

```txt
./media:/app/media
```

Requirement:

* Folder media harus persistent.
* Folder media wajib dibackup.
* File tidak boleh hilang saat deploy.
* File bisa diakses publik melalui URL media.

### 17.2 R2/S3-ready

Aplikasi harus mendukung:

```txt
STORAGE_DRIVER=local
STORAGE_DRIVER=s3
```

Jika local:

```txt
File disimpan lokal
URL menggunakan /media
```

Jika s3:

```txt
File dikirim ke bucket
URL menggunakan CDN public URL
```

### 17.3 Media URL Helper

Semua tampilan gambar harus menggunakan helper:

```ts
getMediaUrl()
```

Dilarang hardcode:

```ts
/media/filename.jpg
```

Contoh env local:

```env
NEXT_PUBLIC_MEDIA_URL=/media
```

Contoh env CDN:

```env
NEXT_PUBLIC_MEDIA_URL=https://cdn.porosmadura.com
```

### 17.4 Backup Local Media

Backup wajib:

```txt
Backup PostgreSQL harian
Backup folder media harian
Backup .env manual aman
```

---

## 18. Performance Requirements

Target MVP:

```txt
Homepage cepat dibuka
Article page cepat
Image optimized
Lazy loading image
Minimal client-side JavaScript
Server-side rendering / static rendering untuk halaman publik
Cache untuk listing utama
```

Target metrik:

```txt
LCP < 2.5s
CLS < 0.1
INP < 200ms
TTFB rendah dengan cache
```

Optimasi:

* Gunakan server components jika memungkinkan.
* Kurangi client component.
* Gunakan image sizes.
* Gunakan CDN untuk static assets.
* Cache homepage dan kategori.
* Pagination server-side.
* Hindari query berat tanpa index.

---

## 19. Security Requirements

### 19.1 Authentication

* Login admin menggunakan email dan password.
* Password harus di-hash.
* Session aman.
* Optional 2FA untuk fase lanjutan.

### 19.2 Authorization

* Role-based access.
* Author tidak bisa edit artikel user lain.
* Author tidak bisa publish langsung.
* Viewer tidak bisa edit data.
* Admin full access.

### 19.3 Upload Security

* Validasi MIME type.
* Batasi ukuran file.
* Tolak file executable.
* Rename file upload.
* Sanitasi nama file.
* Alt text wajib.

### 19.4 Admin Security

* Admin route tidak boleh diindeks.
* Rate limit login.
* Jangan expose secret ke frontend.
* Environment variable aman.
* Audit log fase lanjutan.

---

## 20. Analytics Requirements

MVP:

* Support Google Analytics atau analytics lain via settings.
* Track page view.
* Track artikel populer berdasarkan views.

Future:

* Dashboard analytics internal.
* Realtime readers.
* Referrer analytics.
* Popular by category.
* Popular by time range.

---

## 21. Deployment Requirements

### 21.1 MVP Deployment

Rekomendasi awal:

```txt
1 VPS
├── Next.js + Payload
├── PostgreSQL
├── Redis
├── Meilisearch
├── Local media volume
└── Nginx / Caddy reverse proxy
```

### 21.2 Docker Compose Services

```txt
app
postgres
redis
meilisearch
```

### 21.3 Environment Variables

```env
DATABASE_URI=
PAYLOAD_SECRET=
NEXT_PUBLIC_SITE_URL=

STORAGE_DRIVER=local
LOCAL_UPLOAD_DIR=media
NEXT_PUBLIC_MEDIA_URL=/media

REDIS_URL=
MEILISEARCH_HOST=
MEILISEARCH_API_KEY=

S3_BUCKET=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_REGION=
S3_ENDPOINT=
S3_PUBLIC_URL=
```

### 21.4 Domain

Contoh:

```txt
https://porosmadura.com
https://www.porosmadura.com
```

Harus pilih satu canonical domain.

Contoh redirect:

```txt
www → non-www
```

atau:

```txt
non-www → www
```

Jangan dua-duanya aktif.

---

## 22. Struktur Folder Rekomendasi

```txt
src
├── app
│   ├── (public)
│   │   ├── page.tsx
│   │   ├── [categorySlug]
│   │   │   └── [postSlug]
│   │   │       └── page.tsx
│   │   ├── category
│   │   │   └── [slug]
│   │   │       └── page.tsx
│   │   ├── tag
│   │   │   └── [slug]
│   │   │       └── page.tsx
│   │   ├── author
│   │   │   └── [slug]
│   │   │       └── page.tsx
│   │   └── search
│   │       └── page.tsx
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── rss.xml
│   └── news-sitemap.xml
│
├── collections
│   ├── Users.ts
│   ├── Authors.ts
│   ├── Posts.ts
│   ├── Categories.ts
│   ├── Tags.ts
│   ├── Media.ts
│   ├── Pages.ts
│   ├── Redirects.ts
│   └── Settings.ts
│
├── components
│   ├── layout
│   ├── article
│   ├── category
│   ├── media
│   └── seo
│
├── lib
│   ├── payload.ts
│   ├── seo.ts
│   ├── media.ts
│   ├── cache.ts
│   ├── search.ts
│   ├── redirects.ts
│   └── rss.ts
│
├── hooks
│   ├── syncPostToSearch.ts
│   ├── invalidateCache.ts
│   └── createRedirectOnSlugChange.ts
│
└── payload.config.ts
```

---

## 23. API / Internal Service Requirements

### 23.1 Public Data Fetching

Frontend hanya boleh mengambil artikel dengan kondisi:

```txt
status = published
publishedAt <= now
allowIndex = true
```

### 23.2 Preview Mode

Preview mode digunakan untuk editor/admin melihat artikel yang belum published.

Requirement:

* Preview membutuhkan session.
* Preview URL tidak boleh diindeks.
* Preview tidak masuk sitemap.

### 23.3 Search API

Endpoint:

```txt
/api/search?q=keyword&category=slug&page=1
```

Response:

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "limit": 10
}
```

---

## 24. UI Requirements

### 24.1 Header

Header harus memiliki:

* Logo PorosMadura.
* Navbar kategori.
* Search button.
* Mobile menu.
* Warna utama navy.

### 24.2 Breaking News

Komponen breaking news:

* Menggunakan warna merah.
* Bisa diatur dari artikel dengan flag `isBreakingNews`.
* Tampil di homepage.
* Optional tampil di semua halaman.

### 24.3 Article Card

Article card berisi:

* Thumbnail.
* Category badge.
* Title.
* Excerpt pendek.
* Published date.
* Author.

### 24.4 Footer

Footer berisi:

* Logo PorosMadura.
* Tagline.
* Deskripsi pendek.
* Link kategori.
* Link halaman statis.
* Social media.
* Copyright.

### 24.5 Admin Login

Login page harus:

* Menampilkan logo PorosMadura.
* Menggunakan navy dan merah.
* Tampil profesional.
* Mobile responsive.

---

## 25. Acceptance Criteria

### 25.1 Artikel

* Admin bisa membuat artikel.
* Author bisa membuat draft.
* Editor bisa publish artikel.
* Artikel published tampil di website publik.
* Artikel draft tidak tampil publik.
* Artikel review tidak tampil publik.
* Artikel archived tidak tampil di listing publik.
* Slug artikel unique.
* Perubahan slug membuat redirect 301.

### 25.2 Branding

* Nama brand tampil sebagai PorosMadura.
* Tagline tampil sebagai “Berita Tepat, Fakta Kuat”.
* Logo digunakan di header.
* Logo digunakan di admin login.
* Warna utama menggunakan `#0C2A51`.
* Warna aksen menggunakan `#C61E21`.
* Favicon menggunakan simbol logo.
* OG image default mengikuti brand.

### 25.3 SEO

* Artikel memiliki title dan meta description.
* Artikel memiliki canonical URL.
* Artikel memiliki OG image.
* Artikel memiliki JSON-LD NewsArticle.
* Sitemap dapat diakses.
* News sitemap dapat diakses.
* RSS feed dapat diakses.
* Robots.txt dapat diakses.
* Draft tidak terindeks.

### 25.4 Media

* Admin/editor/author bisa upload gambar.
* Media tersimpan di local storage.
* Media memiliki alt text.
* Media bisa digunakan sebagai featured image.
* URL media di frontend menggunakan helper.
* Sistem siap pindah ke R2/S3 melalui env dan adapter.

### 25.5 Search

* Artikel published masuk Meilisearch.
* Artikel draft tidak masuk Meilisearch.
* Artikel archived keluar dari Meilisearch.
* User bisa search artikel.
* Search mendukung typo tolerance.
* Search bisa filter kategori.

### 25.6 Cache

* Homepage bisa dicache.
* Category page bisa dicache.
* Cache dibersihkan saat artikel berubah.
* Artikel terbaru muncul setelah cache invalidation.

### 25.7 Role

* Admin full access.
* Editor bisa publish.
* Author tidak bisa publish langsung.
* Author tidak bisa edit artikel orang lain.
* Viewer hanya bisa melihat.

---

## 26. MVP Development Phases

### Phase 1 — Core Setup

Deliverables:

* Setup Next.js App Router.
* Setup Payload CMS.
* Setup PostgreSQL.
* Setup Docker Compose.
* Setup auth admin.
* Setup Tailwind CSS.
* Setup brand color token.
* Setup logo PorosMadura di frontend dan admin.

Output:

```txt
Project berjalan
CMS bisa login
Branding dasar sudah masuk
```

---

### Phase 2 — Collection Setup

Deliverables:

* Users.
* Authors.
* Posts.
* Categories.
* Tags.
* Media.
* Pages.
* Redirects.
* Settings.

Output:

```txt
Struktur data utama selesai
```

---

### Phase 3 — Editorial Workflow

Deliverables:

* Draft/review/scheduled/published/archived.
* Role Admin/Editor/Author.
* Slug generation.
* Redirect saat slug berubah.
* Featured article.
* Breaking news.
* Preview artikel.

Output:

```txt
Workflow redaksi bisa digunakan
```

---

### Phase 4 — Public Website

Deliverables:

* Homepage.
* Detail artikel.
* Category page.
* Tag page.
* Author page.
* Search page basic.
* Static pages.
* Responsive layout.

Output:

```txt
Website publik PorosMadura siap digunakan
```

---

### Phase 5 — SEO

Deliverables:

* Dynamic metadata.
* Canonical URL.
* Open Graph metadata.
* Twitter card.
* JSON-LD NewsArticle.
* Sitemap.
* News sitemap.
* RSS feed.
* Robots.txt.
* Breadcrumb.

Output:

```txt
Website siap indexing
```

---

### Phase 6 — Search & Cache

Deliverables:

* Setup Meilisearch.
* Sync artikel ke Meilisearch.
* Search page advanced.
* Setup Redis.
* Homepage cache.
* Category cache.
* Cache invalidation.

Output:

```txt
Search cepat dan halaman utama lebih ringan
```

---

### Phase 7 — Production Hardening

Deliverables:

* Nginx / Caddy reverse proxy.
* Domain + SSL.
* Cloudflare DNS/CDN.
* Backup database.
* Backup media.
* Error logging.
* Health check.
* Rate limiting login.

Output:

```txt
Production-ready MVP
```

---

### Phase 8 — R2/S3 Migration Ready

Deliverables:

* Implement storage adapter switch.
* Prepare env S3/R2.
* Migration script local media ke bucket.
* CDN media domain.
* Update Next image remote patterns.
* Test upload ke R2/S3 di staging.

Output:

```txt
Media siap pindah ke R2/S3 tanpa rombak konten
```

---

## 27. Future Roadmap

### Roadmap 1

* Newsletter.
* Push notification.
* Komentar pembaca.
* Related posts lebih pintar.
* Trending keyword.
* Popular posts by time range.
* Internal analytics dashboard.

### Roadmap 2

* Multi-language.
* Multi-site.
* Paywall.
* Membership.
* Premium content.
* Bookmark artikel.
* Reader account.

### Roadmap 3

* AI assisted tagging.
* AI summary.
* AI headline suggestion.
* Image CDN transformation.
* Advanced recommendation engine.
* Live blogging.

---

## 28. Risiko dan Mitigasi

### Risiko 1 — Local Storage Hilang Saat Deploy

Mitigasi:

* Gunakan persistent volume.
* Backup folder media.
* Jangan simpan upload di ephemeral filesystem.
* Siapkan migrasi ke R2/S3.

### Risiko 2 — SEO Tidak Optimal

Mitigasi:

* Implement metadata dinamis.
* Implement NewsArticle schema.
* Implement sitemap.
* Implement news sitemap.
* Artikel published harus server-rendered/static-rendered.
* Draft/review tidak boleh bisa diakses publik.

### Risiko 3 — Cache Menampilkan Data Lama

Mitigasi:

* Cache invalidation saat artikel berubah.
* Cache key dibuat jelas.
* Admin punya action clear cache.

### Risiko 4 — Search Index Tidak Sinkron

Mitigasi:

* Gunakan Payload hooks.
* Buat command manual reindex.
* Log setiap kegagalan sync.
* Admin bisa trigger reindex.

### Risiko 5 — CMS Terlalu Kompleks untuk Redaksi

Mitigasi:

* Field author dibuat sederhana.
* Field teknis disembunyikan dari author.
* SEO bisa auto-generate dari title/excerpt.
* Default value disiapkan.

---

## 29. Success Metrics

### 29.1 Technical Metrics

* Homepage cepat.
* Artikel bisa diakses tanpa error.
* Sitemap valid.
* News sitemap valid.
* RSS valid.
* Search response cepat.
* Upload media stabil.
* Cache invalidation berjalan.

### 29.2 Product Metrics

* Redaksi bisa publish artikel tanpa developer.
* Artikel baru muncul setelah publish.
* Artikel bisa dicari.
* Artikel bisa dibagikan dengan preview gambar benar.
* Struktur kategori/tag mudah dikelola.

### 29.3 SEO Metrics

* Artikel terindeks.
* Metadata tampil benar.
* OG preview benar saat dibagikan.
* Sitemap terbaca Search Console.
* Tidak ada draft terindeks.

---

## 30. Definition of Done MVP

MVP dianggap selesai jika:

* Admin bisa login ke CMS.
* Logo PorosMadura tampil di website dan admin.
* Warna brand diterapkan.
* Admin/editor/author bisa menggunakan workflow artikel.
* Artikel published tampil di website publik.
* Website memiliki homepage, detail artikel, kategori, tag, author, dan search.
* Upload gambar lokal berjalan.
* SEO dasar lengkap.
* Sitemap tersedia.
* News sitemap tersedia.
* RSS tersedia.
* Robots.txt tersedia.
* Meilisearch berjalan.
* Redis cache dasar berjalan.
* Role dan permission berjalan.
* Local media persistent.
* Backup database dan media tersedia.
* Struktur storage siap migrasi ke R2/S3.
* Website bisa dideploy ke VPS production awal.

---

## 31. Rekomendasi Prioritas Implementasi

Urutan pengerjaan:

```txt
1. Setup Next.js + Payload + PostgreSQL
2. Setup branding PorosMadura
3. Setup collection utama
4. Setup workflow artikel
5. Setup halaman publik
6. Setup SEO metadata
7. Setup sitemap, news sitemap, RSS, robots.txt
8. Setup Meilisearch
9. Setup Redis cache
10. Setup deployment VPS
11. Setup Cloudflare CDN
12. Siapkan R2/S3 adapter
```

---

## 32. Kesimpulan

PorosMadura dirancang sebagai website berita modern yang mengutamakan:

* Kredibilitas brand.
* Kecepatan akses.
* SEO yang kuat.
* Workflow editorial yang jelas.
* CMS yang fleksibel.
* Storage lokal yang aman untuk MVP.
* Kesiapan migrasi ke Cloudflare R2/S3.
* Search cepat menggunakan Meilisearch.
* Cache menggunakan Redis.
* Arsitektur yang scalable.

Stack final:

```txt
Next.js App Router
Payload CMS
PostgreSQL
Local Storage first
Redis
Meilisearch
Cloudflare CDN-ready
Cloudflare R2/S3-ready
```

Brand final:

```txt
PorosMadura
Berita Tepat, Fakta Kuat
Primary Color: #0C2A51
Accent Color: #C61E21
Background Color: #F6F6F6
Heading Font: Merriweather
Body Font: Inter
```
