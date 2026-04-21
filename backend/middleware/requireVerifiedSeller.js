/**
 * Requires the authenticated user to be a verified supplier (admin-approved).
 * Use after authenticate + authorizeRoles("seller").
 */
export function requireVerifiedSeller(req, res, next) {
  if (!req.isSupplierVerified) {
    return res.status(403).json({ message: "Supplier verification required" });
  }
  return next();
}

