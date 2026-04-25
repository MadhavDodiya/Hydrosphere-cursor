import api from "./api.js";

export async function fetchMe() {
  const data = await api.get("/api/users/me");
  return data.data;
}

export async function updateMe(payload) {
  const data = await api.put("/api/users/me", payload);
  return data.data;
}

