import axios from "axios";

/**
 * API base URL:
 * - Development / `vite preview`: leave VITE_API_URL unset → same-origin `/api` (Vite proxy → Express).
 * - Production (SPA on a different host than API): set VITE_API_URL to e.g. https://api.example.com
 */
const baseURL = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  // Relative /api calls in dev always hit the Vite dev server first (proxy)
  withCredentials: false,
});

/** Attach JWT from localStorage for protected routes */
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

/** Optional: set from main/auth to redirect on 401 (clears bad tokens). */
let onUnauthorized = null;
export function setUnauthorizedHandler(fn) {
  onUnauthorized = typeof fn === "function" ? fn : null;
}

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const h = error.config?.headers || {};
    const sentAuth =
      h.Authorization ||
      h.authorization ||
      api.defaults.headers.common?.Authorization ||
      api.defaults.headers.common?.authorization;
    if (error.response?.status === 401 && onUnauthorized && sentAuth) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default api;
