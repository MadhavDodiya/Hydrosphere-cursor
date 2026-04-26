import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { errorHandler } from './errorHandler.js';
import logger from '../utils/logger.js';

describe('errorHandler Middleware', () => {
  const mockReq = {};
  const mockNext = () => {};

  let originalLoggerError;
  let loggerCalledWith = null;

  beforeEach(() => {
    // Mock logger.error to verify it is called and prevent console output
    originalLoggerError = logger.error;
    logger.error = (err) => {
      loggerCalledWith = err;
    };
    loggerCalledWith = null;
  });

  afterEach(() => {
    // Restore the original logger
    logger.error = originalLoggerError;
  });

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

  test('should handle SyntaxError with status 400 and body (malformed JSON)', () => {
    const err = new SyntaxError('Unexpected token');
    err.status = 400;
    err.body = '{ "bad": json }';

    const res = mockRes();
    errorHandler(err, mockReq, res, mockNext);

    assert.strictEqual(res.statusCode, 400);
    assert.deepStrictEqual(res.body, { message: 'Invalid JSON body' });
    assert.strictEqual(loggerCalledWith, null); // logger.error shouldn't be called for handled errors at the top
  });

  test('should handle CastError (Mongoose bad ObjectId)', () => {
    const err = new Error('Cast to ObjectId failed');
    err.name = 'CastError';

    const res = mockRes();
    errorHandler(err, mockReq, res, mockNext);

    assert.strictEqual(res.statusCode, 400);
    assert.deepStrictEqual(res.body, { message: 'Invalid id or data format' });
    assert.strictEqual(loggerCalledWith, null);
  });

  test('should handle ValidationError (Mongoose validation)', () => {
    const err = new Error('Validation failed');
    err.name = 'ValidationError';
    err.errors = {
      field1: { message: 'field1 is required' },
      field2: { message: 'field2 is too short' }
    };

    const res = mockRes();
    errorHandler(err, mockReq, res, mockNext);

    assert.strictEqual(res.statusCode, 400);
    assert.deepStrictEqual(res.body, { message: 'field1 is required' });
    assert.strictEqual(loggerCalledWith, null);
  });

  test('should handle ValidationError with empty errors gracefully', () => {
    const err = new Error('Validation failed');
    err.name = 'ValidationError';
    err.errors = {}; // no sub-errors

    const res = mockRes();
    errorHandler(err, mockReq, res, mockNext);

    assert.strictEqual(res.statusCode, 400);
    assert.deepStrictEqual(res.body, { message: 'Validation failed' });
    assert.strictEqual(loggerCalledWith, null);
  });

  test('should log error and handle custom statusCode error', () => {
    const err = new Error('Custom specific error');
    err.statusCode = 403;

    const res = mockRes();
    errorHandler(err, mockReq, res, mockNext);

    assert.strictEqual(res.statusCode, 403);
    assert.deepStrictEqual(res.body, { message: 'Custom specific error' });
    assert.strictEqual(loggerCalledWith, err); // Should be logged
  });

  test('should log error and handle custom status error', () => {
    const err = new Error('Another custom specific error');
    err.status = 404;

    const res = mockRes();
    errorHandler(err, mockReq, res, mockNext);

    assert.strictEqual(res.statusCode, 404);
    assert.deepStrictEqual(res.body, { message: 'Another custom specific error' });
    assert.strictEqual(loggerCalledWith, err); // Should be logged
  });

  test('should fallback to 500 for generic unhandled errors', () => {
    const err = new Error('Something exploded');

    const res = mockRes();
    errorHandler(err, mockReq, res, mockNext);

    assert.strictEqual(res.statusCode, 500);
    assert.deepStrictEqual(res.body, { message: 'Something went wrong. Please try again.' });
    assert.strictEqual(loggerCalledWith, err); // Should be logged
  });

  test('should fallback to 500 when err object has no message', () => {
    const err = { unexpected: 'format' };

    const res = mockRes();
    errorHandler(err, mockReq, res, mockNext);

    assert.strictEqual(res.statusCode, 500);
    assert.deepStrictEqual(res.body, { message: 'Something went wrong. Please try again.' });
    assert.strictEqual(loggerCalledWith, err); // Should be logged
  });
});
