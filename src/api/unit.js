// src/api/units.js
import api from "./client";

// helper เล็กๆ
const unwrap = (res) => res?.data ?? res;

export async function listUnits(params = {}) {
  // params: { search?: string }
  const res = await api.get("/units", { params });
  return unwrap(res);
}

export async function getUnit(id) {
  const res = await api.get(`/units/${id}`);
  return unwrap(res);
}

export async function createUnit(payload) {
  // payload: { name: string }
  const res = await api.post("/units", { name: String(payload?.name || "").trim() });
  return unwrap(res);
}

export async function updateUnit(id, payload) {
  const res = await api.put(`/units/${id}`, { name: String(payload?.name || "").trim() });
  return unwrap(res);
}

export async function deleteUnit(id) {
  const res = await api.delete(`/units/${id}`);
  return unwrap(res);
}

// alias เผื่อ component อื่นเรียกชื่อ pattern เดิม
export const fetchUnitsApi = listUnits;
