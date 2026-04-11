import api from "./api.js";

/**
 * Fetch listings with optional filters (all public).
 */
export async function fetchListings(params = {}) {
  const { data } = await api.get("/api/listings", { params });
  return data;
}

/** Single listing; `saved` is set when user is logged in (backend optional JWT). */
export async function fetchListingById(id) {
  const { data } = await api.get(`/api/listings/${id}`);
  return data;
}

export async function createListing(body) {
  const { data } = await api.post("/api/listings", body);
  return data;
}

export async function updateListing(id, body) {
  const { data } = await api.put(`/api/listings/${id}`, body);
  return data;
}

export async function deleteListing(id) {
  const { data } = await api.delete(`/api/listings/${id}`);
  return data;
}
