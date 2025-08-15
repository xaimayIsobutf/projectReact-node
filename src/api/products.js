import api from "./client";

// โหลดรายการสินค้า
export async function fetchProductsApi() {
  const res = await api.get("/products");
  return res.data;
}

// สร้างสินค้าใหม่ (รองรับอัปโหลดรูป field = "image")
export async function createProductApi(payload) {
  // ถ้ามาเป็น FormData อยู่แล้ว ก็ส่งตรง
  if (payload instanceof FormData) {
    const res = await api.post("/products", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }

  // ไม่ใช่ FormData -> แปลงให้ (image: File?, field อื่น ๆ เป็น text/number)
  const fd = new FormData();
  const {
    image,                // File | undefined
    name, name_lo,        // อย่างน้อยอย่างใดอย่างหนึ่ง
    name_en,
    description,
    short_desc,
    detail_html,
    category_id,
    brand_id,
    unit_id,
    quantity,
    reserved_qty,
    slug,
    rating,
    badge_text_lo,
    badge_color,
    cost,
    product_type,
    has_variant,
    ...rest               // เหลือ ๆ จะยัดลงไปให้ด้วย
  } = payload || {};

  if (image) fd.append("image", image);
  if (name_lo || name) fd.append("name_lo", name_lo ?? name);
  if (name_en) fd.append("name_en", name_en);
  if (description) fd.append("description", description);
  if (short_desc) fd.append("short_desc", short_desc);
  if (detail_html) fd.append("detail_html", detail_html);
  if (category_id != null) fd.append("category_id", String(category_id));
  if (brand_id != null) fd.append("brand_id", String(brand_id));
  if (unit_id != null) fd.append("unit_id", String(unit_id));
  if (quantity != null) fd.append("quantity", String(quantity));
  if (reserved_qty != null) fd.append("reserved_qty", String(reserved_qty));
  if (slug) fd.append("slug", slug);
  if (rating != null) fd.append("rating", String(rating));
  if (badge_text_lo) fd.append("badge_text_lo", badge_text_lo);
  if (badge_color) fd.append("badge_color", badge_color);
  if (cost != null) fd.append("cost", String(cost));
  if (product_type) fd.append("product_type", product_type);
  if (has_variant != null) fd.append("has_variant", String(has_variant));

  // เผื่อฟิลด์อื่น ๆ
  Object.entries(rest || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, String(v));
  });

  const res = await api.post("/products", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}
