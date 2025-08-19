// src/api/products.js
import api from "./client";

/** ----------------- helpers ----------------- **/
const isFile = (v) =>
  (typeof File !== "undefined" && v instanceof File) ||
  (typeof Blob !== "undefined" && v instanceof Blob);

const numOrNull = (v) =>
  v === "" || v === null || v === undefined ? null : Number(v);

function buildFormData(payload = {}) {
  const {
    image,          // File
    name, name_lo, name_en,
    description, short_desc, detail_html,
    category_id, brand_id, unit_id,
    quantity, reserved_qty,
    slug, rating, badge_text_lo, badge_color, cost,
    product_type,   // "main" | "sub"
    has_variant,    // "yes" | "no" | 1 | 0 | true | false
    ...rest
  } = payload;

  const fd = new FormData();

  // รูป
  if (isFile(image)) fd.append("image", image);

  // ชื่อ: backend รองรับ name หรือ name_lo (เราใส่ name_lo เป็นหลัก)
  if (name_lo || name) fd.append("name_lo", name_lo ?? name);
  if (name_en) fd.append("name_en", name_en);

  // รายละเอียด
  if (description)  fd.append("description", description);
  if (short_desc)   fd.append("short_desc", short_desc);
  if (detail_html)  fd.append("detail_html", detail_html);

  // FK / จำนวน
  if (category_id != null) fd.append("category_id", String(category_id));
  if (brand_id     != null) fd.append("brand_id", String(brand_id));
  if (unit_id      != null) fd.append("unit_id", String(unit_id));
  if (quantity     != null) fd.append("quantity", String(numOrNull(quantity)));
  if (reserved_qty != null) fd.append("reserved_qty", String(numOrNull(reserved_qty)));

  // อื่น ๆ
  if (slug)          fd.append("slug", slug);
  if (rating != null)fd.append("rating", String(numOrNull(rating)));
  if (badge_text_lo) fd.append("badge_text_lo", badge_text_lo);
  if (badge_color)   fd.append("badge_color", badge_color);
  if (cost != null)  fd.append("cost", String(numOrNull(cost)));
  if (product_type)  fd.append("product_type", product_type);

  if (has_variant !== undefined && has_variant !== null) {
    // map ให้เป็น 0/1
    const hv = (has_variant === "yes" || has_variant === 1 || has_variant === "1" || has_variant === true) ? 1 : 0;
    fd.append("has_variant", String(hv));
  }

  // เหลือ ๆ ใส่เพิ่ม (stringify แบบเบา ๆ)
  Object.entries(rest).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    fd.append(k, String(v));
  });

  return fd;
}

/** ----------------- APIs ----------------- **/

// GET /products
export async function fetchProductsApi() {
  const res = await api.get("/products");
  return res.data;
}

// GET /products/:id
export async function fetchProductApi(id) {
  const res = await api.get(`/products/${id}`);
  return res.data;
}

// POST /products  (อัปโหลดรูป field = image)
export async function createProductApi(payload) {
  // ถ้ามาเป็น FormData อยู่แล้ว ส่งตรง
  if (payload instanceof FormData) {
    const res = await api.post("/products", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }
  // ไม่ใช่ FormData -> แปลงให้
  const fd = buildFormData(payload);
  const res = await api.post("/products", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// PUT /products/:id  (อัปเดต รองรับอัปโหลดรูปใหม่)
export async function updateProductApi(id, payload) {
  if (payload instanceof FormData) {
    const res = await api.put(`/products/${id}`, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }
  const fd = buildFormData(payload);
  const res = await api.put(`/products/${id}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// DELETE /products/:id
export async function deleteProductApi(id) {
  const res = await api.delete(`/products/${id}`);
  return res.data;
}
