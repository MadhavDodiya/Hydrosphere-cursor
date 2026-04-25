import logger from '../utils/logger.js';

/**
 * PRODUCTION ANALYTICS SERVICE
 * Tracks core business events for platform growth monitoring.
 */
export const ANALYTICS_EVENTS = {
  SIGNUP: 'signup',
  TRIAL_STARTED: 'trial_started',
  INQUIRY_SENT: 'inquiry_sent',
  PLAN_UPGRADED: 'plan_upgraded',
  LISTING_CREATED: 'listing_created',
};

export function trackEvent(userId, eventType, metadata = {}) {
  try {
    // In production, this would send data to Mixpanel, Segment, or a dedicated Analytics DB
    const logData = {
      userId,
      event: eventType,
      timestamp: new Date(),
      ...metadata,
    };

    logger.info(`[ANALYTICS] ${eventType.toUpperCase()} - User: ${userId}`, logData);
    
    // Example: if (eventType === ANALYTICS_EVENTS.PLAN_UPGRADED) { ... update LTV metrics ... }
  } catch (err) {
    logger.error(`[ANALYTICS] Tracking failed for ${eventType}:`, err);
  }
}
