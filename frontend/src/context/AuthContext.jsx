import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  clearSession,
  getStoredToken,
  getStoredUser,
  persistSession,
  persistUser,
  login as loginRequest,
  register as registerRequest,
  logoutAPI,
} from "../services/authService.js";
import api, { setAuthToken, setUnauthorizedHandler } from "../api/axiosInstance.js";
import { useToast } from "./ToastContext.jsx";
import { connectSocket, disconnectSocket } from "../api/socket.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { showToast } = useToast();
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getStoredToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAuthToken(token);
    if (token) {
      connectSocket(token);
      // 🔥 REFRESH USER STATE (Task #11 Audit Fix)
      // This ensures if an admin approved the supplier, the local state updates without logout
      const fetchMe = async () => {
        try {
          const { data } = await api.get("/api/auth/me");
          if (data.success && data.data?.user) {
            setUser(data.data.user);
            persistUser(data.data.user);
          }
        } catch (err) {
          console.error("Failed to refresh user profile", err);
        } finally {
          setLoading(false);
        }
      };
      fetchMe();
    } else {
      disconnectSocket();
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
      setToken(null);
      setUser(null);
      setAuthToken(null);
      showToast("Session expired. Please sign in again.");
    });
    return () => setUnauthorizedHandler(null);
  }, [showToast]);

  const login = async (email, password) => {
    const data = await loginRequest({ email, password });
    persistSession(data.token, data.user);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (userData) => {
    const data = await registerRequest(userData);
    if (data.token && data.user) {
      persistSession(data.token, data.user);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const logout = async () => {
    try {
      await logoutAPI();
    } catch (err) {
      console.error("Logout error", err);
    }
    clearSession();
    setToken(null);
    setUser(null);
    disconnectSocket();
  };

  const updateUser = (nextUser) => {
    setUser(nextUser);
    if (nextUser) persistUser(nextUser);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      updateUser,
      logout,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
