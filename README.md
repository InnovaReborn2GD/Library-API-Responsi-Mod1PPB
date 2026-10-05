# Library API

Library API adalah REST API untuk mengelola data anggota perpustakaan, buku,
dan peminjaman buku. API ini dibangun menggunakan Node.js, Express.js, dan
Supabase PostgreSQL dengan arsitektur MVC.

## Tujuan Proyek

Proyek ini menyediakan operasi CRUD untuk:

- data anggota perpustakaan;
- data buku dan ketersediaan stoknya;
- data peminjaman buku beserta status dan tanggal pengembaliannya.

API juga mendukung filter peminjaman dan pagination, misalnya
`GET /loans?status_peminjaman=TERLAMBAT`.

## Teknologi dan Struktur Proyek

- Node.js
- Express.js
- Supabase PostgreSQL
- CommonJS
- Node.js built-in test runner

```text
.
├── api/
│   └── index.js         # Handler serverless Vercel
├── src/
│   ├── config/          # Konfigurasi koneksi Supabase
│   ├── controllers/     # Handler request dan response HTTP
│   ├── models/          # Akses data dan operasi CRUD
│   ├── routes/          # Pemetaan endpoint API
│   ├── validation/      # Validasi payload dan query
│   ├── views/           # Placeholder struktur MVC; API mengembalikan JSON
│   ├── app.js           # Konfigurasi Express dan middleware
│   └── server.js        # Entry point server lokal dan factory runtime
├── supabase/
│   └── schema.sql       # Schema tabel, constraint, dan trigger PostgreSQL
├── test/                # Test API dan validasi
├── .env.example         # Template environment variables
├── vercel.json          # Konfigurasi deployment Vercel
└── package.json
```

## Struktur Data / Schema

Database terdiri dari tiga tabel relasional:

### `anggota`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | UUID | Primary key |
| `nama_lengkap` | TEXT | Nama lengkap anggota |
| `email` | TEXT | Email unik anggota |
| `tipe_member` | TEXT | `STUDENT` atau `ADMIN` |
| `joined_at` | TIMESTAMP | Waktu anggota bergabung |

### `buku`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | UUID | Primary key |
| `isbn` | TEXT | ISBN unik buku |
| `judul` | TEXT | Judul buku |
| `penulis` | TEXT | Penulis buku |
| `kategori` | TEXT | Kategori buku |
| `total_ketersediaan` | INTEGER | Jumlah seluruh eksemplar |
| `tersedia` | INTEGER | Jumlah eksemplar yang tersedia |

### `peminjaman`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | UUID | Primary key |
| `anggota_id` | UUID | Foreign key ke `anggota.id` |
| `buku_id` | UUID | Foreign key ke `buku.id` |
| `tanggal_peminjaman` | DATE | Tanggal buku dipinjam |
| `tenggat_peminjaman` | DATE | Batas waktu pengembalian |
| `tanggal_pengembalian` | DATE | Tanggal buku dikembalikan |
| `status_peminjaman` | TEXT | `DIPINJAM`, `TERLAMBAT`, atau `DIKEMBALIKAN` |

Schema lengkap dapat dilihat di
[`supabase/schema.sql`](./supabase/schema.sql). Peminjaman aktif berstatus
`DIPINJAM` atau `TERLAMBAT` akan mengurangi `buku.tersedia`. Trigger database
menyesuaikan stok ketika peminjaman dibuat, diperbarui, dikembalikan, atau
dihapus.

