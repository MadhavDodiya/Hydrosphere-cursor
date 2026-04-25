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
      "plan subscriptionStatus subscriptionCurrentPeriodEnd trialExpiresAt trialActive"
    );

    if (!user) return next();

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

    return next();
  } catch (err) {
    console.error("[checkSubscriptionExpiry] Error:", err.message);
    return next();
  }
}