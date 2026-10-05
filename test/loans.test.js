const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

const { createApp } = require('../src/app');

const loan = {
  id: '11111111-1111-4111-8111-111111111111',
  anggota_id: '11111111-1111-4111-8111-111111111111',
  buku_id: '22222222-2222-4222-8222-222222222222',
  tanggal_peminjaman: '2026-10-01',
  tenggat_peminjaman: '2026-10-08',
  tanggal_pengembalian: null,
  status_peminjaman: 'DIPINJAM',
};

function request(app, method, path, body) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      const payload = body ? JSON.stringify(body) : null;
      const req = http.request({
        port,
        path,
        method,
        headers: payload ? {
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(payload),
        } : {},
      }, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => { responseBody += chunk; });
        res.on('end', () => {
          server.close();
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: responseBody ? JSON.parse(responseBody) : null,
          });
        });
      });
      req.on('error', (error) => {
        server.close();
        reject(error);
      });
      if (payload) req.write(payload);
      req.end();
    });
  });
}

test('lists loans using status filter', async () => {
  const models = {
    loan: {
      list: async (filters) => (filters.status_peminjaman === 'TERLAMBAT'
        ? [{ ...loan, status_peminjaman: 'TERLAMBAT' }] : []),
    },
  };
  const response = await request(createApp({ models }), 'GET', '/loans?status_peminjaman=TERLAMBAT');

  assert.equal(response.status, 200);
  assert.equal(response.body.data[0].status_peminjaman, 'TERLAMBAT');
});

test('creates a loan and returns 201', async () => {
  const models = { loan: { create: async (input) => ({ ...input, id: loan.id }) } };
  const response = await request(createApp({ models }), 'POST', '/loans', loan);

  assert.equal(response.status, 201);
  assert.equal(response.body.data.id, loan.id);
});

test('returns 400 for invalid loan payload', async () => {
  const response = await request(createApp({ models: { loan: {} } }), 'POST', '/loans', { status_peminjaman: 'AKTIF' });

  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'VALIDATION_ERROR');
});

test('returns 404 when a loan does not exist', async () => {
  const models = { loan: { findById: async () => null } };
  const response = await request(createApp({ models }), 'GET', `/loans/${loan.id}`);

  assert.equal(response.status, 404);
  assert.equal(response.body.error.code, 'NOT_FOUND');
});

test('updates a loan and deletes it', async () => {
  let updatedLoan;
  const models = { loan: {
    update: async (id, input) => {
      updatedLoan = { ...input, id };
      return updatedLoan;
    },
    remove: async () => {},
  } };
  const app = createApp({ models });
  const updateResponse = await request(app, 'PUT', `/loans/${loan.id}`, loan);
  const deleteResponse = await request(app, 'DELETE', `/loans/${loan.id}`);

  assert.equal(updateResponse.status, 200);
  assert.equal(updatedLoan.status_peminjaman, 'DIPINJAM');
  assert.equal(deleteResponse.status, 204);
  assert.equal(deleteResponse.body, null);
});

test('returns health status', async () => {
  const response = await request(createApp({ models: { loan: {} } }), 'GET', '/health');

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { data: { status: 'ok' } });
  assert.equal(response.headers['x-content-type-options'], 'nosniff');
  assert.equal(response.headers['x-frame-options'], 'DENY');
});
