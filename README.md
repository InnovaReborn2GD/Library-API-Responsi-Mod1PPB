# Library API

REST API Node.js dan Express.js untuk anggota, buku, dan peminjaman dengan
Supabase PostgreSQL. Kode data-access berada di `src/models`, handler HTTP di
`src/controllers`, dan pemetaan endpoint di `src/routes`.

## Setup

```bash
npm install
cp .env.example .env
npm start
```

Jalankan [`supabase/schema.sql`](./supabase/schema.sql) pada Supabase SQL
Editor terlebih dahulu. `SUPABASE_SERVICE_ROLE_KEY` hanya boleh dipakai di
server dan tidak boleh di-commit atau dikirim ke browser.

## Endpoint

Semua respons sukses menggunakan `{ "data": ... }`. Respons daftar juga
memiliki `meta` berisi `page`, `limit`, dan `count`.

| Method | URL | Keterangan |
|---|---|---|
| GET | `/health` | Status API |
| GET/POST | `/members` | Daftar atau membuat anggota |
| GET/PUT/DELETE | `/members/:id` | Detail, mengganti, atau menghapus anggota |
| GET/POST | `/books` | Daftar atau membuat buku |
| GET/PUT/DELETE | `/books/:id` | Detail, mengganti, atau menghapus buku |
| GET/POST | `/loans` | Daftar atau membuat peminjaman |
| GET/PUT/DELETE | `/loans/:id` | Detail, mengganti, atau menghapus peminjaman |

Daftar mendukung `page` dan `limit` (maksimum 100). Filter peminjaman:

```text
GET /loans?status_peminjaman=TERLAMBAT
GET /loans?anggota_id=<uuid>&buku_id=<uuid>
```

Payload anggota:

```json
{ "nama_lengkap": "Alya", "email": "alya@example.com", "tipe_member": "STUDENT" }
```

Payload buku:

```json
{
  "isbn": "9786022916624",
  "judul": "Laskar Pelangi",
  "penulis": "Andrea Hirata",
  "kategori": "Novel",
  "total_ketersediaan": 3
}
```

Payload peminjaman:

```json
{
  "anggota_id": "<uuid>",
  "buku_id": "<uuid>",
  "tanggal_peminjaman": "2026-10-01",
  "tenggat_peminjaman": "2026-10-08",
  "tanggal_pengembalian": null,
  "status_peminjaman": "DIPINJAM"
}
```

`tipe_member` bernilai `STUDENT` atau `ADMIN`; status peminjaman bernilai
`DIPINJAM`, `TERLAMBAT`, atau `DIKEMBALIKAN`. Peminjaman berstatus aktif
mengurangi `buku.tersedia`. Trigger PostgreSQL mengembalikan stok ketika
peminjaman dikembalikan atau dihapus dan menolak peminjaman saat stok habis.
Penghapusan anggota/buku yang masih direferensikan ditolak oleh foreign key.

Error memakai bentuk:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "..." } }
```

## Test

```bash
npm test
```