## Endpoint API

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/health` | Memeriksa status API |
| GET | `/members` | Mendapatkan daftar anggota |
| POST | `/members` | Membuat anggota |
| GET | `/members/:id` | Mendapatkan detail anggota |
| PUT | `/members/:id` | Memperbarui anggota |
| DELETE | `/members/:id` | Menghapus anggota |
| GET | `/books` | Mendapatkan daftar buku |
| POST | `/books` | Membuat buku |
| GET | `/books/:id` | Mendapatkan detail buku |
| PUT | `/books/:id` | Memperbarui buku |
| DELETE | `/books/:id` | Menghapus buku |
| GET | `/loans` | Mendapatkan daftar peminjaman |
| POST | `/loans` | Membuat peminjaman |
| GET | `/loans/:id` | Mendapatkan detail peminjaman |
| PUT | `/loans/:id` | Memperbarui peminjaman |
| DELETE | `/loans/:id` | Menghapus peminjaman |

Daftar resource mendukung pagination dengan `page` dan `limit` hingga 100.
Endpoint `/loans` juga mendukung filter `status_peminjaman`, `anggota_id`,
dan `buku_id`.

## Contoh Request dan Response

### Membuat anggota

Request:

```http
POST /members
Content-Type: application/json
```

```json
{
  "nama_lengkap": "Alya Putri",
  "email": "alya@example.com",
  "tipe_member": "STUDENT"
}
```

Response `201 Created`:

```json
{
  "data": {
    "id": "4a8c3d6e-7b3e-4e84-8d46-2f5e4c1f2a10",
    "nama_lengkap": "Alya Putri",
    "email": "alya@example.com",
    "tipe_member": "STUDENT",
    "joined_at": "2026-10-06T00:00:00.000Z"
  }
}
```

### Membuat buku

Request:

```http
POST /books
Content-Type: application/json
```

```json
{
  "isbn": "9786022916624",
  "judul": "Laskar Pelangi",
  "penulis": "Andrea Hirata",
  "kategori": "Novel",
  "total_ketersediaan": 3
}
```

### Membuat peminjaman

Request:

```http
POST /loans
Content-Type: application/json
```

```json
{
  "anggota_id": "4a8c3d6e-7b3e-4e84-8d46-2f5e4c1f2a10",
  "buku_id": "6d1f2d2a-4c7c-48a8-9ea5-1b6f8e7c2d30",
  "tanggal_peminjaman": "2026-10-01",
  "tenggat_peminjaman": "2026-10-08",
  "tanggal_pengembalian": null,
  "status_peminjaman": "DIPINJAM"
}
```

### Memfilter peminjaman

```http
GET /loans?status_peminjaman=TERLAMBAT&page=1&limit=20
```

Response `200 OK`:

```json
{
  "data": [
    {
      "id": "8f1d9d0e-1dc2-45b8-8edb-3d5c6a7b8e90",
      "anggota_id": "4a8c3d6e-7b3e-4e84-8d46-2f5e4c1f2a10",
      "buku_id": "6d1f2d2a-4c7c-48a8-9ea5-1b6f8e7c2d30",
      "tanggal_peminjaman": "2026-09-20",
      "tenggat_peminjaman": "2026-09-27",
      "tanggal_pengembalian": null,
      "status_peminjaman": "TERLAMBAT"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "count": 1
  }
}
```

Response error validasi `400 Bad Request`:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "status_peminjaman must be one of DIPINJAM, TERLAMBAT, DIKEMBALIKAN"
  }
}
```

## Instalasi dan Menjalankan Secara Lokal

### Prasyarat

- Node.js 18 atau versi yang lebih baru
- Project Supabase

### Langkah instalasi

1. Clone repository:

   ```bash
   git clone <URL_REPOSITORY>
   cd Library-API-Responsi-Mod1PPB
   ```

2. Install dependency:

   ```bash
   npm install
   ```

3. Buat file environment:

   ```bash
   cp .env.example .env
   ```

4. Isi `.env`:

   ```env
   PORT=3000
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

5. Jalankan [`supabase/schema.sql`](./supabase/schema.sql) pada Supabase SQL
   Editor.

6. Jalankan server development:

   ```bash
   npm run dev
   ```

   API tersedia di `http://localhost:3000`.

7. Uji endpoint health:

   ```bash
   curl http://localhost:3000/health
   ```

Jangan commit file `.env` atau mengirim
`SUPABASE_SERVICE_ROLE_KEY` ke browser karena key tersebut memiliki akses
server.

## Perintah yang Tersedia

| Perintah | Keterangan |
|---|---|
| `npm start` | Menjalankan server lokal |
| `npm run dev` | Menjalankan server lokal dengan Nodemon |
| `npm test` | Menjalankan seluruh test |

## Deployment Vercel

Project dikonfigurasi untuk Vercel melalui
[`vercel.json`](./vercel.json). Handler serverless eksplisit berada di
[`api/index.js`](./api/index.js), sedangkan [`src/app.js`](./src/app.js)
hanya digunakan sebagai modul internal. Saat melakukan deployment, tambahkan
environment variables berikut pada project Vercel:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

Link hasil deployment:

> Belum tersedia. Setelah deployment dibuat, ganti bagian ini dengan URL
> publik Vercel, misalnya `https://library-api.vercel.app`.

Contoh pemeriksaan setelah deployment:

```bash
curl https://library-api.vercel.app/health
```
