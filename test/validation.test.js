const test = require('node:test');
const assert = require('node:assert/strict');

const {
  validateMemberInput,
  validateBookInput,
  validateLoanInput,
  VALID_STATUSES,
  VALID_MEMBER_TYPES,
  validateListQuery,
} = require('../src/validation');

test('validates a complete loan payload', () => {
  const result = validateLoanInput({
    anggota_id: '11111111-1111-4111-8111-111111111111',
    buku_id: '22222222-2222-4222-8222-222222222222',
    tanggal_peminjaman: '2026-10-01',
    tenggat_peminjaman: '2026-10-08',
  });

  assert.deepEqual(result, {
    anggota_id: '11111111-1111-4111-8111-111111111111',
    buku_id: '22222222-2222-4222-8222-222222222222',
    tanggal_peminjaman: '2026-10-01',
    tenggat_peminjaman: '2026-10-08',
    tanggal_pengembalian: null,
    status_peminjaman: 'DIPINJAM',
  });
});

test('validates member and book payloads', () => {
  assert.deepEqual(validateMemberInput({
    nama_lengkap: ' Alya ',
    email: 'ALYA@example.com',
  }), { nama_lengkap: 'Alya', email: 'alya@example.com', tipe_member: 'STUDENT' });
  assert.deepEqual(validateBookInput({
    isbn: '978-1',
    judul: 'Buku',
    penulis: 'Penulis',
    kategori: 'Novel',
    total_ketersediaan: 2,
  }).total_ketersediaan, 2);
});

test('rejects missing fields and invalid status', () => {
  assert.throws(
    () => validateLoanInput({ anggota_id: 'invalid', status_peminjaman: 'AKTIF' }),
    (error) => error.statusCode === 400
      && error.message.includes('buku_id'),
  );
});

test('accepts supported query filters and pagination', () => {
  assert.deepEqual(
    validateListQuery({
      status_peminjaman: 'TERLAMBAT',
      page: '2',
      limit: '10',
    }, ['status_peminjaman'], { status_peminjaman: VALID_STATUSES }),
    { filters: { status_peminjaman: 'TERLAMBAT' }, page: 2, limit: 10 },
  );
});

assert.deepEqual(VALID_STATUSES, ['DIPINJAM', 'DIKEMBALIKAN', 'TERLAMBAT']);
assert.deepEqual(VALID_MEMBER_TYPES, ['STUDENT', 'ADMIN']);
