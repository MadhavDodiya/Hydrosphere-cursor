import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  clearSession,
  getStoredToken,
  getStoredUser,
  persistSession,
  persistUser,
  login as loginRequest,
  register as registerRequest,
} from "../services/authService.js";
import { setAuthToken, setUnauthorizedHandler } from "../services/api.js";
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
    if (token) connectSocket(token);
    else disconnectSocket();
    setLoading(false);
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

  const register = async (name, email, password, role) => {
    const data = await registerRequest({ name, email, password, role });
    persistSession(data.token, data.user);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
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
