// src/api/warehouses.js
import  api  from "./client";

export async function listWarehouses() {
  const { data } = await api.get("/warehouses");
  return Array.isArray(data) ? data : data.items || [];
}
