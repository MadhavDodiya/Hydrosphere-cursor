import User from "../models/User.js";

/**
 * Middleware: Ensure the user has an active paid subscription.
 * Used for features gated for paying suppliers (e.g., creating listings, receiving inquiries).
 * Also checks for subscription expiry and downgrades if necessary.
 */
export async function requireSubscription(req, res, next) {
  try {
    // Admins are exempt
    if (req.role === 'admin') return next();

    // Buyers don't need a subscription for their core features (browsing, inquiring)
    if (req.role === 'buyer') return next();

    if (req.role === 'supplier') {
      const user = await User.findById(req.userId).select(
        "plan subscriptionStatus subscriptionCurrentPeriodEnd trialExpiresAt trialActive"
      );

      if (!user) {
        return res.status(403).json({ message: "Access denied" });
      }

      const now = new Date();
      const periodEnd = user.subscriptionCurrentPeriodEnd;
      const trialEnd = user.trialExpiresAt;

      let isExpired = false;

      // Check paid subscription expiry
      if (periodEnd && now > periodEnd && user.subscriptionStatus === "active" && user.plan !== "Starter" && user.plan !== "free") {
        isExpired = true;
      }

      // Check free trial expiry
      if ((user.plan === "Starter" || user.plan === "free") && trialEnd && now > trialEnd && user.subscriptionStatus === "active") {
        isExpired = true;
      }

      if (isExpired) {
        user.plan = "none";
        user.subscriptionStatus = "inactive";
        user.trialActive = false;
        await user.save();

        req.plan = "none";
        req.subscriptionStatus = "inactive";
        req.trialActive = false;

        console.log(
          `[SUBSCRIPTION] Plan expired for user ${req.userId}. Downgraded to none.`
        );
      }

      if (req.subscriptionStatus === 'active' && req.plan && req.plan !== 'none') {
        return next();
      }

      return res.status(403).json({
        message: "An active subscription plan is required to access this feature.",
        code: "SUBSCRIPTION_REQUIRED"
      });
    }

    return res.status(403).json({ message: "Access denied" });
  } catch (err) {
    console.error("[requireSubscription] Error:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
}
