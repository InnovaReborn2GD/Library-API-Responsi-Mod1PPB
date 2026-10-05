# Library API Specification

## Stack and architecture

- Node.js CommonJS, Express.js, and `@supabase/supabase-js`.
- Supabase PostgreSQL schema is in [`supabase/schema.sql`](./supabase/schema.sql).
- MVC-style separation:
  - `src/config`: external configuration
  - `src/models`: Supabase data access
  - `src/controllers`: HTTP handling and validation orchestration
  - `src/routes`: route mapping
  - `src/views`: not required for this JSON-only API

## Database contract

The schema contains `anggota`, `buku`, and `peminjaman`. IDs are UUIDs.
`anggota.email` and `buku.isbn` are unique. `peminjaman` references both
parent tables with `ON DELETE RESTRICT`.

`buku.tersedia` is maintained by a PostgreSQL trigger. `DIPINJAM` and
`TERLAMBAT` are active statuses; `DIKEMBALIKAN` is inactive and requires a
return date. Date order and non-negative stock are enforced in PostgreSQL and
validated at the API boundary.

## API contract

Resources use plural English paths while payload fields follow the database
contract:

- `/members`: `nama_lengkap`, `email`, `tipe_member`
- `/books`: `isbn`, `judul`, `penulis`, `kategori`, `total_ketersediaan`
- `/loans`: `anggota_id`, `buku_id`, `tanggal_peminjaman`,
  `tenggat_peminjaman`, `tanggal_pengembalian`, `status_peminjaman`

`GET /members`, `GET /books`, and `GET /loans` accept `page` and `limit`.
Loan filters are `status_peminjaman`, `anggota_id`, and `buku_id`.

Success responses use `{ data }`; list responses additionally include
`meta: { page, limit, count }`. Create returns `201`, delete returns `204`,
invalid input returns `400`, missing resources return `404`, and unhandled
database errors return `500` without internal details.

## Environment

```text
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The service-role key is backend-only. Authentication and authorization are
outside this revision.
