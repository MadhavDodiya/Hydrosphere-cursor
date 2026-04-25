/**
 * Role-based authorization middleware.
 *
 * Usage:
 *   router.get("/path", authenticate, authorizeRoles("supplier", "admin"), handler)
 */
export function authorizeRoles(...allowedRoles) {
  const allowed = new Set(allowedRoles.flat().filter(Boolean));

  return (req, res, next) => {
    // authenticate() should set req.role; keep this guard to avoid accidental unprotected usage.
    if (!req.role) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!allowed.has(req.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return next();
  };
}

