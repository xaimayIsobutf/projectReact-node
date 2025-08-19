import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";

import { createProductApi } from "../../api/products";
import { fetchCategoriesApi } from "../../api/categories";
import { fetchBrandsApi } from "../../api/brands";
import { listUnits, createUnit } from "../../api/unit";    // ✅ เชื่อมต่อหน่วย

import "../../styles/product.css";

const MAX_IMG_MB = 5;

export default function AddProductPage() {
  const navigate = useNavigate();

  // lists
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);
  const [loadingLists, setLoadingLists] = useState(true);

  // status
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  // form
  const [form, setForm] = useState({
    product_type: "main",   // main | sub
    has_variant: "no",      // no | yes
    category_id: "",
    brand_id: "",
    name_lo: "",
    unit_id: "",            // ✅ ใช้ id ของหน่วย

    quantity: "",
    reserved_qty: "",
    cost: "",
    slug: "",
    rating: "",
    badge_text_lo: "",
    badge_color: "",
    short_desc: "",
    detail_html: "",
  });

  // image
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");

  // ---------- load lists ----------
  useEffect(() => {
    (async () => {
      try {
        setLoadingLists(true);
        setErr("");
        const [cats, brs, uns] = await Promise.all([
          fetchCategoriesApi(),
          fetchBrandsApi().catch(() => []),
          listUnits().catch(() => []),
        ]);
        setCategories(cats || []);
        setBrands(brs || []);
        setUnits(uns || []);
      } catch (e) {
        setErr(e?.message || "ໂຫລດຂໍ້ມູນບໍ່ສຳເລັດ");
      } finally {
        setLoadingLists(false);
      }
    })();
  }, []);

  // image preview
  const prevUrlRef = useRef(null);

