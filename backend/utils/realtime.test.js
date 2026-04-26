import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { setIO, getIO, emitInquiryUpdated, emitInquiryCreated } from './realtime.js';

describe('Realtime Utils', () => {
  const createMockIO = () => {
    const emissions = [];
    const io = {
      to: (channel) => ({
        emit: (event, data) => {
          emissions.push({ channel, event, data });
        }
      }),
      getEmissions: () => emissions,
      clearEmissions: () => { emissions.length = 0; }
    };
    return io;
  };

  beforeEach(() => {
    setIO(null);
  });

  describe('setIO and getIO', () => {
    test('should set and get the IO instance', () => {
      const mockIO = createMockIO();
      setIO(mockIO);
      assert.strictEqual(getIO(), mockIO);
    });
  });

  describe('emitInquiryUpdated', () => {
    test('should not emit if io is not set', () => {
      const inquiry = { _id: '123' };
      // should not throw
      emitInquiryUpdated(inquiry);
    });

    test('should not emit if inquiry._id is missing', () => {
      const mockIO = createMockIO();
      setIO(mockIO);
      const inquiry = { supplierId: '456' };
      emitInquiryUpdated(inquiry);
      assert.strictEqual(mockIO.getEmissions().length, 0);
    });

    test('should emit to inquiry channel', () => {
      const mockIO = createMockIO();
      setIO(mockIO);
      const inquiry = { _id: '123' };
      emitInquiryUpdated(inquiry);

      const emissions = mockIO.getEmissions();
      assert.strictEqual(emissions.length, 1);
      assert.strictEqual(emissions[0].channel, 'inquiry:123');
      assert.strictEqual(emissions[0].event, 'inquiry:updated');
      assert.deepStrictEqual(emissions[0].data, inquiry);
    });

    test('should emit to supplier channel if supplierId is present', () => {
      const mockIO = createMockIO();
      setIO(mockIO);
      const inquiry = { _id: '123', supplierId: '456' };
      emitInquiryUpdated(inquiry);

      const emissions = mockIO.getEmissions();
      assert.strictEqual(emissions.length, 2);
      assert.strictEqual(emissions[0].channel, 'inquiry:123');
      assert.strictEqual(emissions[1].channel, 'user:456');
      assert.strictEqual(emissions[1].event, 'inquiry:updated');
      assert.deepStrictEqual(emissions[1].data, inquiry);
    });

    test('should emit to buyer channel if buyerId is present', () => {
      const mockIO = createMockIO();
      setIO(mockIO);
      const inquiry = { _id: '123', buyerId: '789' };
      emitInquiryUpdated(inquiry);

      const emissions = mockIO.getEmissions();
      assert.strictEqual(emissions.length, 2);
      assert.strictEqual(emissions[0].channel, 'inquiry:123');
      assert.strictEqual(emissions[1].channel, 'user:789');
      assert.strictEqual(emissions[1].event, 'inquiry:updated');
      assert.deepStrictEqual(emissions[1].data, inquiry);
    });

    test('should emit to inquiry, supplier, and buyer channels if all present', () => {
      const mockIO = createMockIO();
      setIO(mockIO);
      const inquiry = { _id: '123', supplierId: '456', buyerId: '789' };
      emitInquiryUpdated(inquiry);

      const emissions = mockIO.getEmissions();
      assert.strictEqual(emissions.length, 3);
      assert.strictEqual(emissions[0].channel, 'inquiry:123');
      assert.strictEqual(emissions[1].channel, 'user:456');
      assert.strictEqual(emissions[2].channel, 'user:789');
      for (const emission of emissions) {
        assert.strictEqual(emission.event, 'inquiry:updated');
        assert.deepStrictEqual(emission.data, inquiry);
      }
    });

    test('should handle object ids with toString()', () => {
      const mockIO = createMockIO();
      setIO(mockIO);
      const inquiry = {
        _id: { toString: () => 'obj123' },
        supplierId: { toString: () => 'obj456' },
        buyerId: { toString: () => 'obj789' }
      };
      emitInquiryUpdated(inquiry);

      const emissions = mockIO.getEmissions();
      assert.strictEqual(emissions.length, 3);
      assert.strictEqual(emissions[0].channel, 'inquiry:obj123');
      assert.strictEqual(emissions[1].channel, 'user:obj456');
      assert.strictEqual(emissions[2].channel, 'user:obj789');
    });
  });

  describe('emitInquiryCreated', () => {
    test('should not emit if io is not set', () => {
      const inquiry = { _id: '123' };
      // should not throw
      emitInquiryCreated(inquiry);
    });

    test('should not emit if inquiry._id is missing', () => {
      const mockIO = createMockIO();
      setIO(mockIO);
      const inquiry = { supplierId: '456' };
      emitInquiryCreated(inquiry);
      assert.strictEqual(mockIO.getEmissions().length, 0);
    });

    test('should not emit anything if supplierId is missing', () => {
      const mockIO = createMockIO();
      setIO(mockIO);
      const inquiry = { _id: '123' };
      emitInquiryCreated(inquiry);

      const emissions = mockIO.getEmissions();
      assert.strictEqual(emissions.length, 0);
    });

    test('should emit to supplier channel if supplierId is present', () => {
      const mockIO = createMockIO();
      setIO(mockIO);
      const inquiry = { _id: '123', supplierId: '456' };
      emitInquiryCreated(inquiry);

      const emissions = mockIO.getEmissions();
      assert.strictEqual(emissions.length, 1);
      assert.strictEqual(emissions[0].channel, 'user:456');
      assert.strictEqual(emissions[0].event, 'inquiry:created');
      assert.deepStrictEqual(emissions[0].data, inquiry);
    });

    test('should handle object ids with toString()', () => {
      const mockIO = createMockIO();
      setIO(mockIO);
      const inquiry = {
        _id: { toString: () => 'obj123' },
        supplierId: { toString: () => 'obj456' }
      };
      emitInquiryCreated(inquiry);

      const emissions = mockIO.getEmissions();
      assert.strictEqual(emissions.length, 1);
      assert.strictEqual(emissions[0].channel, 'user:obj456');
    });
  });
});
