import api from "./api.js";

export async function createInquiry(payload) {
  const data = await api.post("/api/inquiries", payload);
  return data.data;
}

export async function fetchSupplierInquiries() {
  const data = await api.get("/api/inquiries/supplier");
  return data.data;
}

export async function fetchBuyerInquiries() {
  const data = await api.get("/api/inquiries/buyer");
  return data.data;
}

export async function addReply(id, message) {
  const data = await api.post(`/api/inquiries/${id}/reply`, { message });
  return data.data;
}

export async function updateInquiryStatus(id, status) {
  const data = await api.put(`/api/inquiries/${id}/status`, { status });
  return data.data;
}
