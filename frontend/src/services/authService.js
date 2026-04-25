import api, { setAuthToken } from "./api.js";

const TOKEN_KEY = "hydrosphere_token";
const USER_KEY = "hydrosphere_user";

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function persistSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  setAuthToken(token);
}

export function persistUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  setAuthToken(null);
}

export async function register(payload) {
  const { data } = await api.post("/api/auth/register", payload);
  return data.data; // Return the nested data object
}

export async function login(payload) {
  const { data } = await api.post("/api/auth/login", payload);
  return data.data; // Return the nested data object
}

export async function logoutAPI() {
  await api.post("/api/auth/logout");
}
