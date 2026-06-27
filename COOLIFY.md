# Deploy PorosMadura di Coolify

Deployment menggunakan Docker Compose dengan empat service utama:

| Service | Fungsi | Public | Port Internal |
|---|---|---|---|
| `app` | Next.js 15 Monolith + Custom CMS | Ya | `3000` |
| `db` | PostgreSQL 16 Database | Tidak | `5432` |
| `redis` | Redis Cache & Queue | Tidak | `6379` |
| `meilisearch` | Meilisearch Full-Text Search | Tidak | `7700` |

Database PostgreSQL disimpan pada named volume `postgres_data`. Media upload disimpan secara persisten di `media_data`. Jangan menghapus volume tersebut saat melakukan redeploy agar data dan media tidak hilang.

## 1. Persiapan DNS

Buat satu record DNS A (atau CNAME) yang mengarah ke IP server Coolify Anda:

```text
porosmadura.example.com      A    <SERVER_IP>
```

*Ganti `example.com` dengan domain Anda.*

## 2. Membuat Resource di Coolify

1. **Sangat Penting**: Pastikan Anda sudah melakukan **commit dan push** berkas [docker-compose.coolify.yml](file:///home/agung/Project/Laravel/porosmadura/docker-compose.coolify.yml) ke repositori remote (GitHub/GitLab) Anda terlebih dahulu. Coolify akan memverifikasi keberadaan berkas ini secara langsung.
2. Di Coolify, buka dashboard **Projects**, pilih environment, lalu klik **Add New Resource**.
3. Pilih **Docker Compose** dari opsi yang tersedia.
4. Pilih repository dan branch produksi yang sesuai.
5. Isi **Docker Compose Location** dengan **`docker-compose.coolify.yml`** (Penting: **Jangan** gunakan garis miring `/` di depan nama berkas).
6. Jangan aktifkan *Raw Compose Deployment* agar domain dan environment variables dapat dikelola langsung lewat UI Coolify.
7. Klik **Save** agar Coolify membaca konfigurasi service dan variable dari file Docker Compose.

## 3. Konfigurasi Environment Variables

Masukkan nilai-nilai berikut di tab **Environment Variables** di Coolify. Tandai variabel-variabel ini sebagai runtime variables dan build variables agar tersedia di kedua proses.

```env
# Database Config
DB_DATABASE=porosmadura

# Secrets (Ganti dengan random string yang aman dan panjang)
CMS_ADMIN_EMAIL=admin@porosmadura.example.com
CMS_ADMIN_PASSWORD=ganti_dengan_password_admin_yang_kuat
BETTER_AUTH_SECRET=ganti_dengan_better_auth_secret_random_dan_panjang

# Google OAuth (opsional, isi saat fitur login Google diaktifkan)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Meilisearch API Key (Harus minimal 16 karakter)
MEILISEARCH_API_KEY=ganti_dengan_api_key_meilisearch_minimal_16_karakter

# Public URL Mapping (Sesuaikan dengan domain Anda)
NEXT_PUBLIC_SITE_URL=https://porosmadura.example.com
```

> [!NOTE]
> Anda tidak perlu membuat password database (`POSTGRES_PASSWORD`) secara manual. Proyek ini menggunakan **Magic Environment Variable** dari Coolify (`${SERVICE_PASSWORD_db}`). Coolify akan otomatis men-generate password yang sangat kuat secara acak dan menyimpannya secara persisten.

> [!NOTE]
> Berkas [docker-compose.coolify.yml](file:///home/agung/Project/Laravel/porosmadura/docker-compose.coolify.yml) akan merakit URL koneksi ke database internal secara otomatis dengan format: `postgres://porosmadura:${SERVICE_PASSWORD_db}@db:5432/${DB_DATABASE:-porosmadura}`.

> [!NOTE]
> `NEXT_PUBLIC_SITE_URL` akan digunakan sebagai parameter build arguments dan env vars untuk Next.js.

## 4. Konfigurasi Domain Service

Pada pengaturan masing-masing service di Coolify, set domain untuk service yang harus diakses dari luar:

- Service **`app`**: `https://porosmadura.example.com`
- Service **`db`**, **`redis`** & **`meilisearch`**: Jangan berikan domain publik (kosongkan).

Coolify secara otomatis mengonfigurasi reverse proxy (Traefik/Nginx) dan mengurus sertifikat SSL (Let's Encrypt) setelah DNS terarah dengan benar ke server.

## 5. Deploy dan Verifikasi

1. Klik **Deploy** dan tunggu proses build selesai untuk semua service.
2. Setelah deployment berstatus healthy, verifikasi service dengan membuka URL berikut di browser atau command line:
   - Frontend: `https://porosmadura.example.com`
   - Healthcheck: `https://porosmadura.example.com/api/health`
   - Custom CMS Login: `https://porosmadura.example.com/cms/login`

## 6. Seed Database & Migration (Opsional)

Jika Anda ingin mengisi database dengan data awal (seed data) di server produksi atau menjalankan migrasi secara manual:
1. Buka dashboard service **`app`** di Coolify.
2. Buka tab **Terminal** / **Console**.
3. Jalankan perintah migrasi:
   ```bash
   npm run migrate
   ```
4. Jalankan perintah seeder untuk data awal:
   ```bash
   npm run seed
   ```

## 7. Backup & Maintenance

- Selalu lakukan backup volume `postgres_data` dan `media_data` secara berkala lewat menu backup Coolify.
- Untuk meng-update aplikasi, cukup lakukan commit baru ke branch Git Anda. Coolify akan mendeteksi perubahan tersebut (jika webhook aktif) atau Anda dapat mengeklik tombol **Redeploy** secara manual di panel Coolify.
