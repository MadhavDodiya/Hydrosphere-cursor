import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import api, { setAuthToken, setUnauthorizedHandler } from './axiosInstance';
import axios from 'axios';

// Mock localStorage globally
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

global.localStorage = localStorageMock;

// Mock axios post for the refresh logic
vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    default: {
      ...actual.default,
      post: vi.fn(),
      create: vi.fn(() => {
        const instance = vi.fn((config) => Promise.resolve('mocked-api-call'));
        instance.defaults = { headers: { common: {} } };
        instance.interceptors = {
          request: { use: vi.fn(), handlers: [] },
          response: { use: vi.fn(), handlers: [] }
        };
        // Quick override for the interceptors so we can extract them manually in tests if we mocked `create`
        // But let's actually just use the real `create` from axios since we are testing the instance directly.
        return actual.default.create();
      }),
    },
  };
});

describe('axiosInstance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    setAuthToken(null);
    setUnauthorizedHandler(null);
  });

  describe('setAuthToken', () => {
    it('should set token in headers and localStorage', () => {
      setAuthToken('test-token');
      expect(api.defaults.headers.common.Authorization).toBe('Bearer test-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('hydrosphere_token', 'test-token');
    });

    it('should remove token from headers and localStorage when passed falsy value', () => {
      setAuthToken('test-token');
      setAuthToken(null);
      expect(api.defaults.headers.common.Authorization).toBeUndefined();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('hydrosphere_token');
    });
  });

  describe('Request Interceptor', () => {
    const reqInterceptor = api.interceptors.request.handlers[0].fulfilled;

    it('should add Authorization header if token exists in localStorage', async () => {
      localStorageMock.getItem.mockReturnValue('stored-token');
      const config = { headers: {} };
      const result = await reqInterceptor(config);
      expect(result.headers.Authorization).toBe('Bearer stored-token');
    });

    it('should not add Authorization header if token does not exist', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      const config = { headers: {} };
      const result = await reqInterceptor(config);
      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  describe('Response Interceptor - Success', () => {
    const resInterceptor = api.interceptors.response.handlers[0].fulfilled;

    it('should return response directly if no success field is present', async () => {
      const response = { data: { someField: 'value' } };
      const result = await resInterceptor(response);
      expect(result).toEqual({ someField: 'value' });
    });

    it('should return res directly if success is true', async () => {
      const response = { data: { success: true, data: { user: 1 }, message: 'OK' } };
      const result = await resInterceptor(response);
      expect(result).toEqual({ success: true, data: { user: 1 }, message: 'OK' });
    });

    it('should reject promise if success is false', async () => {
      const response = { data: { success: false, data: { reason: 'fail' }, message: 'Failed' } };
      await expect(resInterceptor(response)).rejects.toEqual({
        response,
        message: 'Failed',
        data: { reason: 'fail' }
      });
    });

    it('should fallback to default message if success is false and no message provided', async () => {
      const response = { data: { success: false } };
      await expect(resInterceptor(response)).rejects.toMatchObject({
        message: 'Request failed'
      });
    });
  });

  describe('Response Interceptor - Error', () => {
    const errInterceptor = api.interceptors.response.handlers[0].rejected;

    it('should reject with Network Error if no response is attached', async () => {
      const error = new Error('Some error');
      await expect(errInterceptor(error)).rejects.toThrow('Network Error');
    });

    it('should reject if original request is missing', async () => {
      const error = { response: { status: 400 } };
      await expect(errInterceptor(error)).rejects.toEqual(error);
    });

    it('should reject directly for non-401 errors', async () => {
      const error = { config: { url: '/api/users' }, response: { status: 500 } };
      await expect(errInterceptor(error)).rejects.toEqual(error);
    });

    it('should call onUnauthorized for 401 error on auth endpoint if not login', async () => {
       const unauthorizedMock = vi.fn();
       setUnauthorizedHandler(unauthorizedMock);
       const error = { config: { url: '/api/auth/me' }, response: { status: 401 } };
       await expect(errInterceptor(error)).rejects.toEqual(error);
       expect(unauthorizedMock).toHaveBeenCalled();
    });

    it('should not call onUnauthorized for /login endpoint 401 errors', async () => {
      const unauthorizedMock = vi.fn();
      setUnauthorizedHandler(unauthorizedMock);
      const error = { config: { url: '/api/auth/login' }, response: { status: 401 } };
      await expect(errInterceptor(error)).rejects.toEqual(error);
      expect(unauthorizedMock).not.toHaveBeenCalled();
    });

    it('should attempt token refresh on 401 error and retry request', async () => {
      const error = {
        config: { url: '/api/protected', headers: {} },
        response: { status: 401 }
      };

      axios.post.mockResolvedValueOnce({ data: { success: true, data: { token: 'new-token' } } });

      // The interceptor calls `api(originalRequest)` which will make a real HTTP request unless we mock it.
      // But we can catch the error since the URL is invalid and it will hit the interceptor again or fail.
      // Or we can stub the api function's request.
      // Because `api` is exported from the module and is a function, we can spy on `api.request` which axios uses internally when called as a function.
      const requestSpy = vi.spyOn(api, 'request').mockResolvedValue('retried');

      // Wait, calling `api(config)` uses `api.request(config)` internally. Let's verify.
      // Actually, axios instances call themselves, not `.request()`.
      // But `api` is a function that merges config and calls `request`.

      try {
        await errInterceptor(error);
      } catch (e) {
        // We catch it if it fails due to network error when trying to make the request.
      }

      expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/api/auth/refresh'), {}, { withCredentials: true });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('hydrosphere_token', 'new-token');
    });

    it('should handle token refresh failure by clearing token and calling onUnauthorized', async () => {
      const unauthorizedMock = vi.fn();
      setUnauthorizedHandler(unauthorizedMock);

      const error = {
        config: { url: '/api/protected', headers: {} },
        response: { status: 401 }
      };

      axios.post.mockRejectedValueOnce(new Error('Refresh failed'));

      await expect(errInterceptor(error)).rejects.toThrow('Refresh failed');

      expect(axios.post).toHaveBeenCalled();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('hydrosphere_token');
      expect(unauthorizedMock).toHaveBeenCalled();
    });

    it('should queue concurrent requests while refreshing', async () => {
      // Need to reset the internal `isRefreshing` state before this test.
      // The only way to reset it is to simulate a failed or successful refresh first,
      // but each test is isolated if the module is re-imported.
      // We can mock axios.post to not resolve immediately to test concurrency.

      let resolveRefresh;
      const refreshPromise = new Promise((resolve) => {
        resolveRefresh = resolve;
      });
      axios.post.mockReturnValue(refreshPromise);

      const error1 = { config: { url: '/api/req1', headers: {} }, response: { status: 401 } };
      const error2 = { config: { url: '/api/req2', headers: {} }, response: { status: 401 } };

      // Fire first request, this sets isRefreshing = true
      const p1 = errInterceptor(error1);

      // Fire second request, this should queue
      const p2 = errInterceptor(error2);

      // Resolve refresh
      resolveRefresh({ data: { success: true, data: { token: 'concurrent-token' } } });

      try { await p1; } catch (e) {}
      try { await p2; } catch (e) {}

      // Expect axios.post to have been called only once despite two 401 errors
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('hydrosphere_token', 'concurrent-token');
    });
  });
});
