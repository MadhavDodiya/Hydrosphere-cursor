/**
 * Middleware: Check if seller's paid subscription has expired.
 * If expired, downgrade plan to "free" automatically.
 * Use AFTER authenticate middleware on seller-specific routes.
 */
import User from "../models/User.js";

export async function checkSubscriptionExpiry(req, res, next) {
  try {
    // Only check sellers with a paid plan
    if (req.role !== "seller" || !req.plan || req.plan === "free") {
      return next();
    }

    const user = await User.findById(req.userId).select(
      "plan subscriptionStatus subscriptionCurrentPeriodEnd"
    );

    if (!user) return next();

    const now = new Date();
    const periodEnd = user.subscriptionCurrentPeriodEnd;

    // If paid plan has expired
    if (
      periodEnd &&
      now > periodEnd &&
      user.subscriptionStatus === "active"
    ) {
      user.plan = "free";
      user.subscriptionStatus = "inactive";
      await user.save();

      // Update req so downstream middleware uses correct limits
      req.plan = "free";
      req.subscriptionStatus = "inactive";

      console.log(
        `[SUBSCRIPTION] Plan expired for user ${req.userId}. Downgraded to free.`
      );
    }

    return next();
  } catch (err) {
    console.error("[checkSubscriptionExpiry] Error:", err.message);
    return next(); // Non-blocking — don't crash the request
  }
}