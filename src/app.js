const express = require('express');
const { ValidationError } = require('./validation');
const { createMemberRouter, createBookRouter, createLoanRouter } = require('./routes/resources');

function createApp({ models } = {}) {
  if (!models) {
    throw new Error('models is required');
  }

  const app = express();
  app.disable('x-powered-by');
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
    next();
  });
  app.use(express.json({ limit: '100kb' }));
  app.get('/health', (_req, res) => res.json({ data: { status: 'ok' } }));
  app.use('/members', createMemberRouter(models.member));
  app.use('/books', createBookRouter(models.book));
  app.use('/loans', createLoanRouter(models.loan));

  app.use((error, _req, res, _next) => {
    if (error instanceof ValidationError || error.statusCode === 400 || error instanceof SyntaxError) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: error.message },
      });
    }
    if (error.statusCode === 404) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: error.message },
      });
    }
    console.error(error);
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  });

  return app;
}

module.exports = { createApp };
