import { ZodError } from "zod";

function formatZodError(err) {
  if (!(err instanceof ZodError)) return null;
  return err.issues.map((i) => ({
    path: i.path.join("."),
    message: i.message,
  }));
}

/**
 * Validates and coerces request inputs using Zod schemas.
 * Pass any of: { body, query, params }.
 */
export function validate(schemas) {
  return (req, res, next) => {
    try {
      if (schemas?.body) req.body = schemas.body.parse(req.body);
      if (schemas?.query) req.query = schemas.query.parse(req.query);
      if (schemas?.params) req.params = schemas.params.parse(req.params);
      return next();
    } catch (err) {
      const issues = formatZodError(err);
      if (issues) {
        return res.status(400).json({ message: "Validation failed", issues });
      }
      return next(err);
    }
  };
}

