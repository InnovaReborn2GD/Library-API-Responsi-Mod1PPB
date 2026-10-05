# Implementation Plan: Library Loans API

## Overview

Implementasi API Express untuk CRUD peminjaman buku yang terhubung ke Supabase,
dengan validasi payload/query, filter daftar, error handling terpusat, dan test
otomatis tanpa ketergantungan pada database remote saat test.

## Architecture Decisions

- Pisahkan route, controller, service, dan validation agar kontrak HTTP tidak
  bercampur dengan akses Supabase.
- Inject dependency service ke controller/app saat testing sehingga test dapat
  memakai fake service.
- Gunakan satu error handler Express untuk memetakan validation, not-found, dan
  database errors tanpa membocorkan detail internal.
- Simpan DDL tabel di `supabase/schema.sql`; credential hanya dari environment.

## Task List

### Phase 1: Foundation

- [x] Task 1: Menyiapkan konfigurasi aplikasi, Supabase client, dan skema database
- [x] Task 2: Menambahkan validasi payload dan query loans

### Checkpoint: Foundation

- [x] Aplikasi dapat di-load tanpa credential database saat test
- [x] Validasi memiliki test untuk input valid dan invalid

### Phase 2: Core API

- [x] Task 3: Mengimplementasikan service dan endpoint CRUD loans
- [x] Task 4: Menambahkan error handler, health endpoint, dan script npm

### Checkpoint: Core API

- [x] Semua test endpoint CRUD dan filter lulus
- [x] `npm start` dan `npm run dev` tersedia

### Phase 3: Documentation and Verification

- [x] Task 5: Melengkapi dokumentasi penggunaan dan menjalankan verifikasi akhir

### Checkpoint: Complete

- [x] Semua success criteria pada `SPEC.md` terpenuhi
- [x] Tidak ada credential yang masuk repository

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Credential Supabase tidak tersedia di lingkungan lokal | High | Validasi env saat client dipakai; test menggunakan fake service |
| Status atau tanggal tidak konsisten | Medium | Whitelist status dan validasi format tanggal ISO |
| Error Supabase bocor ke client | High | Error handler mengembalikan pesan publik yang aman |

## Open Questions

- Autentikasi, pagination, dan sorting tetap di luar scope sesuai spesifikasi.
