import { test, describe } from 'node:test';
import assert from 'node:assert';
import { authorizeRoles } from './role.js';

describe('authorizeRoles Middleware', () => {
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

  test('should return 401 if req.role is missing', () => {
    const middleware = authorizeRoles('admin');
    const req = {};
    const res = mockRes();
    const next = mockNext();

    middleware(req, res, next);

    assert.strictEqual(res.statusCode, 401);
    assert.deepStrictEqual(res.body, { message: 'Unauthorized' });
    assert.strictEqual(next.isCalled(), false);
  });

  test('should return 403 if req.role is not allowed', () => {
    const middleware = authorizeRoles('admin');
    const req = { role: 'user' };
    const res = mockRes();
    const next = mockNext();

    middleware(req, res, next);

    assert.strictEqual(res.statusCode, 403);
    assert.deepStrictEqual(res.body, { message: 'Forbidden' });
    assert.strictEqual(next.isCalled(), false);
  });

  test('should call next() if req.role is allowed', () => {
    const middleware = authorizeRoles('admin', 'supplier');
    const req = { role: 'supplier' };
    const res = mockRes();
    const next = mockNext();

    middleware(req, res, next);

    assert.strictEqual(next.isCalled(), true);
    assert.strictEqual(res.statusCode, undefined);
  });

  test('should handle allowed roles as an array', () => {
    const middleware = authorizeRoles(['admin', 'supplier']);
    const req = { role: 'supplier' };
    const res = mockRes();
    const next = mockNext();

    middleware(req, res, next);

    assert.strictEqual(next.isCalled(), true);
  });

  test('should filter out falsy values in allowed roles', () => {
    const middleware = authorizeRoles('admin', null, undefined, '');
    const req = { role: 'admin' };
    const res = mockRes();
    const next = mockNext();

    middleware(req, res, next);

    assert.strictEqual(next.isCalled(), true);

    const req2 = { role: 'guest' };
    const res2 = mockRes();
    const next2 = mockNext();
    middleware(req2, res2, next2);
    assert.strictEqual(res2.statusCode, 403);
  });
});
