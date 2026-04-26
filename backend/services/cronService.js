import cron from "node-cron";
import User from "../models/User.js";
import Subscription from "../models/Subscription.js";
import logger from "../utils/logger.js";

/**
 * Audit and downgrade expired Free Trials.
 */
export async function auditExpiredTrials() {
  const now = new Date();
  try {
    const expiredTrials = await User.updateMany(
      {
        plan: { $in: ["free", "Starter"] },
        subscriptionStatus: "active",
        trialExpiresAt: { $lt: now }
      },
      {
        $set: {
          plan: "none",
          subscriptionStatus: "inactive",
          trialActive: false
        }
      }
    );

    if (expiredTrials.modifiedCount > 0) {
      logger.info(`[CRON] Downgraded ${expiredTrials.modifiedCount} expired trial accounts.`);
    }
    return expiredTrials.modifiedCount;
  } catch (err) {
    logger.error("[CRON] Error during trial audit:", err);
    throw err;
  }
}

/**
 * Audit and downgrade expired Paid Subscriptions.
 */
export async function auditExpiredSubscriptions() {
  const now = new Date();
  try {
    // 1. Find users whose subscriptions have ended
    const expiredUsers = await User.find({
      plan: { $nin: ["none", "free", "Starter"] },
      subscriptionStatus: "active",
      subscriptionCurrentPeriodEnd: { $lt: now }
    }).select("_id").lean();

    if (expiredUsers.length === 0) return 0;

    const userIds = expiredUsers.map(u => u._id);

    // 2. Downgrade Users
    await User.updateMany(
      { _id: { $in: userIds } },
      {
        $set: {
          plan: "none",
          subscriptionStatus: "inactive"
        }
      }
    );

    // 3. Update Subscription records to "expired"
    const expiredSubs = await Subscription.updateMany(
      {
        userId: { $in: userIds },
        status: "active"
      },
      {
        $set: { status: "expired" }
      }
    );

    logger.info(`[CRON] Downgraded ${expiredUsers.length} users and expired ${expiredSubs.modifiedCount} subscription records.`);
    return expiredUsers.length;
  } catch (err) {
    logger.error("[CRON] Error during subscription audit:", err);
    throw err;
  }
}

/**
 * DAILY BACKGROUND JOBS (Task #11 Audit Fix)
 * Runs at 00:00 every day.
 */
export function initCronJobs() {
  cron.schedule("0 0 * * *", async () => {
    logger.info("[CRON] Starting daily subscription and trial audit...");

    try {
      await auditExpiredTrials();
      await auditExpiredSubscriptions();
      logger.info("[CRON] Daily audit completed successfully.");
    } catch (err) {
      logger.error("[CRON] Error during daily audit:", err);
    }
  });

  logger.info("[CRON] Daily background jobs initialized.");
}
