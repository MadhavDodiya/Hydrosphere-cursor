import api from "./api.js";

/**
 * Fetch all public listings with filters
 */
export const fetchListings = async (params = {}) => {
  try {
    const { data } = await api.get("/api/listings", { params });
    return data;
  } catch (error) {
    console.error("Listing Fetch Error:", error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Fetch supplier's own listings
 */
export const fetchMyListings = async () => {
  try {
    const { data } = await api.get("/api/listings/my-listings");
    return data;
  } catch (error) {
    console.error("My Listings Error:", error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Fetch single listing detail
 */
export const fetchListingById = async (id) => {
  try {
    const { data } = await api.get(`/api/listings/${id}`);
    return data;
  } catch (error) {
    console.error("Listing Detail Error:", error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Create new listing (Supplier only)
 */
export const createListing = async (formData) => {
  try {
    const { data } = await api.post("/api/listings", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (error) {
    console.error("Create Listing Error:", error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Update existing listing
 */
export const updateListing = async (id, formData) => {
  try {
    const { data } = await api.put(`/api/listings/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (error) {
    console.error("Update Listing Error:", error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Delete listing
 */
export const deleteListing = async (id) => {
  try {
    const { data } = await api.delete(`/api/listings/${id}`);
    return data;
  } catch (error) {
    console.error("Delete Listing Error:", error.response?.data?.message || error.message);
    throw error;
  }
};
