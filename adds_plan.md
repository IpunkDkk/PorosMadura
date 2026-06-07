# PLAN.md — Sistem Iklan Hybrid Portal Berita

## 1. Ringkasan

Sistem iklan pada portal berita akan menggunakan model **hybrid**, yaitu kombinasi antara:

1. **Iklan Manual**
   - Iklan dari penyewa/pengiklan langsung.
   - Dikelola oleh admin melalui dashboard.
   - Cocok untuk pengiklan lokal, UMKM, kampus, event, instansi, properti, dan sponsor daerah.

2. **Google AdSense / Ad Network**
   - Iklan otomatis dari Google atau jaringan iklan lain.
   - Digunakan sebagai fallback ketika tidak ada iklan manual aktif pada slot tertentu.
   - Cocok sebagai pendapatan tambahan dari traffic website.

Tujuan utama sistem ini adalah agar setiap slot iklan tetap produktif. Jika ada penyewa iklan manual, slot menampilkan iklan manual. Jika tidak ada, slot otomatis menampilkan AdSense.

---

## 2. Tujuan Sistem

### 2.1 Tujuan Bisnis

- Membuka sumber pendapatan dari iklan manual.
- Menyediakan fallback otomatis menggunakan Google AdSense.
- Memudahkan admin mengatur iklan tanpa perlu mengubah kode website.
- Memberikan laporan sederhana kepada pengiklan.
- Membuat portal berita siap monetisasi sejak awal.

### 2.2 Tujuan Teknis

- Sistem iklan fleksibel berdasarkan placement/slot.
- Mendukung banner desktop dan mobile.
- Mendukung jadwal tayang otomatis berdasarkan tanggal mulai dan tanggal selesai.
- Mendukung tracking tayangan dan klik.
- Mendukung fallback AdSense per slot.
- Mudah dikembangkan ke fitur lanjutan seperti targeting kategori, device targeting, dan paket iklan.

---

## 3. Konsep Utama

Setiap area iklan di website disebut **Ad Slot** atau **Placement**.

Contoh placement:

```txt
home_top_banner
home_middle_banner
home_sidebar_top
article_top
article_middle
article_bottom
article_sidebar
category_top
category_sidebar
mobile_sticky_bottom
popup_campaign
```

Setiap placement memiliki aturan:

```txt
Jika ada iklan manual aktif:
    tampilkan iklan manual
Jika tidak ada iklan manual aktif:
    tampilkan fallback AdSense
Jika fallback tidak aktif:
    slot tidak ditampilkan
```

---

## 4. Alur Kerja Iklan Manual

### 4.1 Alur dari Sisi Pengiklan

```txt
Pengiklan menghubungi admin/sales
↓
Admin menawarkan paket iklan
↓
Pengiklan memilih posisi dan durasi
↓
Pengiklan mengirim banner dan link tujuan
↓
Admin memasukkan data iklan ke dashboard
↓
Iklan tampil sesuai jadwal
↓
Admin dapat melihat tayangan dan klik
```

### 4.2 Alur dari Sisi Admin

```txt
Login dashboard
↓
Masuk menu Manajemen Iklan
↓
Tambah iklan baru
↓
Upload banner desktop/mobile
↓
Pilih placement
↓
Atur tanggal mulai dan selesai
↓
Aktifkan iklan
↓
Sistem otomatis menampilkan iklan sesuai slot
```

---

## 5. Alur Kerja AdSense

AdSense digunakan sebagai fallback otomatis.

```txt
Admin memasukkan kode AdSense untuk setiap slot
↓
Sistem mengecek iklan manual aktif
↓
Jika tidak ada iklan manual, tampilkan AdSense
↓
Jika ada iklan manual, AdSense tidak tampil pada slot tersebut
```

Contoh:

```txt
Slot: article_middle

Kondisi 1:
Ada iklan manual aktif → tampilkan banner manual

Kondisi 2:
Tidak ada iklan manual aktif → tampilkan Google AdSense

Kondisi 3:
Tidak ada iklan manual dan fallback nonaktif → slot disembunyikan
```

---

## 6. Placement Iklan

### 6.1 Homepage

| Placement | Deskripsi | Rekomendasi Ukuran |
|---|---|---|
| home_top_banner | Banner besar di bagian atas homepage | 970x250 |
| home_middle_banner | Banner di tengah daftar berita | 728x90 |
| home_sidebar_top | Sidebar kanan/kiri bagian atas | 300x250 |
| home_sidebar_bottom | Sidebar kanan/kiri bagian bawah | 300x600 |

