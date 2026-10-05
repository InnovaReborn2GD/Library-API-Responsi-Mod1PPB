const VALID_MEMBER_TYPES = ['STUDENT', 'ADMIN'];
const VALID_STATUSES = ['DIPINJAM', 'DIKEMBALIKAN', 'TERLAMBAT'];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

function requiredString(input, field) {
  if (typeof input[field] !== 'string' || input[field].trim() === '') {
    throw new ValidationError(`${field} is required`);
  }
  return input[field].trim();
}

function date(value, field, nullable = false) {
  if (nullable && value === null) return null;
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) {
    throw new ValidationError(`${field} must use YYYY-MM-DD format`);
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new ValidationError(`${field} must be a valid date`);
  }
  return value;
}

function object(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new ValidationError('Request body must be an object');
  }
}

function validateMemberInput(input) {
  object(input);
  const result = {
    nama_lengkap: requiredString(input, 'nama_lengkap'),
    email: requiredString(input, 'email').toLowerCase(),
    tipe_member: input.tipe_member === undefined ? 'STUDENT' : input.tipe_member,
  };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email)) {
    throw new ValidationError('email must be valid');
  }
  if (!VALID_MEMBER_TYPES.includes(result.tipe_member)) {
    throw new ValidationError(`tipe_member must be one of: ${VALID_MEMBER_TYPES.join(', ')}`);
  }
  return result;
}

function validateBookInput(input) {
  object(input);
  const result = {
    isbn: requiredString(input, 'isbn'),
    judul: requiredString(input, 'judul'),
    penulis: requiredString(input, 'penulis'),
    kategori: requiredString(input, 'kategori'),
    total_ketersediaan: input.total_ketersediaan,
  };
  if (!Number.isInteger(result.total_ketersediaan) || result.total_ketersediaan < 0) {
    throw new ValidationError('total_ketersediaan must be a non-negative integer');
  }
  return result;
}

function validateLoanInput(input) {
  object(input);
  const status = input.status_peminjaman === undefined ? 'DIPINJAM' : input.status_peminjaman;
  if (typeof input.buku_id !== 'string' || !UUID_PATTERN.test(input.buku_id)) {
    throw new ValidationError('buku_id must be a valid UUID');
  }
  if (typeof input.anggota_id !== 'string' || !UUID_PATTERN.test(input.anggota_id)) {
    throw new ValidationError('anggota_id must be a valid UUID');
  }
  if (!VALID_STATUSES.includes(status)) {
    throw new ValidationError(`status_peminjaman must be one of: ${VALID_STATUSES.join(', ')}`);
  }
  const result = {
    buku_id: input.buku_id,
    anggota_id: input.anggota_id,
    tanggal_peminjaman: date(input.tanggal_peminjaman, 'tanggal_peminjaman'),
    tenggat_peminjaman: date(input.tenggat_peminjaman, 'tenggat_peminjaman'),
    tanggal_pengembalian: input.tanggal_pengembalian === undefined
      ? null : date(input.tanggal_pengembalian, 'tanggal_pengembalian', true),
    status_peminjaman: status,
  };
  if (result.tenggat_peminjaman < result.tanggal_peminjaman) {
    throw new ValidationError('tenggat_peminjaman must be on or after tanggal_peminjaman');
  }
  if (status === 'DIKEMBALIKAN' && !result.tanggal_pengembalian) {
    throw new ValidationError('tanggal_pengembalian is required for DIKEMBALIKAN');
  }
  return result;
}

function validateListQuery(query, fields, enumFields = {}) {
  const result = {};
  for (const field of fields) {
    if (query[field] !== undefined) {
      if (typeof query[field] !== 'string' || query[field].trim() === '') {
        throw new ValidationError(`${field} query must not be empty`);
      }
      result[field] = query[field].trim();
      if (enumFields[field] && !enumFields[field].includes(result[field])) {
        throw new ValidationError(`${field} must be one of: ${enumFields[field].join(', ')}`);
      }
    }
  }
  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? 20 : Number(query.limit);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new ValidationError('page must be >= 1 and limit must be between 1 and 100');
  }
  return { filters: result, page, limit };
}

module.exports = {
  VALID_MEMBER_TYPES, VALID_STATUSES, UUID_PATTERN, ValidationError,
  validateMemberInput, validateBookInput, validateLoanInput, validateListQuery,
};
