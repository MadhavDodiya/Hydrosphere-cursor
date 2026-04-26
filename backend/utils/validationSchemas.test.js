import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
paginationQuerySchema,
registerSchema,
loginSchema,
emailOnlySchema,
resetPasswordSchema,
listingCreateSchema,
listingUpdateSchema,
inquiryCreateSchema,
inquiryReplySchema,
inquiryStatusSchema
} from './validationSchemas.js';
describe("Validation Schemas", () => {
describe('registerSchema', () => {
  test('should validate valid buyer registration data', () => {
    const data = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'buyer'
    };
    const result = registerSchema.safeParse(data);
    assert.strictEqual(result.success, true);
  });

  test('should validate valid supplier registration data', () => {
    const data = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123',
      role: 'supplier',
      companyName: 'Acme Corp',
      location: 'New York',
      businessRegistrationNumber: '123456789'
    };
    const result = registerSchema.safeParse(data);
    assert.strictEqual(result.success, true);
  });

  test('should reject supplier missing required company details', () => {
    const data = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123',
      role: 'supplier',
      companyName: 'Acme Corp' // Missing location and businessRegistrationNumber
    };
    const result = registerSchema.safeParse(data);
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.errors[0].message, 'Company name, location, and registration number are required for suppliers');
    assert.deepStrictEqual(result.error.errors[0].path, ['companyName']);
  });

  test('should reject invalid email', () => {
    const data = {
      name: 'John Doe',
      email: 'not-an-email',
      password: 'password123',
      role: 'buyer'
    };
    const result = registerSchema.safeParse(data);
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.errors[0].path[0], 'email');
  });

  test('should reject short password', () => {
    const data = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'pass', // Length < 6
      role: 'buyer'
    };
    const result = registerSchema.safeParse(data);
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.errors[0].path[0], 'password');
  });

  test('should reject invalid role', () => {
    const data = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'admin' // Invalid role
    };
    const result = registerSchema.safeParse(data);
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.errors[0].path[0], 'role');
  });
});

describe('paginationQuerySchema', () => {
  test('should validate valid pagination query', () => {
    const result = paginationQuerySchema.safeParse({ page: '2', limit: '50' });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.data.page, 2);
    assert.strictEqual(result.data.limit, 50);
  });

  test('should allow empty query (optionals)', () => {
    const result = paginationQuerySchema.safeParse({});
    assert.strictEqual(result.success, true);
  });

  test('should reject invalid values', () => {
    const result = paginationQuerySchema.safeParse({ page: 'abc', limit: 0 });
    assert.strictEqual(result.success, false);
  });
});

describe('loginSchema', () => {
  test('should validate valid login data', () => {
    const result = loginSchema.safeParse({ email: 'john@example.com', password: 'password123' });
    assert.strictEqual(result.success, true);
  });

  test('should reject missing fields', () => {
    const result = loginSchema.safeParse({ email: 'john@example.com' });
    assert.strictEqual(result.success, false);
  });
});

describe('emailOnlySchema', () => {
  test('should validate valid email', () => {
    const result = emailOnlySchema.safeParse({ email: 'TEST@EXAMPLE.com ' });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.data.email, 'test@example.com');
  });

  test('should reject invalid email', () => {
    const result = emailOnlySchema.safeParse({ email: 'not-an-email' });
    assert.strictEqual(result.success, false);
  });
});

describe('resetPasswordSchema', () => {
  test('should validate valid reset password data', () => {
    const result = resetPasswordSchema.safeParse({
      email: 'john@example.com',
      token: '1234567890abcdef',
      password: 'newpassword123'
    });
    assert.strictEqual(result.success, true);
  });

  test('should reject short token or password', () => {
    const result = resetPasswordSchema.safeParse({
      email: 'john@example.com',
      token: 'short',
      password: 'pass'
    });
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error.errors.length, 2);
  });
});

describe('listingCreateSchema', () => {
  test('should validate valid listing', () => {
    const data = {
      title: 'Green Hydrogen Batch',
      hydrogenType: 'Green',
      price: '500',
      quantity: '1000',
      location: 'California',
      purity: '99.9',
      description: 'High quality green hydrogen.'
    };
    const result = listingCreateSchema.safeParse(data);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.data.price, 500);
  });

  test('should reject invalid hydrogenType', () => {
    const data = {
      title: 'Batch',
      hydrogenType: 'Yellow', // Invalid
      price: '500',
      quantity: '1000',
      location: 'California',
      description: 'Desc'
    };
    const result = listingCreateSchema.safeParse(data);
    assert.strictEqual(result.success, false);
  });
});

describe('listingUpdateSchema', () => {
  test('should validate partial update data', () => {
    const data = {
      price: '600'
    };
    const result = listingUpdateSchema.safeParse(data);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.data.price, 600);
  });
});

describe('inquiryCreateSchema', () => {
  test('should validate valid inquiry', () => {
    const data = {
      listingId: 'listing123',
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+1234567890',
      message: 'I am interested.'
    };
    const result = inquiryCreateSchema.safeParse(data);
    assert.strictEqual(result.success, true);
  });
});

describe('inquiryReplySchema', () => {
  test('should validate valid reply', () => {
    const result = inquiryReplySchema.safeParse({ message: 'Here is the response.' });
    assert.strictEqual(result.success, true);
  });
});

describe('inquiryStatusSchema', () => {
  test('should validate valid status', () => {
    const result = inquiryStatusSchema.safeParse({ status: 'responded' });
    assert.strictEqual(result.success, true);
  });

  test('should reject invalid status', () => {
    const result = inquiryStatusSchema.safeParse({ status: 'unknown' });
    assert.strictEqual(result.success, false);
  });
});
});
