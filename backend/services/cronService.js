import cron from "node-cron";
import User from "../models/User.js";
import logger from "../utils/logger.js";

/**
 * DAILY BACKGROUND JOBS (Task #11 Audit Fix)
 * Runs at 00:00 every day.
 */
export function initCronJobs() {
  cron.schedule("0 0 * * *", async () => {
    logger.info("[CRON] Starting daily subscription and trial audit...");
    
    try {
      const now = new Date();

      // 1. Find expired Free Trials
      const expiredTrials = await User.updateMany(
        {
          plan: { $in: ["Starter", "free"] },
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

      // 2. Find expired Paid Subscriptions
      const expiredSubs = await User.updateMany(
        {
          plan: { $nin: ["none", "Starter", "free"] },
          subscriptionStatus: "active",
          subscriptionCurrentPeriodEnd: { $lt: now }
        },
        {
          $set: {
            plan: "none",
            subscriptionStatus: "inactive"
          }
        }
      );

      if (expiredSubs.modifiedCount > 0) {
        logger.info(`[CRON] Downgraded ${expiredSubs.modifiedCount} expired paid subscriptions.`);
      }

    } catch (err) {
      logger.error("[CRON] Error during daily audit:", err);
    }
  });

  logger.info("[CRON] Daily background jobs initialized.");
}
