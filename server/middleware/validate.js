const { ZodError } = require('zod');
const ApiError = require('../utils/ApiError');

/**
 * Middleware factory that validates request body against a Zod schema.
 * Usage: validate(myZodSchema)
 */
const validate = (schema) => {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map(
          (e) => `${e.path.join('.')}: ${e.message}`
        );
        return next(ApiError.badRequest('Validation failed', messages));
      }
      next(error);
    }
  };
};

module.exports = validate;