useEffect(() => {
  // cleanup url เก่าถ้ามี
  if (prevUrlRef.current) {
    URL.revokeObjectURL(prevUrlRef.current);
    prevUrlRef.current = null;
  }

  if (!imageFile) {          // ไม่มีไฟล์ -> ล้างพรีวิว
    setPreview(null);
    return;
  }

  // สร้าง url ใหม่
  const url = URL.createObjectURL(imageFile);
  prevUrlRef.current = url;
  setPreview(url);

  // cleanup ตอน unmount หรือ imageFile เปลี่ยนรอบถัดไป
  return () => {
    if (prevUrlRef.current) {
      URL.revokeObjectURL(prevUrlRef.current);
      prevUrlRef.current = null;
    }
  };
}, [imageFile]);
  // change handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const numGuard = (name) => (e) => {
    const v = e.target.value;
    if (v === "") return setForm((s) => ({ ...s, [name]: "" }));
    const n = name === "rating" ? Number(v) : Math.floor(Number(v) || 0);
    setForm((s) => ({ ...s, [name]: isNaN(n) ? "" : n }));
  };

  const canSubmit = useMemo(
    () => !!form.category_id && !!form.name_lo,
    [form.category_id, form.name_lo]
  );

  // add unit quickly (optional)
  const quickAddUnit = async () => {
    const name = window.prompt("ຕັ້ງຊື່ຫົວໜ່ວຍ (ຕົວຢ່າງ: ຊິ້ນ, ກ່ອງ, kg)");
    if (!name) return;
    try {
      const created = await createUnit({ name });
      setUnits((u) => [...u, created]);
      setForm((s) => ({ ...s, unit_id: String(created.id) }));
    } catch (e) {
      alert(e?.message || "ເພີ່ມຫົວໜ່ວຍບໍ່ສຳເລັດ");
    }
  };

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || saving) return;

    // validate image size/type (ถ้ามี)
    if (imageFile) {
      if (!/^image\/(png|jpe?g|webp|gif|bmp)$/i.test(imageFile.type)) {
        return setErr("ຮູບທີ່ຮັບຮອງ: PNG/JPG/WebP/GIF/BMP");
      }
      if (imageFile.size > MAX_IMG_MB * 1024 * 1024) {
        return setErr(`ໄຟລ໌ຕ້ອງບໍ່ເກີນ ${MAX_IMG_MB}MB`);
      }
    }

    setSaving(true);
    setErr("");

    try {
      // backend รองรับ form-data (field รูป= image) และ map ฟิลด์เข้าตาราง products
      const payload = {
        ...form,
        // ค่า number ว่างให้เป็น null
        quantity: form.quantity === "" ? null : Number(form.quantity),
        reserved_qty: form.reserved_qty === "" ? null : Number(form.reserved_qty),
        rating: form.rating === "" ? null : Number(form.rating),
        cost: form.cost === "" ? null : Number(form.cost),
        brand_id: form.brand_id || null,
        unit_id: form.unit_id || null,
      };
      if (imageFile) payload.image = imageFile;

      await createProductApi(payload);
      navigate("/products");
    } catch (e2) {
      setErr(e2?.message || "ບັນທຶກບໍ່ສຳເລັດ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="product-add-page">
      <p className="link-back">
        <Link to="/products" className="Origin-G">ສິນຄ້າ</Link> / ເພີ່ມສິນຄ້າ
      </p>

      <div className="card">
        <div className="card__header"><h2>ເພີ່ມສິນຄ້າ</h2></div>

        <form className="pad-16" onSubmit={handleSubmit}>
          {/* top row */}
          <div className="grid-3">
            <div className="field">
              <label>ປະເພດສິນຄ້າ</label>
              <div className="radio-row">
                <label>
                  <input
                    type="radio"
                    name="product_type"
                    value="main"
                    checked={form.product_type === "main"}
                    onChange={handleChange}
                  /> ສິນຄ້າຫຼັກ
                </label>
                <label>
                  <input
                    type="radio"
                    name="product_type"
                    value="sub"
                    checked={form.product_type === "sub"}
                    onChange={handleChange}
                  /> ສິນຄ້າຍ່ອຍ
                </label>
              </div>
            </div>

            <div className="field">
              <label>ໝວດໝູ່ <span className="req">*</span></label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                required
                disabled={loadingLists}
              >
                <option value="">
                  {loadingLists ? "ກຳລັງໂຫລດ..." : "– ເລືອກ –"}
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_lo || c.name_en || c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>ແບຣນ</label>
              <select
                name="brand_id"
                value={form.brand_id}
                onChange={handleChange}
                disabled={loadingLists}
              >
                <option value="">ບໍ່ລະບຸ</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name_lo || b.name_en || b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field col-2">
              <label>ຊື່ສິນຄ້າ <span className="req">*</span></label>
              <input
                name="name_lo"
                value={form.name_lo}
                onChange={handleChange}
                placeholder="ເຊັ່ນ ນົມ UHT 200ml"
                required
              />
            </div>

            <div className="field">
              <label>ຫົວໜ່ວຍຂອງສິນຄ້າ</label>
              <div style={{ display: "flex", gap: 8 }}>
                <select
                  name="unit_id"
                  className="input"
                  value={form.unit_id}
                  onChange={handleChange}
                  disabled={loadingLists}
                >
                  <option value="">
                    {loadingLists ? "ກຳລັງໂຫລດ..." : "— ເລືອກ —"}
                  </option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
                <button type="button" className="btn-secondary" onClick={quickAddUnit}>
                  + ເພີ່ມ
                </button>
              </div>
            </div>

            <div className="field">
              <label>ຈຳນວນ</label>
              <input
                type="number"
                name="quantity"
                inputMode="numeric"
                value={form.quantity}
                onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                onChange={numGuard("quantity")}
              />
            </div>

            <div className="field">
              <label>ຈຳນວນທີ່ກັນໄວ້</label>
              <input
                type="number"
                name="reserved_qty"
                inputMode="numeric"
                value={form.reserved_qty}
                onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                onChange={numGuard("reserved_qty")}
              />
            </div>

            <div className="field">
              <label>ຮູບແບບສິນຄ້າຍ່ອຍ</label>
              <div className="radio-row">
                <label>
                  <input
                    type="radio"
                    name="has_variant"
                    value="no"
                    checked={form.has_variant === "no"}
                    onChange={handleChange}
                  /> ບໍ່ມີສິນຄ້າຍ່ອຍ
                </label>
                <label>
                  <input
                    type="radio"
                    name="has_variant"
                    value="yes"
                    checked={form.has_variant === "yes"}
                    onChange={handleChange}
                  /> ມີສິນຄ້າຍ່ອຍ
                </label>
              </div>
            </div>
          </div>

          {/* details */}
          <div className="tabs">
            <button type="button" className="tab active">ລາຍລະອຽດສິນຄ້າ</button>
            <button type="button" className="tab" disabled>ໂປຣໂມຊັ່ນ (ໄວໆນີ້)</button>
          </div>

          <div className="grid-4">
            <div className="field">
              <label>ຕົ້ນທຶນ</label>
              <input
                type="number"
                step="0.01"
                name="cost"
                value={form.cost}
                onChange={numGuard("cost")}
              />
            </div>
            <div className="field">
              <label>Slug (URL)</label>
              <input
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="uht-milk-200ml"
              />
            </div>
            <div className="field">
              <label>Rating</label>
              <input
                type="number"
                step="0.1"
                name="rating"
                value={form.rating}
                onChange={numGuard("rating")}
              />
            </div>
            <div className="field">
              <label>Badge (ພາສາລາວ)</label>
              <input
                name="badge_text_lo"
                value={form.badge_text_lo}
                onChange={handleChange}
              />
            </div>
            <div className="field">
              <label>ສີ Badge</label>
              <select
                name="badge_color"
                value={form.badge_color}
                onChange={handleChange}
              >
                <option value="">ບໍ່ມີ</option>
                <option value="#22c55e">ຂຽວ</option>
                <option value="#3b82f6">ຟ້າ</option>
                <option value="#f59e0b">ສົ້ມ</option>
                <option value="#ef4444">ແດງ</option>
                <option value="#6b7280">ເທົາ</option>
              </select>
            </div>
            <div className="field col-2">
              <label>ຄຳອະທິບາຍໂດຍຫຍໍ້</label>
              <input
                name="short_desc"
                value={form.short_desc}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* image */}
          <div className="field">
            <label>ຮູບສິນຄ້າ</label>
            <div className="uploader" onClick={() => document.getElementById("imgInput").click()}>
              {preview ? (
                <img src={preview} alt="preview" className="thumb-lg" />
              ) : (
                <div className="uploader-empty">＋📷 ອັບໂຫຼດຮູບ</div>
              )}
              <input
                id="imgInput"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/bmp"
                style={{ display: "none" }}
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          {/* rich detail */}
          <div className="field">
            <label>ລາຍລະອຽດສິນຄ້າ</label>
            <textarea
              rows={6}
              name="detail_html"
              value={form.detail_html}
              onChange={handleChange}
              placeholder="ລາຍລະອຽດ/ວິທີໃຊ້/ສ່ວນປະກອບ"
            />
          </div>

          {err && <div className="err-box">{err}</div>}

          <div className="actions">
            <button className="btn-primary" disabled={!canSubmit || saving}>
              {saving ? "ກຳລັງບັນທຶກ…" : "ບັນທຶກສິນຄ້າ"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate(-1)}
            >
              ຍົກເລີກ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
