import { test, describe, mock, afterEach } from 'node:test';
import assert from 'node:assert';
import { trackEvent, ANALYTICS_EVENTS } from './analyticsService.js';
import logger from '../utils/logger.js';

describe('Analytics Service', () => {
  afterEach(() => {
    mock.restoreAll();
  });

  describe('trackEvent', () => {
    test('should log event successfully with all required fields', () => {
      const mockInfo = mock.method(logger, 'info', () => {});

      const userId = 'user123';
      const eventType = ANALYTICS_EVENTS.SIGNUP;
      const metadata = { plan: 'pro', source: 'organic' };

      trackEvent(userId, eventType, metadata);

      assert.strictEqual(mockInfo.mock.callCount(), 1);

      const callArgs = mockInfo.mock.calls[0].arguments;
      assert.strictEqual(callArgs[0], `[ANALYTICS] SIGNUP - User: user123`);

      const logData = callArgs[1];
      assert.strictEqual(logData.userId, userId);
      assert.strictEqual(logData.event, eventType);
      assert.ok(logData.timestamp instanceof Date);
      assert.strictEqual(logData.plan, 'pro');
      assert.strictEqual(logData.source, 'organic');
    });

    test('should log event successfully with default empty metadata', () => {
      const mockInfo = mock.method(logger, 'info', () => {});

      const userId = 'user456';
      const eventType = ANALYTICS_EVENTS.INQUIRY_SENT;

      trackEvent(userId, eventType);

      assert.strictEqual(mockInfo.mock.callCount(), 1);

      const callArgs = mockInfo.mock.calls[0].arguments;
      assert.strictEqual(callArgs[0], `[ANALYTICS] INQUIRY_SENT - User: user456`);

      const logData = callArgs[1];
      assert.strictEqual(logData.userId, userId);
      assert.strictEqual(logData.event, eventType);
      assert.ok(logData.timestamp instanceof Date);

      // No extra fields should be present besides the core ones
      const keys = Object.keys(logData);
      assert.strictEqual(keys.length, 3);
      assert.ok(keys.includes('userId'));
      assert.ok(keys.includes('event'));
      assert.ok(keys.includes('timestamp'));
    });

    test('should handle and log errors that occur during tracking', () => {
      // Force an error by causing logger.info to throw
      const testError = new Error('Logger failure');
      mock.method(logger, 'info', () => {
        throw testError;
      });

      const mockError = mock.method(logger, 'error', () => {});

      const userId = 'user789';
      const eventType = ANALYTICS_EVENTS.LISTING_CREATED;

      // This should not throw an unhandled exception
      trackEvent(userId, eventType);

      assert.strictEqual(mockError.mock.callCount(), 1);

      const callArgs = mockError.mock.calls[0].arguments;
      assert.strictEqual(callArgs[0], `[ANALYTICS] Tracking failed for ${eventType}:`);
      assert.strictEqual(callArgs[1], testError);
    });
  });
});
