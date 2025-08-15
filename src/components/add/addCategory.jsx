// src/components/categories/AddCategoryForm.jsx
import React, { useEffect, useState } from "react";
import "../../styles/category.css"; // ใช้สไตล์ที่มีอยู่
import { useNavigate } from "react-router-dom";
import { createCategory } from "../../api/categories";
import { listWarehouses } from "../../api/warehouses";

export default function AddCategoryForm() {
  const navigate = useNavigate();

  // ✅ ดึงรายการ "หมวดหมู่หลัก" (warehouses) จากแบ็กเอนด์ แทน mock
  const [warehouses, setWarehouses] = useState([]);
  const [loadingWh, setLoadingWh] = useState(true);
  const [loadErr, setLoadErr] = useState("");

  const [saving, setSaving] = useState(false);
  const [submitErr, setSubmitErr] = useState("");

  const [form, setForm] = useState({
    warehouse_id: "",   // แทน parentId ของโค้ดเดิม
    name_en: "",
    name_lo: "",        // โค้ด API ใช้ name_lo (เดิมในตัวอย่างคุณใช้ nameTh)
    priority: "",       // เก็บเป็น string เพื่อให้ลบค่าได้ขณะพิมพ์
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    (async () => {
      try {
        setLoadingWh(true);
        setLoadErr("");
        const whs = await listWarehouses();
        setWarehouses(whs || []);
      } catch (e) {
        setLoadErr(e.message || "ໂຫລດຄັງສິນຄ້າບໍ່ສຳເລັດ");
      } finally {
        setLoadingWh(false);
      }
    })();
  }, []);

  function onChange(e) {
    const { name, value } = e.target;
    // กันค่าติดลบ/อักขระพิเศษสำหรับ priority
    if (name === "priority") {
      // อนุญาตเป็น "" ระหว่างพิมพ์ เพื่อให้แก้ไขได้
      if (value === "") return setForm((s) => ({ ...s, priority: "" }));
      // บังคับเป็นจำนวนเต็ม >= 1
      const n = parseInt(value, 10);
      return setForm((s) => ({
        ...s,
        priority: Number.isNaN(n) ? "" : Math.max(1, n),
      }));
    }
    setForm((s) => ({ ...s, [name]: value }));
  }
  const onPriorityChange = (e) => {
  const v = e.target.value;
  if (v === "") {
    setForm((s) => ({ ...s, priority: "" }));
    return;
  }
  const n = Math.floor(Number(v) || 0);
  setForm((s) => ({ ...s, priority: Math.max(0, n) }));
};

  function validate() {
    const errs = {};
    if (!form.warehouse_id) errs.warehouse_id = "ກະລຸນາເລືອກໝວດໝູ່ຫຼັກ";
    if (!form.name_en.trim()) errs.name_en = "ກະລຸນາຂຽນຊື່ພາສາອັງກິດ";
    if (!form.name_lo.trim()) errs.name_lo = "ກະລຸນາຂຽນຊື່ພາສາລາວ";
    const n = Number(form.priority);
    if (form.priority === "" || !Number.isFinite(n) || n < 1) {
      errs.priority = "ລຳດັບຄວາມສຳຄັນຕ້ອງເປັນຈຳນວນເຕັມ (≥ 1)";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitErr("");
    if (!validate()) return;

    try {
      setSaving(true);
      await createCategory({
        name_lo: form.name_lo,
        name_en: form.name_en,
        priority: Number(form.priority),
        warehouse_id: form.warehouse_id,
      });
      navigate("/categories");
    } catch (e) {
      setSubmitErr(e.message || "ບັນທຶກບໍ່ສຳເລັດ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="main cat-create">
      {/* ===== Page Header / Breadcrumb ===== */}
      <header className="page__topbar">
        <button
          className="back"
          type="button"
          onClick={() => window.history.back()}
          aria-label="Back"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="11" />
            <polyline points="12 8 8 12 12 16" />
            <line x1="16" y1="12" x2="8" y2="12" />
          </svg>
        </button>
        <h1 className="page__title">ເພີ່ມໝວດໝູ່ສິນຄ້າ</h1>
        <nav className="breadcrumb" aria-label="breadcrumb">
        <span className="crumb--accent" onClick={()=>navigate('/categories')}>ໝວດໝູ່ສິນຄ້າ</span>
          <span className="sep">›</span>
          <span className="current">ເພີ່ມໝວດໝູ່ສິນຄ້າ</span>
        </nav>
      </header>

      {/* ===== Form Card ===== */}
      <main className="card">
        {/* แจ้ง error ระดับหน้า */}
        {loadErr && (
          <div className="err-box" style={{ marginBottom: 12 }}>
            {loadErr}
          </div>
        )}
        {submitErr && (
          <div className="err-box" style={{ marginBottom: 12 }}>
            {submitErr}
          </div>
        )}
        <form onSubmit={onSubmit} className="form">
          {/* หมวดหมู่หลัก (warehouse) */}
          <div className="row">
            <label htmlFor="warehouse_id" className="label">
              ໝວດໝູ່ຫຼັກ <span className="req">*</span>
            </label>
            <div className="control">
              <select
                id="warehouse_id"
                name="warehouse_id"
                value={form.warehouse_id}
                onChange={onChange}
                className={`input ${errors.warehouse_id ? "invalid" : ""}`}
                disabled={loadingWh}
              >
                <option value="">
                  {loadingWh ? "ກຳລັງໂຫລດ..." : "— ເລືອກໝວດໝູ່ຫຼັກ —"}
                </option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
              {errors.warehouse_id && (
                <div className="error">{errors.warehouse_id}</div>
              )}
            </div>
          </div>

          {/* English name */}
          <div className="row">
            <label htmlFor="name_en" className="label">
              ຊື່ພາສາອັງກິດ <span className="req">*</span>
            </label>
            <div className="control">
              <input
                id="name_en"
                name="name_en"
                value={form.name_en}
                onChange={onChange}
                className={`input ${errors.name_en ? "invalid" : ""}`}
                placeholder="e.g. Accessories"
              />
              {errors.name_en && <div className="error">{errors.name_en}</div>}
            </div>
          </div>

          {/* Lao name */}
          <div className="row">
            <label htmlFor="name_lo" className="label">
              ຊື່ພາສາລາວ <span className="req">*</span>
            </label>
            <div className="control">
              <input
                id="name_lo"
                name="name_lo"
                value={form.name_lo}
                onChange={onChange}
                className={`input ${errors.name_lo ? "invalid" : ""}`}
                placeholder="ເຊັ່ນ ເສື້ອ"
              />
              {errors.name_lo && <div className="error">{errors.name_lo}</div>}
            </div>
          </div>

          {/* Priority (>=0) */}
          <div className="row">
        <label htmlFor="priority" className="label">
            ລຳດັບຄວາມສຳຄັນ <span className="req">*</span>
        </label>
            <div className="control">
                <input
                id="priority"
                type="number"
                name="priority"
                min={0}
                step={1}                   // ✅ step ที่ถูกต้อง
                value={form.priority}
                inputMode="numeric"
                onKeyDown={(e) => {        // ป้องกันการพิมพ์ค่าที่ไม่ต้องการ
                    if (["-", "e", "E", "+"].includes(e.key)) e.preventDefault();
                }}
                onChange={onPriorityChange} // ✅ คุมค่าให้เป็นจำนวนเต็มและ ≥ 0
                onBlur={() =>
                    setForm((s) =>
                    s.priority === "" ? s : { ...s, priority: Math.max(0, Number(s.priority) || 0) }
                    )
                }                            // ✅ ย้ำ clamp อีกครั้งตอน blur
                required
                className={`input w-160 ${errors.priority ? "invalid" : ""}`}
                />
                {errors.priority && <div className="error">{errors.priority}</div>}
            </div>
            </div>
    
            {/* ปุ่มบันทึก */}

          <div className="actions">
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກ"}
            </button>
            <button
              className="btn-secondary"
              type="button"
              onClick={() => navigate("/categories")}
            >
              ຍົກເລີກ
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