### 6.2 Detail Artikel

| Placement | Deskripsi | Rekomendasi Ukuran |
|---|---|---|
| article_top | Di bawah judul/gambar utama artikel | 728x90 |
| article_middle | Di tengah isi artikel | 728x90 |
| article_bottom | Setelah isi artikel | 728x90 |
| article_sidebar | Sidebar artikel | 300x250 |

### 6.3 Halaman Kategori

| Placement | Deskripsi | Rekomendasi Ukuran |
|---|---|---|
| category_top | Banner atas halaman kategori | 970x250 |
| category_sidebar | Sidebar halaman kategori | 300x250 |

### 6.4 Mobile

| Placement | Deskripsi | Rekomendasi Ukuran |
|---|---|---|
| mobile_sticky_bottom | Iklan sticky bawah di mobile | 320x50 |
| mobile_article_middle | Iklan tengah artikel versi mobile | 320x100 |

### 6.5 Campaign

| Placement | Deskripsi | Catatan |
|---|---|---|
| popup_campaign | Popup promosi/campaign | Gunakan dengan hati-hati agar tidak mengganggu pembaca |

---

## 7. Fitur MVP

### 7.1 Fitur Admin Iklan

- Tambah iklan manual.
- Edit iklan manual.
- Hapus iklan manual.
- Aktif/nonaktifkan iklan.
- Upload banner desktop.
- Upload banner mobile.
- Pilih placement.
- Atur tanggal mulai.
- Atur tanggal selesai.
- Isi link tujuan.
- Lihat total tayangan.
- Lihat total klik.
- Lihat CTR sederhana.

### 7.2 Fitur Fallback AdSense

- Admin dapat mengatur kode AdSense per slot.
- Admin dapat mengaktifkan/nonaktifkan fallback per slot.
- Sistem otomatis menampilkan AdSense jika tidak ada iklan manual aktif.

### 7.3 Fitur Tracking

- Tracking impression/tayangan.
- Tracking click/klik.
- Redirect tracking untuk klik iklan manual.
- Laporan sederhana per iklan.

---

## 8. Fitur Lanjutan Setelah MVP

Fitur ini tidak wajib di versi awal, tapi bisa disiapkan untuk pengembangan berikutnya.

- Target iklan berdasarkan kategori berita.
- Target iklan berdasarkan halaman tertentu.
- Target iklan berdasarkan device desktop/mobile.
- Rotasi iklan berdasarkan bobot/weight.
- Paket iklan otomatis.
- Invoice untuk penyewa iklan.
- Export laporan ke PDF/Excel.
- Dashboard statistik harian.
- Pembatasan jumlah impression.
- Pembatasan jumlah klik.
- A/B testing banner.
- Approval banner sebelum tayang.
- Multi-format iklan: banner, native ad, sponsored article, popup, sticky.

---

## 9. Struktur Database

### 9.1 Tabel `ads`

Digunakan untuk menyimpan iklan manual.

```sql
ads
- id
- title
- advertiser_name
- advertiser_contact
- image_desktop
- image_mobile
- target_url
- placement
- start_date
- end_date
- status
- priority
- impressions_count
- clicks_count
- created_at
- updated_at
```

### 9.2 Penjelasan Field `ads`

| Field | Fungsi |
|---|---|
| id | ID unik iklan |
| title | Nama iklan |
| advertiser_name | Nama pengiklan |
| advertiser_contact | Kontak pengiklan |
| image_desktop | Banner untuk desktop |
| image_mobile | Banner untuk mobile |
| target_url | Link tujuan ketika iklan diklik |
| placement | Posisi iklan |
| start_date | Tanggal mulai tayang |
| end_date | Tanggal selesai tayang |
| status | active, inactive, draft |
| priority | Prioritas tampilan iklan |
| impressions_count | Jumlah tayangan |
| clicks_count | Jumlah klik |

---

### 9.3 Tabel `ad_slots`

Digunakan untuk menyimpan konfigurasi slot dan fallback AdSense.

```sql
ad_slots
- id
- placement
- label
- description
- fallback_type
- fallback_code
- is_fallback_active
- is_active
- created_at
- updated_at
```

### 9.4 Penjelasan Field `ad_slots`

| Field | Fungsi |
|---|---|
| id | ID unik slot |
| placement | Kode posisi iklan |
| label | Nama slot yang mudah dibaca admin |
| description | Deskripsi lokasi slot |
| fallback_type | Jenis fallback, contoh: adsense |
| fallback_code | Kode AdSense/ad network |
| is_fallback_active | Status fallback aktif/tidak |
| is_active | Status slot aktif/tidak |

