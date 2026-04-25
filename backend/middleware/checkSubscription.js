/**
 * Middleware: Check if supplier's paid subscription has expired.
 */
import User from "../models/User.js";

export async function checkSubscriptionExpiry(req, res, next) {
  try {
    if (req.role !== "supplier" || !req.plan || req.plan === "none") {
      return next();
    }

    const user = await User.findById(req.userId).select(
      "plan subscriptionStatus subscriptionCurrentPeriodEnd"
    );

    if (!user) return next();

    const now = new Date();
    const periodEnd = user.subscriptionCurrentPeriodEnd;

    if (
      periodEnd &&
      now > periodEnd &&
      user.subscriptionStatus === "active"
    ) {
      user.plan = "none";
      user.subscriptionStatus = "inactive";
      await user.save();

      req.plan = "none";
      req.subscriptionStatus = "inactive";

      console.log(
        `[SUBSCRIPTION] Plan expired for user ${req.userId}. Downgraded to none.`
      );
    }

    return next();
  } catch (err) {
    console.error("[checkSubscriptionExpiry] Error:", err.message);
    return next();
  }
}