function createResourceController(model, { validateInput, fields, enumFields, resourceName }) {
  const { UUID_PATTERN, ValidationError } = require('../validation');
  function validateId(id) {
    if (!UUID_PATTERN.test(id)) throw new ValidationError('id must be a valid UUID');
  }
  return {
    list: async (req, res, next) => {
      try {
        const { filters, page, limit } = require('../validation').validateListQuery(
          req.query, fields, enumFields,
        );
        const data = await model.list(filters, page, limit);
        return res.json({ data, meta: { page, limit, count: data.length } });
      } catch (error) {
        return next(error);
      }
    },
    findById: async (req, res, next) => {
      try {
        validateId(req.params.id);
        const data = await model.findById(req.params.id);
        if (!data) return res.status(404).json({ error: { code: 'NOT_FOUND', message: `${resourceName} not found` } });
        return res.json({ data });
      } catch (error) {
        return next(error);
      }
    },
    create: async (req, res, next) => {
      try {
        return res.status(201).json({ data: await model.create(validateInput(req.body)) });
      } catch (error) {
        return next(error);
      }
    },
    update: async (req, res, next) => {
      try {
        validateId(req.params.id);
        return res.json({ data: await model.update(req.params.id, validateInput(req.body)) });
      } catch (error) {
        return next(error);
      }
    },
    remove: async (req, res, next) => {
      try {
        validateId(req.params.id);
        await model.remove(req.params.id);
        return res.status(204).send();
      } catch (error) {
        return next(error);
      }
    },
  };
}

module.exports = { createResourceController };
