import { test, describe, mock, afterEach } from 'node:test';
import assert from 'node:assert';
import cron from 'node-cron';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import logger from '../utils/logger.js';
import { auditExpiredTrials, auditExpiredSubscriptions, initCronJobs } from './cronService.js';

describe('cronService', () => {
  afterEach(() => {
    mock.restoreAll();
  });

  describe('auditExpiredTrials', () => {
    test('should return modified count on successful trial downgrade', async () => {
      mock.method(User, 'updateMany', async () => ({ modifiedCount: 5 }));
      mock.method(logger, 'info', () => {}); // silence logger

      const result = await auditExpiredTrials();

      assert.strictEqual(result, 5);
      assert.strictEqual(User.updateMany.mock.calls.length, 1);

      const callArgs = User.updateMany.mock.calls[0].arguments;
      assert.deepStrictEqual(callArgs[0].plan, { $in: ["free", "Starter"] });
      assert.strictEqual(callArgs[0].subscriptionStatus, "active");
      assert.ok(callArgs[0].trialExpiresAt.$lt instanceof Date);

      assert.deepStrictEqual(callArgs[1].$set, {
        plan: "none",
        subscriptionStatus: "inactive",
        trialActive: false
      });
    });

    test('should throw error if updateMany fails', async () => {
      const dbError = new Error('Database connection failed');
      mock.method(User, 'updateMany', async () => { throw dbError; });
      mock.method(logger, 'error', () => {}); // silence logger

      await assert.rejects(auditExpiredTrials(), dbError);
    });
  });

  describe('auditExpiredSubscriptions', () => {
    test('should return early with 0 if no users are found', async () => {
      mock.method(User, 'find', () => {
        return {
          select: async () => []
        };
      });

      const result = await auditExpiredSubscriptions();
      assert.strictEqual(result, 0);
    });

    test('should return user count on successful subscription downgrade', async () => {
      const mockUsers = [{ _id: 'user1' }, { _id: 'user2' }];
      mock.method(User, 'find', () => {
        return {
          select: async () => mockUsers
        };
      });
      mock.method(User, 'updateMany', async () => ({ modifiedCount: 2 }));
      mock.method(Subscription, 'updateMany', async () => ({ modifiedCount: 2 }));
      mock.method(logger, 'info', () => {}); // silence logger

      const result = await auditExpiredSubscriptions();

      assert.strictEqual(result, 2);

      assert.strictEqual(User.updateMany.mock.calls.length, 1);
      const userUpdateArgs = User.updateMany.mock.calls[0].arguments;
      assert.deepStrictEqual(userUpdateArgs[0]._id.$in, ['user1', 'user2']);
      assert.deepStrictEqual(userUpdateArgs[1].$set, {
        plan: "none",
        subscriptionStatus: "inactive"
      });

      assert.strictEqual(Subscription.updateMany.mock.calls.length, 1);
      const subUpdateArgs = Subscription.updateMany.mock.calls[0].arguments;
      assert.deepStrictEqual(subUpdateArgs[0].userId.$in, ['user1', 'user2']);
      assert.strictEqual(subUpdateArgs[0].status, 'active');
      assert.deepStrictEqual(subUpdateArgs[1].$set, { status: "expired" });
    });

    test('should throw error if User.find fails', async () => {
      const dbError = new Error('Database error');
      mock.method(User, 'find', () => {
        return {
          select: async () => { throw dbError; }
        };
      });
      mock.method(logger, 'error', () => {});

      await assert.rejects(auditExpiredSubscriptions(), dbError);
    });
  });

  describe('initCronJobs', () => {
    test('should schedule cron job at 00:00 every day', () => {
      mock.method(cron, 'schedule', () => {});
      mock.method(logger, 'info', () => {});

      initCronJobs();

      assert.strictEqual(cron.schedule.mock.calls.length, 1);
      assert.strictEqual(cron.schedule.mock.calls[0].arguments[0], "0 0 * * *");
    });

    test('should execute audit functions inside cron schedule', async () => {
      let scheduledCallback;
      mock.method(cron, 'schedule', (expression, callback) => {
        scheduledCallback = callback;
      });
      mock.method(logger, 'info', () => {});

      // Need to mock the actual inner methods because we're testing the callback logic
      mock.method(User, 'updateMany', async () => ({ modifiedCount: 0 }));
      mock.method(User, 'find', () => ({ select: async () => [] }));

      initCronJobs();

      assert.ok(scheduledCallback);

      // Execute the callback
      await scheduledCallback();

      // Verify our inner methods were called
      assert.strictEqual(User.updateMany.mock.calls.length, 1); // From auditExpiredTrials
      assert.strictEqual(User.find.mock.calls.length, 1); // From auditExpiredSubscriptions
    });
  });
});
