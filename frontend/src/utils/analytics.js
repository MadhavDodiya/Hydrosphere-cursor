/**
 * Simple Analytics Wrapper (Task #11 Audit Fix)
 * In a real production app, this would wrap Google Analytics or PostHog.
 * For now, it logs structured events and could be linked to a backend tracking endpoint.
 */

export const trackEvent = (eventName, properties = {}) => {
  const timestamp = new Date().toISOString();
  
  // 1. Structured log for local debugging
  console.log(`[ANALYTICS] ${timestamp} - ${eventName}`, properties);

  // 2. Placeholder for production provider
  if (import.meta.env.PROD) {
     // window.gtag('event', eventName, properties);
     // posthog.capture(eventName, properties);
  }
};

export const ANALYTICS_EVENTS = {
  SIGNUP_STARTED: "signup_started",
  TRIAL_STARTED: "trial_started",
  PLAN_UPGRADE_CLICKED: "plan_upgrade_clicked",
  CHECKOUT_COMPLETED: "checkout_completed",
  INQUIRY_SENT: "inquiry_sent",
  LISTING_CREATED: "listing_created",
};
