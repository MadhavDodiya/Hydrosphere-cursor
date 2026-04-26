import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import api, { setAuthToken } from './axiosInstance';

describe('axiosInstance interceptors', () => {
  beforeEach(() => {
    localStorage.clear();
    // clear the header if any
    delete api.defaults.headers.common.Authorization;
  });

  it('should inject token into request headers when token is in localStorage', async () => {
    localStorage.setItem('hydrosphere_token', 'test-token-123');

    const config = { url: '/test' };

    // We can directly call the registered request interceptor
    // Axios stores interceptors in an internal handlers array
    // Alternatively we can mock the adapter

    let capturedConfig = null;
    api.defaults.adapter = async (cfg) => {
      capturedConfig = cfg;
      return { data: { success: true }, status: 200, statusText: 'OK', headers: {}, config: cfg, request: {} };
    };

    await api.get('/test');

    expect(capturedConfig.headers.Authorization).toBe('Bearer test-token-123');
  });

  it('should not inject token into request headers when no token is in localStorage', async () => {
    let capturedConfig = null;
    api.defaults.adapter = async (cfg) => {
      capturedConfig = cfg;
      return { data: { success: true }, status: 200, statusText: 'OK', headers: {}, config: cfg, request: {} };
    };

    await api.get('/test');

    // Since we cleared local storage and defaults, it should not have Authorization header
    expect(capturedConfig.headers.Authorization).toBeUndefined();
  });

  describe('setAuthToken', () => {
    it('should set token in common headers and localStorage', () => {
      setAuthToken('new-token-456');
      expect(api.defaults.headers.common.Authorization).toBe('Bearer new-token-456');
      expect(localStorage.getItem('hydrosphere_token')).toBe('new-token-456');
    });

    it('should remove token from common headers and localStorage when called with null', () => {
      setAuthToken('new-token-456'); // set it first
      setAuthToken(null);
      expect(api.defaults.headers.common.Authorization).toBeUndefined();
      expect(localStorage.getItem('hydrosphere_token')).toBeNull();
    });
  });
});
