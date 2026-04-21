import axios from "axios";

/**
 * Central Axios instance:
 * - Dev: Vite proxy handles /api
 * - Prod: set VITE_API_URL
 */
const baseURL = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

/** Attach JWT from localStorage for protected routes */
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hydrosphere_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let onUnauthorized = null;
export function setUnauthorizedHandler(fn) {
  onUnauthorized = typeof fn === "function" ? fn : null;
}

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const is401 = error.response?.status === 401;
    if (is401 && onUnauthorized) onUnauthorized();
    return Promise.reject(error);
  }
);

export default api;