---

### 9.5 Tabel `ad_events`

Opsional, digunakan jika ingin tracking lebih detail.

```sql
ad_events
- id
- ad_id
- event_type
- placement
- page_url
- user_agent
- ip_hash
- created_at
```

Contoh `event_type`:

```txt
impression
click
```

Catatan:
Untuk MVP, tracking bisa cukup menggunakan counter di tabel `ads`.
Jika ingin laporan detail harian, gunakan tabel `ad_events`.

---

## 10. API Endpoint

### 10.1 Mengambil Iklan Berdasarkan Placement

```txt
GET /api/ads?placement=article_middle
```

Response jika ada iklan manual:

```json
{
  "type": "manual",
  "id": 12,
  "title": "Promo Kampus Madura",
  "image_desktop": "/uploads/ads/kampus-desktop.jpg",
  "image_mobile": "/uploads/ads/kampus-mobile.jpg",
  "target_url": "https://kampusmadura.ac.id",
  "placement": "article_middle"
}
```

Response jika tidak ada iklan manual dan fallback aktif:

```json
{
  "type": "fallback",
  "provider": "adsense",
  "placement": "article_middle",
  "code": "<ins class='adsbygoogle'></ins>"
}
```

Response jika tidak ada iklan:

```json
{
  "type": "empty",
  "placement": "article_middle"
}
```

---

### 10.2 Tracking Impression

```txt
POST /api/ads/{id}/impression
```

Fungsi:

```txt
Menambahkan jumlah tayangan iklan manual.
```

---

### 10.3 Tracking Click

```txt
GET /ads/click/{id}
```

Fungsi:

```txt
Menambahkan jumlah klik
↓
Redirect ke target_url iklan
```

---

## 11. Komponen Frontend

### 11.1 Komponen Utama

Nama komponen:

```tsx
<AdSlot placement="article_middle" />
```

### 11.2 Cara Kerja Komponen

```txt
Komponen menerima placement
↓
Request ke API iklan
↓
Jika type = manual:
    tampilkan banner manual
    kirim impression
    klik diarahkan ke /ads/click/{id}
↓
Jika type = fallback:
    render kode AdSense
↓
Jika type = empty:
    tidak render apa-apa
```

### 11.3 Contoh Penggunaan di Artikel

```tsx
<ArticleHeader />

<AdSlot placement="article_top" />

<ArticleContentBeforeMiddle />

<AdSlot placement="article_middle" />

<ArticleContentAfterMiddle />

<AdSlot placement="article_bottom" />
```

---

## 12. Aturan Pemilihan Iklan Manual

Jika ada beberapa iklan aktif pada placement yang sama, gunakan aturan berikut:

```txt
1. Ambil iklan dengan status active
2. Pastikan tanggal hari ini berada di antara start_date dan end_date
3. Filter berdasarkan placement
4. Urutkan berdasarkan priority tertinggi
5. Jika priority sama, pilih random
```

Contoh query logika:

```txt
WHERE placement = "article_middle"
AND status = "active"
AND start_date <= today
AND end_date >= today
ORDER BY priority DESC
RANDOM LIMIT 1
```

---

## 13. Aturan Fallback AdSense

Fallback AdSense hanya tampil jika:

```txt
Tidak ada iklan manual aktif
Slot aktif
Fallback aktif
Kode fallback tersedia
```

Fallback tidak tampil jika:

```txt
Ada iklan manual aktif
Slot dinonaktifkan
Fallback dinonaktifkan
Kode AdSense belum diisi
```

---

## 14. Rekomendasi UX

### 14.1 Untuk Pembaca

- Jangan terlalu banyak iklan di satu halaman.
- Hindari popup terlalu sering.
- Iklan tidak boleh menutupi konten utama.
- Sticky mobile harus mudah ditutup jika memungkinkan.
- Jaga kecepatan halaman.

### 14.2 Untuk Admin

Dashboard iklan harus sederhana:

```txt
Nama Iklan
Pengiklan
Placement
Tanggal Mulai
Tanggal Selesai
Status
Tayang
Klik
CTR
Aksi
```

### 14.3 Untuk Pengiklan

Laporan sederhana yang bisa diberikan:

```txt
Nama Iklan
Periode Tayang
Posisi Iklan
Jumlah Tayang
Jumlah Klik
CTR
```

---

## 15. Rekomendasi Paket Iklan

### 15.1 Paket Manual

Contoh paket awal untuk portal berita lokal:

