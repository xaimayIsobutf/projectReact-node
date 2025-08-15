// src/components/categories/CategoryEditPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import "../../styles/category.css"; // ใช้สไตล์เดิม (cat-create)
import {
  getCategory,       // ⬅️ ถ้ายังไม่มี ฟังก์ชันนี้ดูบ๊อกซ์ด้านล่าง
  updateCategory,
  deleteCategory,
} from "../../api/categories";
import { listWarehouses } from "../../api/warehouses";

export default function CategoryEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [warehouses, setWarehouses] = useState([]);
  const [loadingWh, setLoadingWh] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [loadErr, setLoadErr] = useState("");
  const [submitErr, setSubmitErr] = useState("");

  const [form, setForm] = useState({
    warehouse_id: "",
    name_en: "",
    name_lo: "",
    priority: 0, // แก้ไขให้เริ่มที่ 0
  });
  const [errors, setErrors] = useState({});

  // โหลดข้อมูล: รายชื่อคลัง + รายละเอียดหมวดหมู่
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setLoadErr("");
        const [whs, cat] = await Promise.all([
          listWarehouses(),
          getCategory(id),
        ]);
        setWarehouses(whs || []);
        setForm({
          warehouse_id: String(cat?.warehouse_id ?? ""),
          name_en: cat?.name_en ?? "",
          name_lo: cat?.name_lo ?? "",
          priority: Number.isFinite(Number(cat?.priority)) ? Number(cat.priority) : 0,
        });
      } catch (e) {
        setLoadErr(e?.message || "ໂຫລດຂໍ້ມູນບໍ່ສຳເລັດ");
      } finally {
        setLoading(false);
        setLoadingWh(false);
      }
    })();
  }, [id]);

  // เปลี่ยนค่า input ทั่วไป
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  // จำกัด priority >= 0 เป็นจำนวนเต็ม
  const onPriorityChange = (e) => {
    const v = e.target.value;
    if (v === "") return setForm((s) => ({ ...s, priority: "" }));
    const n = Math.floor(Number(v) || 0);
    setForm((s) => ({ ...s, priority: Math.max(0, n) }));
  };

  // ตรวจฟอร์ม
  const validate = () => {
    const errs = {};
    if (!form.warehouse_id) errs.warehouse_id = "ກະລຸນາເລືອກໝວດໝູ່ຫຼັກ";
    if (!form.name_en.trim()) errs.name_en = "ກະລຸນາໃສ່ຊື່ພາສາອັງກິດ";
    if (!form.name_lo.trim()) errs.name_lo = "ກະລຸນາໃສ່ຊື່ພາສາລາວ";
    const n = Number(form.priority);
    if (form.priority === "" || !Number.isFinite(n) || n < 0) {
      errs.priority = "ລຳດັບຕ້ອງເປັນຈຳນວນເຕັມ (≥ 0)";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // บันทึก
  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitErr("");
    if (!validate()) return;

    try {
      setSaving(true);
      await updateCategory(id, {
        name_lo: form.name_lo.trim(),
        name_en: form.name_en.trim(),
        priority: Math.max(0, Math.floor(Number(form.priority) || 0)),
        warehouse_id: Number(form.warehouse_id), // ให้ backend รับเป็นตัวเลข
      });
      navigate("/categories");
    } catch (e2) {
      setSubmitErr(e2?.message || "ບັນທຶກບໍ່ສຳເລັດ");
    } finally {
      setSaving(false);
    }
  };

  // ลบ
  const onDelete = async () => {
    if (!window.confirm("ຢືນຢັນລຶບໝວດໝູ່ນີ້?")) return;
    try {
      setDeleting(true);
      await deleteCategory(id);
      navigate("/categories");
    } catch (e) {
      setSubmitErr(e?.message || "ລຶບບໍ່ສຳເລັດ");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="main cat-create">
      {/* Header / breadcrumb */}
      <header className="page__topbar">
        <button
          className="back"
          type="button"
          onClick={() => window.history.back()}
          aria-label="Back"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="11" />
            <polyline points="12 8 8 12 12 16" />
            <line x1="16" y1="12" x2="8" y2="12" />
          </svg>
        </button>
        <h1 className="page__title">ແກ້ໄຂໝວດໝູ່ສິນຄ້າ</h1>
        <nav className="breadcrumb" aria-label="breadcrumb">
          <Link to="/categories" style={{ color: "#f06f19", fontWeight: 700 }}>ໝວດໝູ່ສິນຄ້າ</Link>
          <span className="sep">›</span>
          <span className="current">ແກ້ໄຂ</span>
        </nav>
      </header>

      <main className="card">
        {loadErr && <div className="err-box" style={{ marginBottom: 12 }}>{loadErr}</div>}
        {submitErr && <div className="err-box" style={{ marginBottom: 12 }}>{submitErr}</div>}

        {loading ? (
          <div style={{ padding: 12, color: "#6b7280" }}>ກຳລັງໂຫລດ...</div>
        ) : (
          <form onSubmit={onSubmit} className="form">
            {/* Warehouse */}
            <div className="row">
              <label className="label">
                ໝວດໝູ່ຫຼັກ <span className="req">*</span>
              </label>
              <div className="control">
                <select
                  name="warehouse_id"
                  value={form.warehouse_id}
                  onChange={onChange}
                  disabled={loadingWh}
                  className={`input ${errors.warehouse_id ? "invalid" : ""}`}
                >
                  <option value="">
                    {loadingWh ? "ກຳລັງໂຫລດ..." : "— ເລືອກໝວດໝູ່ຫຼັກ —"}
                  </option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
                {errors.warehouse_id && <div className="error">{errors.warehouse_id}</div>}
              </div>
            </div>

            {/* English name */}
            <div className="row">
              <label className="label">
                ຊື່ພາສາອັງກິດ <span className="req">*</span>
              </label>
              <div className="control">
                <input
                  name="name_en"
                  value={form.name_en}
                  onChange={onChange}
                  placeholder="e.g. Accessories"
                  className={`input ${errors.name_en ? "invalid" : ""}`}
                />
                {errors.name_en && <div className="error">{errors.name_en}</div>}
              </div>
            </div>

            {/* Lao name */}
            <div className="row">
              <label className="label">
                ຊື່ພາສາລາວ <span className="req">*</span>
              </label>
              <div className="control">
                <input
                  name="name_lo"
                  value={form.name_lo}
                  onChange={onChange}
                  placeholder="ເຊັ່ນ ເສື້ອ"
                  className={`input ${errors.name_lo ? "invalid" : ""}`}
                />
                {errors.name_lo && <div className="error">{errors.name_lo}</div>}
              </div>
            </div>

            {/* Priority */}
            <div className="row">
              <label className="label">
                ລຳດັບຄວາມສຳຄັນ <span className="req">*</span>
              </label>
              <div className="control">
                <input
                  type="number"
                  name="priority"
                  min={0}
                  step={1}
                  value={form.priority}
                  inputMode="numeric"
                  onKeyDown={(e) => { if (["-", "e", "E", "+"].includes(e.key)) e.preventDefault(); }}
                  onChange={onPriorityChange}
                  onBlur={() =>
                    setForm((s) => s.priority === "" ? s : { ...s, priority: Math.max(0, Number(s.priority) || 0) })
                  }
                  className={`input w-160 ${errors.priority ? "invalid" : ""}`}
                />
                {errors.priority && <div className="error">{errors.priority}</div>}
              </div>
            </div>

            {/* Actions */}
            <div className="actions" style={{ gap: 10, flexWrap: "wrap" }}>
              <button className="btn-primary" type="submit" disabled={saving}>
                {saving ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກ"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate("/categories")}
              >
                ຍົກເລີກ
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={onDelete}
                disabled={deleting}
                style={{ background: "#ef4444", color: "#fff", marginLeft: "auto" }}
                title="ລຶບໝວດໝູ່"
              >
                {deleting ? "ກຳລັງລຶບ..." : "ລຶບໝວດໝູ່"}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
