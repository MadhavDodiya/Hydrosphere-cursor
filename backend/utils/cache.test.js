import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import cache, { getCache, setCache, clearCache } from './cache.js';

describe('Cache Utility', () => {
  beforeEach(() => {
    cache.flushAll(); // Ensure a clean cache for every test
  });

  test('setCache and getCache should store and retrieve values', () => {
    setCache('key1', 'value1');
    assert.strictEqual(getCache('key1'), 'value1');
  });

  test('getCache should return undefined for non-existent keys', () => {
    assert.strictEqual(getCache('nonexistent_key'), undefined);
  });

  test('setCache should respect TTL expiration', async () => {
    setCache('key_ttl', 'value_ttl', 1); // 1 second TTL
    assert.strictEqual(getCache('key_ttl'), 'value_ttl');

    // Wait for a little more than 1 second to ensure it expires
    await new Promise(resolve => setTimeout(resolve, 1100));

    assert.strictEqual(getCache('key_ttl'), undefined);
  });

  test('clearCache with key should remove specific key', () => {
    setCache('key2', 'value2');
    setCache('key3', 'value3');

    clearCache('key2');

    assert.strictEqual(getCache('key2'), undefined);
    assert.strictEqual(getCache('key3'), 'value3'); // Make sure other keys are unaffected
  });

  test('clearCache without key should flush the entire cache', () => {
    setCache('key4', 'value4');
    setCache('key5', 'value5');

    clearCache();

    assert.strictEqual(getCache('key4'), undefined);
    assert.strictEqual(getCache('key5'), undefined);
  });
});
