import { test, describe, mock, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import nodemailer from 'nodemailer';

// Create mock functions for the transport methods
const mockVerify = mock.fn();
const mockSendMail = mock.fn();

// Mock nodemailer.createTransport before importing the service
mock.method(nodemailer, 'createTransport', () => ({
  verify: mockVerify,
  sendMail: mockSendMail,
}));

// Set env vars BEFORE importing so the top-level constants are populated
process.env.SMTP_USER = 'testuser@example.com';
process.env.SMTP_PASS = 'testpass';

// Import the service after mocking and setting env vars
const { verifyEmailConnection, sendEmail } = await import('./emailService.js');

describe('emailService Tests', () => {
  let originalEnv;

  beforeEach(() => {
    // Reset mock calls and implementations before each test
    mockVerify.mock.resetCalls();
    mockVerify.mock.restore();
    mockSendMail.mock.resetCalls();
    mockSendMail.mock.restore();

    // Save original env and set up required env vars
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
  });

  describe('verifyEmailConnection', () => {
    test('should return true when connection is verified', async () => {
      mockVerify.mock.mockImplementationOnce(async () => true);

      const result = await verifyEmailConnection();

      assert.strictEqual(result, true);
      assert.strictEqual(mockVerify.mock.calls.length, 1);
    });

    test('should return false when connection fails', async () => {
      mockVerify.mock.mockImplementationOnce(async () => {
        throw new Error('Connection failed');
      });

      const result = await verifyEmailConnection();

      assert.strictEqual(result, false);
      assert.strictEqual(mockVerify.mock.calls.length, 1);
    });
  });

  describe('sendEmail', () => {
    test('should return true when email is sent successfully on the first attempt', async () => {
      mockSendMail.mock.mockImplementationOnce(async () => ({ messageId: '12345' }));

      const result = await sendEmail({ to: 'test@example.com', subject: 'Test', html: '<p>Test</p>' });

      assert.strictEqual(result, true);
      assert.strictEqual(mockSendMail.mock.calls.length, 1);
    });

    test('should retry and return false after max attempts (3) are reached', async () => {
      mockSendMail.mock.mockImplementation(async () => {
        throw new Error('Send failed');
      });

      // To keep tests fast, let's redefine the global setTimeout temporarily
      const globalSetTimeout = global.setTimeout;
      global.setTimeout = (cb) => cb(); // execute immediately

      try {
        const result = await sendEmail({ to: 'test@example.com', subject: 'Test', html: '<p>Test</p>' });
        assert.strictEqual(result, false);
        assert.strictEqual(mockSendMail.mock.calls.length, 3);
      } finally {
        global.setTimeout = globalSetTimeout;
      }
    });

    test('should retry and return true if a subsequent attempt succeeds', async () => {
      // Fail first time, succeed second time
      let attempt = 0;
      mockSendMail.mock.mockImplementation(async () => {
        attempt++;
        if (attempt === 1) {
          throw new Error('Temporary send failure');
        }
        return { messageId: '67890' };
      });

      const globalSetTimeout = global.setTimeout;
      global.setTimeout = (cb) => cb(); // execute immediately

      try {
        const result = await sendEmail({ to: 'test@example.com', subject: 'Test', html: '<p>Test</p>' });
        assert.strictEqual(result, true);
        assert.strictEqual(mockSendMail.mock.calls.length, 2);
      } finally {
        global.setTimeout = globalSetTimeout;
      }
    });
  });
});