| Paket | Posisi | Durasi |
|---|---|---|
| Banner Homepage | home_top_banner | 7 hari / 30 hari |
| Sidebar Artikel | article_sidebar | 30 hari |
| Tengah Artikel | article_middle | 30 hari |
| Mobile Sticky | mobile_sticky_bottom | 7 hari / 30 hari |
| Sponsored Article | Artikel sponsor | Sekali publish |
| Popup Campaign | popup_campaign | 3 hari / 7 hari |

Harga bisa disesuaikan dengan traffic website.

---

## 16. Checklist Sebelum Menggunakan AdSense

Sebelum daftar AdSense, website sebaiknya sudah memiliki:

- Konten original.
- Artikel cukup banyak dan berkualitas.
- Halaman Tentang Kami.
- Halaman Kontak.
- Halaman Privacy Policy.
- Halaman Disclaimer.
- Navigasi jelas.
- Domain aktif.
- Tampilan rapi.
- Website bisa diakses publik.
- Tidak banyak halaman kosong.
- Tidak menggunakan konten bajakan/copy-paste.

---

## 17. Prioritas Implementasi

### Phase 1 — MVP Manual Ads

Target: sistem iklan manual bisa berjalan.

Checklist:

- Buat tabel `ads`.
- Buat CRUD iklan di admin.
- Upload banner desktop/mobile.
- Pilih placement.
- Atur tanggal mulai dan selesai.
- Status aktif/nonaktif.
- Render iklan manual di frontend.
- Tracking klik sederhana.
- Tracking impression sederhana.

---

### Phase 2 — Fallback AdSense

Target: slot kosong bisa otomatis menampilkan AdSense.

Checklist:

- Buat tabel `ad_slots`.
- Buat halaman pengaturan slot iklan.
- Tambahkan field fallback code.
- Tambahkan status fallback aktif/nonaktif.
- Update komponen `<AdSlot />`.
- Jika tidak ada iklan manual, tampilkan fallback AdSense.

---

### Phase 3 — Reporting

Target: admin bisa melihat performa iklan.

Checklist:

- Total impression.
- Total click.
- CTR.
- Filter berdasarkan tanggal.
- Filter berdasarkan placement.
- Export laporan sederhana jika diperlukan.

---

### Phase 4 — Fitur Lanjutan

Target: sistem iklan lebih profesional.

Checklist:

- Target berdasarkan kategori.
- Target berdasarkan halaman.
- Rotasi berbobot.
- Jadwal jam tayang.
- Invoice pengiklan.
- Paket iklan.
- Export laporan PDF/Excel.
- Sponsored article management.

---

## 18. Acceptance Criteria

Sistem dianggap selesai untuk MVP jika:

- Admin bisa membuat iklan manual.
- Admin bisa upload banner.
- Admin bisa memilih placement.
- Iklan hanya tampil pada tanggal aktif.
- Iklan tidak tampil jika status inactive.
- Klik iklan tercatat.
- Tayangan iklan tercatat.
- Jika tidak ada iklan manual, fallback AdSense tampil.
- Jika fallback AdSense tidak aktif, slot disembunyikan.
- Komponen iklan bisa digunakan di homepage, detail artikel, dan halaman kategori.

---

## 19. Catatan Teknis untuk Stack

Stack yang direncanakan:

```txt
Next.js App Router
Payload CMS
PostgreSQL
Local Storage untuk awal
Ready untuk S3/R2
Redis
Meilisearch / Typesense
```

Rekomendasi implementasi:

- Manajemen iklan bisa dibuat sebagai collection di Payload CMS.
- Banner disimpan lokal dulu melalui media upload Payload.
- Struktur media dibuat agar mudah dipindahkan ke S3/R2 nanti.
- Komponen `<AdSlot />` dibuat di Next.js.
- Query iklan aktif bisa menggunakan API Payload atau custom route.
- Tracking click sebaiknya lewat route server agar redirect aman.
- Tracking impression bisa dibuat sederhana dulu, lalu dioptimasi dengan Redis jika traffic mulai besar.

---

## 20. Kesimpulan

Model iklan terbaik untuk portal berita adalah **hybrid**:

```txt
Iklan Manual = sumber pendapatan utama
AdSense = fallback/pengisi slot kosong
Sponsored Article = produk premium
```

Dengan sistem ini, website bisa tetap menghasilkan walaupun belum semua slot terjual ke pengiklan manual. Di sisi lain, admin tetap bisa menjual slot premium dengan harga tetap kepada pengiklan lokal.
