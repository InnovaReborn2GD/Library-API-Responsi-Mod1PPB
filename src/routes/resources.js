const express = require('express');
const { createResourceController } = require('../controllers/resources');
const {
  validateMemberInput, validateBookInput, validateLoanInput,
  VALID_MEMBER_TYPES, VALID_STATUSES,
} = require('../validation');

function createResourceRouter(model, config) {
  const router = express.Router();
  const controller = createResourceController(model, config);
  router.get('/', controller.list);
  router.post('/', controller.create);
  router.get('/:id', controller.findById);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.remove);
  return router;
}

function createMemberRouter(model) {
  return createResourceRouter(model, {
    validateInput: validateMemberInput,
    fields: ['tipe_member', 'email'],
    enumFields: { tipe_member: VALID_MEMBER_TYPES },
    resourceName: 'Member',
  });
}

function createBookRouter(model) {
  return createResourceRouter(model, {
    validateInput: validateBookInput,
    fields: ['isbn', 'kategori'],
    enumFields: {},
    resourceName: 'Book',
  });
}

function createLoanRouter(model) {
  return createResourceRouter(model, {
    validateInput: validateLoanInput,
    fields: ['status_peminjaman', 'anggota_id', 'buku_id'],
    enumFields: { status_peminjaman: VALID_STATUSES },
    resourceName: 'Loan',
  });
}

module.exports = { createMemberRouter, createBookRouter, createLoanRouter };
