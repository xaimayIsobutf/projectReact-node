import api from "./client";

export async function listBrands() {
  const res = await api.get("/brands");
  return res.data;
}
export const fetchBrandsApi = listBrands;

export async function getBrand(id) {
  const res = await api.get(`/brands/${id}`);
  return res.data;
}

export async function createBrand(payloadOrFormData) {
  const isForm = payloadOrFormData instanceof FormData;
  const res = await api.post("/brands", payloadOrFormData, {
    headers: isForm ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return res.data;
}

export async function updateBrand(id, payloadOrFormData) {
  const isForm = payloadOrFormData instanceof FormData;
  const res = await api.put(`/brands/${id}`, payloadOrFormData, {
    headers: isForm ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return res.data;
}

export async function deleteBrand(id) {
  const res = await api.delete(`/brands/${id}`);
  return res.data;
}
