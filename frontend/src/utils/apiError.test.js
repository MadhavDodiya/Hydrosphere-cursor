import { describe, it, expect } from 'vitest';
import { getApiErrorMessage } from './apiError';

describe('getApiErrorMessage', () => {
  it('should return a string message from error.response.data.message', () => {
    const error = {
      response: {
        data: {
          message: 'Invalid credentials',
        },
      },
    };
    expect(getApiErrorMessage(error)).toBe('Invalid credentials');
  });

  it('should return the first element if error.response.data.message is an array', () => {
    const error = {
      response: {
        data: {
          message: ['Email is required', 'Password is required'],
        },
      },
    };
    expect(getApiErrorMessage(error)).toBe('Email is required');
  });

  it('should return specific message for Network Error', () => {
    const error = {
      message: 'Network Error',
    };
    expect(getApiErrorMessage(error)).toBe('Network error — check your connection and that the API is running.');
  });

  it('should return default fallback when error is empty', () => {
    expect(getApiErrorMessage({})).toBe('Something went wrong.');
    expect(getApiErrorMessage(null)).toBe('Something went wrong.');
    expect(getApiErrorMessage(undefined)).toBe('Something went wrong.');
  });

  it('should return custom fallback when provided and error is empty', () => {
    const customFallback = 'Custom fallback error';
    expect(getApiErrorMessage({}, customFallback)).toBe(customFallback);
  });

  it('should return default fallback if message is an empty string', () => {
    const error = {
      response: {
        data: {
          message: '   ',
        },
      },
    };
    expect(getApiErrorMessage(error)).toBe('Something went wrong.');
  });

  it('should return default fallback if message is an empty array', () => {
    const error = {
      response: {
        data: {
          message: [],
        },
      },
    };
    expect(getApiErrorMessage(error)).toBe('Something went wrong.');
  });
});
