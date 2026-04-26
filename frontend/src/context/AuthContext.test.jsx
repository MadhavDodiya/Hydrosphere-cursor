import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import * as authService from '../services/authService.js';
import api, { setAuthToken, setUnauthorizedHandler } from '../api/axiosInstance.js';
import * as socketApi from '../api/socket.js';
import * as ToastContext from './ToastContext.jsx';
import React from 'react';

// Mock dependencies
vi.mock('../services/authService.js', () => ({
  clearSession: vi.fn(),
  getStoredToken: vi.fn(),
  getStoredUser: vi.fn(),
  persistSession: vi.fn(),
  persistUser: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
  logoutAPI: vi.fn(),
}));

vi.mock('../api/axiosInstance.js', () => {
  return {
    default: {
      get: vi.fn(),
    },
    setAuthToken: vi.fn(),
    setUnauthorizedHandler: vi.fn(),
  };
});

vi.mock('../api/socket.js', () => ({
  connectSocket: vi.fn(),
  disconnectSocket: vi.fn(),
}));

vi.mock('./ToastContext.jsx', () => ({
  useToast: vi.fn(),
}));

const mockShowToast = vi.fn();

const wrapper = ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ToastContext.useToast.mockReturnValue({ showToast: mockShowToast });

    // Default mock implementation
    authService.getStoredToken.mockReturnValue(null);
    authService.getStoredUser.mockReturnValue(null);
  });

  it('should initialize with default state when no stored token/user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.loading).toBe(false); // useEffect runs and sets loading false
  });

  it('should initialize with stored token and user', () => {
    const mockUser = { id: 1, name: 'Test' };
    const mockToken = 'mock-token';
    authService.getStoredToken.mockReturnValue(mockToken);
    authService.getStoredUser.mockReturnValue(mockUser);

    // api.get will be called in useEffect
    api.get.mockResolvedValueOnce({ data: { success: true, data: { user: mockUser } } });

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.token).toBe(mockToken);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('login should authenticate user and persist session', async () => {
    const mockUser = { id: 1, name: 'Test' };
    const mockToken = 'mock-token';
    authService.login.mockResolvedValueOnce({ token: mockToken, user: mockUser });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const returnedUser = await result.current.login('test@test.com', 'password');
      expect(returnedUser).toEqual(mockUser);
    });

    expect(authService.login).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password' });
    expect(authService.persistSession).toHaveBeenCalledWith(mockToken, mockUser);
    expect(result.current.token).toBe(mockToken);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('register should authenticate user and persist session', async () => {
    const mockUser = { id: 1, name: 'Test' };
    const mockToken = 'mock-token';
    authService.register.mockResolvedValueOnce({ token: mockToken, user: mockUser });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const res = await result.current.register({ email: 'test@test.com', password: 'password' });
      expect(res).toEqual({ token: mockToken, user: mockUser });
    });

    expect(authService.register).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password' });
    expect(authService.persistSession).toHaveBeenCalledWith(mockToken, mockUser);
    expect(result.current.token).toBe(mockToken);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('register should handle response without token', async () => {
    // Some register endpoints might require email verification and not return a token immediately
    authService.register.mockResolvedValueOnce({ success: true, message: 'Verify email' });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const res = await result.current.register({ email: 'test@test.com', password: 'password' });
      expect(res).toEqual({ success: true, message: 'Verify email' });
    });

    expect(authService.register).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password' });
    expect(authService.persistSession).not.toHaveBeenCalled();
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('logout should clear session and state', async () => {
    const mockUser = { id: 1, name: 'Test' };
    const mockToken = 'mock-token';
    authService.getStoredToken.mockReturnValue(mockToken);
    authService.getStoredUser.mockReturnValue(mockUser);
    authService.logoutAPI.mockResolvedValueOnce();

    api.get.mockResolvedValueOnce({ data: { success: true, data: { user: mockUser } } });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.logout();
    });

    expect(authService.logoutAPI).toHaveBeenCalled();
    expect(authService.clearSession).toHaveBeenCalled();
    expect(socketApi.disconnectSocket).toHaveBeenCalled();
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('logout should continue clearing session even if API fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    authService.logoutAPI.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.logout();
    });

    expect(authService.clearSession).toHaveBeenCalled();
    expect(socketApi.disconnectSocket).toHaveBeenCalled();
    expect(result.current.token).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('updateUser should update state and persist', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    const newUser = { id: 1, name: 'Updated Name' };

    act(() => {
      result.current.updateUser(newUser);
    });

    expect(result.current.user).toEqual(newUser);
    expect(authService.persistUser).toHaveBeenCalledWith(newUser);
  });

  it('updateUser should handle null user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.updateUser(null);
    });

    expect(result.current.user).toBeNull();
    expect(authService.persistUser).not.toHaveBeenCalled();
  });

  describe('useEffect (token)', () => {
    it('should setAuthToken and disconnect socket when token is null', () => {
      renderHook(() => useAuth(), { wrapper });
      expect(setAuthToken).toHaveBeenCalledWith(null);
      expect(socketApi.disconnectSocket).toHaveBeenCalled();
    });

    it('should connect socket and fetch user profile when token is present', async () => {
      const mockToken = 'mock-token';
      const mockUser = { id: 1, name: 'Fresh User' };
      authService.getStoredToken.mockReturnValue(mockToken);

      api.get.mockResolvedValueOnce({ data: { success: true, data: { user: mockUser } } });

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(setAuthToken).toHaveBeenCalledWith(mockToken);
      expect(socketApi.connectSocket).toHaveBeenCalledWith(mockToken);

      // Wait for useEffect async fetchMe to complete
      await vi.waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/api/auth/me');
      });

      await vi.waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      expect(authService.persistUser).toHaveBeenCalledWith(mockUser);
      expect(result.current.loading).toBe(false);
    });

    it('should handle fetch user profile failure gracefully', async () => {
      const mockToken = 'mock-token';
      authService.getStoredToken.mockReturnValue(mockToken);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      api.get.mockRejectedValueOnce(new Error('API Error'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await vi.waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/api/auth/me');
      });

      await vi.waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('useEffect (unauthorized handler)', () => {
    it('should register unauthorized handler and handle unauthorized events', () => {
      let registeredHandler = null;
      setUnauthorizedHandler.mockImplementation((handler) => {
        registeredHandler = handler;
      });

      renderHook(() => useAuth(), { wrapper });

      expect(setUnauthorizedHandler).toHaveBeenCalled();
      expect(registeredHandler).toBeTypeOf('function');

      // Trigger the handler
      act(() => {
        registeredHandler();
      });

      expect(authService.clearSession).toHaveBeenCalled();
      expect(mockShowToast).toHaveBeenCalledWith("Session expired. Please sign in again.");
    });

    it('should unregister unauthorized handler on unmount', () => {
      const { unmount } = renderHook(() => useAuth(), { wrapper });

      unmount();

      expect(setUnauthorizedHandler).toHaveBeenCalledWith(null);
    });
  });

  describe('useAuth hook', () => {
    it('should throw an error if used outside of AuthProvider', () => {
      // Suppress console.error for expected React error boundary throwing
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within AuthProvider');

      consoleSpy.mockRestore();
    });
  });
});
