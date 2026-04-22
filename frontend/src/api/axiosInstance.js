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
    localStorage.setItem("hydrosphere_token", token);
  } else {
    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem("hydrosphere_token");
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

// Token refresh variables
let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token) {
  refreshSubscribers.map((cb) => cb(token));
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    // BUG 1 FIX: Handle complete network disconnects gracefully
    if (!error.response) {
      return Promise.reject({
        message: "Network error. Please check your connection.",
        isNetworkError: true,
      });
    }

    const originalRequest = error.config;
    
    if (!originalRequest) {
      return Promise.reject(error);
    }
    
    // Check if it's an auth endpoint to avoid infinite loops
    const isAuthEndpoint = originalRequest.url?.includes("/api/auth/");
    
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token using HttpOnly cookie
        const { data } = await axios.post(`${baseURL}/api/auth/refresh`, {}, { withCredentials: true });
        
        const newToken = data.token;
        setAuthToken(newToken);
        isRefreshing = false;
        onRefreshed(newToken);
        refreshSubscribers = [];

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, log user out
        isRefreshing = false;
        refreshSubscribers = [];
        setAuthToken(null);
        if (onUnauthorized) onUnauthorized();
        return Promise.reject(refreshError);
      }
    }

    const is401 = error.response?.status === 401;
    if (is401 && onUnauthorized && isAuthEndpoint) {
       // If standard login failed, don't trigger global logout.
       // Only trigger if it wasn't a login attempt.
       if (!originalRequest.url?.includes('/login')) {
         onUnauthorized();
       }
    }

    return Promise.reject(error);
  }
);

export default api;
