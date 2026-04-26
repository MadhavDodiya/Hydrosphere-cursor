import { test, describe } from 'node:test';
import assert from 'node:assert';
import { requireSubscription } from './requireSubscription.js';

describe('requireSubscription Middleware', () => {
  const mockRes = () => {
    const res = {};
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    res.json = (data) => {
      res.body = data;
      return res;
    };
    return res;
  };

  const mockNext = () => {
    let called = false;
    const next = () => {
      called = true;
    };
    next.isCalled = () => called;
    return next;
  };

  test('should allow admin role without checking subscription', () => {
    const req = { role: 'admin' };
    const res = mockRes();
    const next = mockNext();

    requireSubscription(req, res, next);

    assert.strictEqual(next.isCalled(), true);
    assert.strictEqual(res.statusCode, undefined);
  });

  test('should allow buyer role without checking subscription', () => {
    const req = { role: 'buyer' };
    const res = mockRes();
    const next = mockNext();

    requireSubscription(req, res, next);

    assert.strictEqual(next.isCalled(), true);
    assert.strictEqual(res.statusCode, undefined);
  });

  test('should allow supplier with active subscription and valid plan', () => {
    const req = { role: 'supplier', subscriptionStatus: 'active', plan: 'pro' };
    const res = mockRes();
    const next = mockNext();

    requireSubscription(req, res, next);

    assert.strictEqual(next.isCalled(), true);
    assert.strictEqual(res.statusCode, undefined);
  });

  test('should deny supplier with inactive subscription', () => {
    const req = { role: 'supplier', subscriptionStatus: 'inactive', plan: 'pro' };
    const res = mockRes();
    const next = mockNext();

    requireSubscription(req, res, next);

    assert.strictEqual(next.isCalled(), false);
    assert.strictEqual(res.statusCode, 403);
    assert.deepStrictEqual(res.body, {
      message: "An active subscription plan is required to access this feature.",
      code: "SUBSCRIPTION_REQUIRED"
    });
  });

  test('should deny supplier with active subscription but no plan', () => {
    const req = { role: 'supplier', subscriptionStatus: 'active' };
    const res = mockRes();
    const next = mockNext();

    requireSubscription(req, res, next);

    assert.strictEqual(next.isCalled(), false);
    assert.strictEqual(res.statusCode, 403);
    assert.deepStrictEqual(res.body, {
      message: "An active subscription plan is required to access this feature.",
      code: "SUBSCRIPTION_REQUIRED"
    });
  });

  test('should deny supplier with active subscription and plan set to "none"', () => {
    const req = { role: 'supplier', subscriptionStatus: 'active', plan: 'none' };
    const res = mockRes();
    const next = mockNext();

    requireSubscription(req, res, next);

    assert.strictEqual(next.isCalled(), false);
    assert.strictEqual(res.statusCode, 403);
    assert.deepStrictEqual(res.body, {
      message: "An active subscription plan is required to access this feature.",
      code: "SUBSCRIPTION_REQUIRED"
    });
  });

  test('should deny access for unknown, empty, or missing roles', () => {
    const rolesToTest = ['guest', '', undefined, null];

    for (const role of rolesToTest) {
      const req = { role };
      const res = mockRes();
      const next = mockNext();

      requireSubscription(req, res, next);

      assert.strictEqual(next.isCalled(), false);
      assert.strictEqual(res.statusCode, 403);
      assert.deepStrictEqual(res.body, { message: "Access denied" });
    }
  });
});
