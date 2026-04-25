/**
 * Requires the authenticated user to be an approved supplier.
 */
export function requireApprovedSupplier(req, res, next) {
  if (!req.isApproved) {
    return res.status(403).json({ message: "Your supplier account is awaiting admin approval." });
  }
  return next();
}
