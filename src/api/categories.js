// src/api/categories.js
import api from "./client";

// ใช้กับ list เท่านั้น (รับ array หรือ object ที่ห่อ data/items มา)
const unwrap = (payload) =>
  payload?.data ?? payload?.items ?? payload ?? [];

/* ====== Read ====== */
export async function listCategories() {
  const { data } = await api.get("/categories");
  return unwrap(data);
}

// alias เดิมให้ component เก่าที่เรียกใช้
export const fetchCategoriesApi = listCategories;

// ✅ เพิ่ม: ดึงหมวดหมู่รายตัว (ใช้กับหน้าแก้ไข)
export async function getCategory(id) {
  const { data } = await api.get(`/categories/${id}`);
  return data; // backend คืน object แถวเดียว
}

/* ====== Helpers ====== */
const toIntOrNull = (v) => {
  if (v === "" || v === null || typeof v === "undefined") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.floor(n) : null;
};
const toIntRequired = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.floor(n) : NaN;
};

/* ====== Create / Update / Delete ====== */
export async function createCategory(payload) {
  const body = {
    name_lo: payload?.name_lo?.trim() || "",
    name_en: payload?.name_en?.trim() || "",
    priority: toIntOrNull(payload?.priority),         // null หรือจำนวนเต็ม
    warehouse_id: toIntRequired(payload?.warehouse_id) // ต้องเป็นจำนวนเต็ม
  };
  const { data } = await api.post("/categories", body);
  return data;
}

export async function updateCategory(id, payload) {
  const body = {
    name_lo: payload?.name_lo?.trim() || "",
    name_en: payload?.name_en?.trim() || "",
    priority: toIntOrNull(payload?.priority),
    warehouse_id: toIntRequired(payload?.warehouse_id)
  };
  const { data } = await api.put(`/categories/${id}`, body);
  return data;
}

export async function deleteCategory(id) {
  const { data } = await api.delete(`/categories/${id}`);
  return data;
}
