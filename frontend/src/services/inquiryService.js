import api from "./api.js";

export async function createInquiry(payload) {
  const { data } = await api.post("/api/inquiries", payload);
  return data;
}

export async function fetchSellerInquiries() {
  const { data } = await api.get("/api/inquiries/seller");
  return data;
}

export async function fetchBuyerInquiries() {
  const { data } = await api.get("/api/inquiries/buyer");
  return data;
}

