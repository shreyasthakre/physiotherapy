import ApiError from '../utils/ApiError.js';

/**
 * Validate `req.body`, `req.query`, and/or `req.params` against Zod
 * schemas. Parsed (and coerced) values replace the originals.
 *
 * Usage:
 *   validate({ body: someSchema, query: anotherSchema })
 */
const validate = (schemas) => (req, _res, next) => {
  try {
    if (schemas.body) req.body = schemas.body.parse(req.body ?? {});
    if (schemas.query) req.validatedQuery = schemas.query.parse(req.query ?? {});
    if (schemas.params) req.params = schemas.params.parse(req.params ?? {});
    return next();
  } catch (err) {
    const details = err.errors?.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));
    return next(ApiError.badRequest('Validation failed', details));
  }
};

export default validate;
