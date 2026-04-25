import api from "./api.js";

export async function fetchSavedListings() {
  const data = await api.get("/api/saved");
  return data.data;
}

/** POST /api/saved with JSON body { listingId } */
export async function saveListing(listingId) {
  const data = await api.post("/api/saved", { listingId });
  return data.data;
}

export async function unsaveListing(listingId) {
  const data = await api.delete(`/api/saved/${listingId}`);
  return data.data;
}
