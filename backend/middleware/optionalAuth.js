import jwt from "jsonwebtoken";

/**
 * If a Bearer token is present and valid, sets req.userId and req.userRole.
 * Does not reject the request when missing or invalid (for public routes that enrich data).
 */
export function optionalAuthenticate(req, _res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
  } catch {
    // ignore invalid token on optional routes
  }
  next();
}
