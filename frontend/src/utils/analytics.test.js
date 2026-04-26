import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { trackEvent, ANALYTICS_EVENTS } from './analytics';

describe('analytics', () => {
  let originalEnv;

  beforeEach(() => {
    // Spy on console.log
    vi.spyOn(console, 'log').mockImplementation(() => {});

    // Save original env
    originalEnv = import.meta.env;
    // Mock import.meta.env
    vi.stubEnv('PROD', false);
  });

  afterEach(() => {
    // Restore console.log and timers
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  describe('trackEvent', () => {
    it('should log structured events with timestamp, eventName, and empty default properties', () => {
      // Mock Date to have a consistent timestamp for testing
      const mockDate = new Date('2023-01-01T00:00:00.000Z');
      vi.useFakeTimers();
      vi.setSystemTime(mockDate);

      trackEvent(ANALYTICS_EVENTS.SIGNUP_STARTED);

      expect(console.log).toHaveBeenCalledWith(
        '[ANALYTICS] 2023-01-01T00:00:00.000Z - signup_started',
        {}
      );
    });

    it('should log structured events with custom properties', () => {
      const mockDate = new Date('2023-01-01T00:00:00.000Z');
      vi.useFakeTimers();
      vi.setSystemTime(mockDate);

      const properties = { plan: 'pro', source: 'homepage' };
      trackEvent(ANALYTICS_EVENTS.PLAN_UPGRADE_CLICKED, properties);

      expect(console.log).toHaveBeenCalledWith(
        '[ANALYTICS] 2023-01-01T00:00:00.000Z - plan_upgrade_clicked',
        properties
      );
    });

    it('should not throw errors when import.meta.env.PROD is true', () => {
      vi.stubEnv('PROD', true);

      // Right now the PROD block in trackEvent contains commented out code.
      // This test ensures that when PROD is true, it still executes without errors.
      expect(() => {
        trackEvent('test_event');
      }).not.toThrow();
    });
  });
});
