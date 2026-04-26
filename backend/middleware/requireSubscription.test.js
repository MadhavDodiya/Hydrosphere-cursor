import { test, mock } from 'node:test';
import assert from 'node:assert';
import { requireSubscription } from './requireSubscription.js';
import User from '../models/User.js';

test('requireSubscription Middleware', async (t) => {
  await t.test('should skip for admin role', async () => {
    const req = { role: 'admin' };
    const res = {};
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    await requireSubscription(req, res, next);
    assert.strictEqual(nextCalled, true);
  });

  await t.test('should skip for buyer role', async () => {
    const req = { role: 'buyer' };
    const res = {};
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    await requireSubscription(req, res, next);
    assert.strictEqual(nextCalled, true);
  });

  await t.test('should deny access if user not found for supplier', async () => {
    const req = { role: 'supplier', userId: 'user1' };

    let statusCode = null;
    let jsonBody = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return res;
      },
      json: (body) => {
        jsonBody = body;
      }
    };

    mock.method(User, 'findById', () => ({
      select: () => Promise.resolve(null)
    }));

    await requireSubscription(req, res, () => {});

    assert.strictEqual(statusCode, 403);
    assert.deepStrictEqual(jsonBody, { message: "Access denied" });

    mock.restoreAll();
  });

  await t.test('should call next if supplier has active non-expired paid subscription', async () => {
    const now = new Date();
    const future = new Date(now.getTime() + 100000);

    const req = { role: 'supplier', userId: 'user1', subscriptionStatus: 'active', plan: 'Premium' };

    const res = {};
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    mock.method(User, 'findById', () => ({
      select: () => Promise.resolve({
        plan: 'Premium',
        subscriptionStatus: 'active',
        subscriptionCurrentPeriodEnd: future,
        save: async () => {}
      })
    }));

    await requireSubscription(req, res, next);

    assert.strictEqual(nextCalled, true);

    mock.restoreAll();
  });

  await t.test('should downgrade and deny access if paid subscription has expired', async () => {
    const now = new Date();
    const past = new Date(now.getTime() - 100000);

    const req = { role: 'supplier', userId: 'user1', subscriptionStatus: 'active', plan: 'Premium' };

    let statusCode = null;
    let jsonBody = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return res;
      },
      json: (body) => {
        jsonBody = body;
      }
    };

    let userSaved = false;
    const mockUser = {
      plan: 'Premium',
      subscriptionStatus: 'active',
      subscriptionCurrentPeriodEnd: past,
      save: async function() { userSaved = true; }
    };

    mock.method(User, 'findById', () => ({
      select: () => Promise.resolve(mockUser)
    }));

    await requireSubscription(req, res, () => {});

    assert.strictEqual(statusCode, 403);
    assert.strictEqual(jsonBody.code, "SUBSCRIPTION_REQUIRED");
    assert.strictEqual(userSaved, true);
    assert.strictEqual(mockUser.plan, 'none');
    assert.strictEqual(mockUser.subscriptionStatus, 'inactive');
    assert.strictEqual(req.plan, 'none');
    assert.strictEqual(req.subscriptionStatus, 'inactive');

    mock.restoreAll();
  });

  await t.test('should deny access if supplier has inactive subscription', async () => {
    const req = { role: 'supplier', userId: 'user1', subscriptionStatus: 'inactive', plan: 'none' };

    let statusCode = null;
    let jsonBody = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return res;
      },
      json: (body) => {
        jsonBody = body;
      }
    };

    const mockUser = {
      plan: 'none',
      subscriptionStatus: 'inactive',
      save: async function() { }
    };

    mock.method(User, 'findById', () => ({
      select: () => Promise.resolve(mockUser)
    }));

    await requireSubscription(req, res, () => {});

    assert.strictEqual(statusCode, 403);
    assert.strictEqual(jsonBody.code, "SUBSCRIPTION_REQUIRED");

    mock.restoreAll();
  });
});
