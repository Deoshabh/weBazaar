/**
 * Request Validation Middleware
 * Validates request body, params, and query using Zod schemas
 */

const validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      // ✅ CORS Fix: Bypass OPTIONS preflight requests
      if (req.method === "OPTIONS") {
        return next();
      }

      // Validate request data
      const validated = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Replace request data with validated data
      req.body = validated.body || req.body;
      req.query = validated.query || req.query;
      req.params = validated.params || req.params;

      next();
    } catch (error) {
      // Zod validation error
      if (error.name === "ZodError") {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return res.status(400).json({
          message: "Validation failed",
          errors,
        });
      }

      // Other errors
      return res.status(500).json({
        message: "Validation error",
        error: error.message,
      });
    }
  };
};

module.exports = { validateRequest };
