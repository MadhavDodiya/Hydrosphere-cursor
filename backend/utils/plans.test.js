import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateFinalPrice } from './plans.js';

describe('calculateFinalPrice', () => {
  it('should correctly calculate GST and total for a positive base price', () => {
    const result = calculateFinalPrice(100);
    assert.deepEqual(result, {
      base: 100,
      gst: 18,
      total: 118
    });
  });

  it('should handle zero base price', () => {
    const result = calculateFinalPrice(0);
    assert.deepEqual(result, {
      base: 0,
      gst: 0,
      total: 0
    });
  });

  it('should correctly round totals with decimal values', () => {
    // 99.99 * 0.18 = 17.9982
    // Due to floating point precision, JS calculates 99.99 * 0.18 as 17.998199999999997
    // total = 99.99 + 17.998199999999997 = 117.9882 => rounds to 117.99
    const result = calculateFinalPrice(99.99);
    assert.deepEqual(result, {
      base: 99.99,
      gst: 17.998199999999997,
      total: 117.99
    });
  });

  it('should correctly round totals with specific rounding edges', () => {
    // 10.5 * 0.18 = 1.89
    // total = 10.5 + 1.89 = 12.39
    const result = calculateFinalPrice(10.5);
    assert.deepEqual(result, {
      base: 10.5,
      gst: 1.89,
      total: 12.39
    });
  });
});
