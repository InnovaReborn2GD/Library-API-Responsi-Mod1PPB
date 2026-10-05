# Tasks: Library Loans API

- [x] Task 1: Menyiapkan konfigurasi aplikasi, Supabase client, dan skema database
  - Acceptance: Struktur source tersedia, env dikonfigurasi dari `.env`, dan DDL `loans` sesuai `SPEC.md`.
  - Verify: `node --check` pada file JavaScript terkait.
  - Files: `src/config/supabase.js`, `supabase/schema.sql`, `.env.example`
  - Dependencies: None

- [x] Task 2: Menambahkan validasi payload dan query loans
  - Acceptance: Payload create/update dan query filter menolak nilai invalid dengan error yang dapat dipetakan ke HTTP 400.
  - Verify: `npm test -- --test-name-pattern="validation"`.
  - Files: `src/validation/loans.js`, `test/validation.test.js`
  - Dependencies: Task 1

- [x] Task 3: Mengimplementasikan service dan endpoint CRUD loans
  - Acceptance: GET/POST/PUT/DELETE loans memanggil service yang sesuai, mendukung filter, dan menghasilkan status response sesuai kontrak.
  - Verify: `npm test -- --test-name-pattern="loans"`.
  - Files: `src/services/loans.js`, `src/controllers/loans.js`, `src/routes/loans.js`, `test/loans.test.js`
  - Dependencies: Task 2

- [x] Task 4: Menambahkan error handler, health endpoint, dan script npm
  - Acceptance: `/health`, error mapping, `npm start`, dan `npm run dev` tersedia.
  - Verify: `npm test` dan `node --check src/app.js src/server.js`.
  - Files: `src/app.js`, `src/server.js`, `package.json`, `test/app.test.js`
  - Dependencies: Task 3

- [x] Task 5: Melengkapi dokumentasi penggunaan dan menjalankan verifikasi akhir
  - Acceptance: README menjelaskan setup Supabase, env, schema, endpoint, contoh filter, dan hasil test.
  - Verify: `npm test`.
  - Files: `README.md`
  - Dependencies: Task 4

## Checkpoint: Complete

- [x] `npm test` lulus
- [x] Semua endpoint pada `SPEC.md` terwakili
- [x] Tidak ada secrets atau `.env` yang dilacak
