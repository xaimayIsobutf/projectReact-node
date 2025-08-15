// src/api/client.js
import axios from "axios";

export const API_BASE =
  (process.env.REACT_APP_API_BASE_URL || "http://localhost:3000/api")
    .replace(/\/+$/, ""); // ตัด / ท้าย

// ต้นทางไฟล์สาธารณะ (ไม่มี /api)
export const FILE_BASE = API_BASE.replace(/\/api$/, "");

// คืน URL ให้ถูกต้องเสมอ
export function urlFor(v) {
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;            // absolute URL อยู่แล้ว

  // รูปภาพต้องชี้ไปต้นทางไฟล์สาธารณะ (ห้ามเติม /api)
  if (v.startsWith("/uploads/")) return FILE_BASE + v;

  // endpoint ปกติ (เริ่มด้วย /)
  if (v.startsWith("/")) return API_BASE + v;

  // endpoint ปกติ (ไม่เริ่มด้วย /)
  return `${API_BASE}/${v}`;
}

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// token interceptor
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const serverMsg =
      typeof error.response?.data === "string"
        ? error.response.data
        : error.response?.data?.message ||
          error.response?.data?.error ||
          error.response?.data?.msg;
    const message = `[${status ?? "ERR"}] ${serverMsg || error.message || "Network error"}`;
    return Promise.reject(new Error(message));
  }
);

export default api;
