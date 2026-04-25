/**
 * Middleware: Ensure the user has an active paid subscription.
 * Used for features gated for paying suppliers (e.g., creating listings, receiving inquiries).
 */
export function requireSubscription(req, res, next) {
  // Admins are exempt
  if (req.role === 'admin') return next();

  // Buyers don't need a subscription for their core features (browsing, inquiring)
  // But if a buyer feature is gated, we can check here.
  if (req.role === 'buyer') return next();

  if (req.role === 'supplier') {
    if (req.subscriptionStatus === 'active' && req.plan && req.plan !== 'none') {
      return next();
    }
    
    return res.status(403).json({ 
      message: "An active subscription plan is required to access this feature.",
      code: "SUBSCRIPTION_REQUIRED"
    });
  }

  return res.status(403).json({ message: "Access denied" });
}
