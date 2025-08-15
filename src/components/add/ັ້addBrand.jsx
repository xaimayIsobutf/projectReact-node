import React, { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/category.css"; // ใช้ไฟล์เดิม โดยเราจะใส่ class prefix = brand-create
import { createBrand } from "../../api/brands";

const MAX_PRIORITY = 1_000_000;
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export default function BrandCreatePage() {
  const navigate = useNavigate();

  // form state
  const [name, setName] = useState("");
  const [priority, setPriority] = useState(0); // เริ่มที่ 0
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const inputRef = useRef(null);

  // preview cleanup
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // file choose
  const onPick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!/^image\/(png|jpe?g|webp|gif|bmp)$/i.test(f.type)) {
      setErr("ກະລຸນາເລືອກຮູບ(PNG/JPG/WebP/GIF)");
      e.target.value = "";
      return;
    }
    if (f.size > MAX_SIZE) {
      setErr("ໄຟຣ໌ບໍ່ເກີນ 5MB");
      e.target.value = "";
      return;
    }
    setErr("");
    setFile(f);
    setPreview((pre) => {
      if (pre) URL.revokeObjectURL(pre);
      return URL.createObjectURL(f);
    });
  };

  // number guard
  const onPriorityChange = (e) => {
    const v = e.target.value;
    if (v === "") return setPriority("");
    let n = Math.floor(Number(v) || 0);
    n = Math.max(0, Math.min(MAX_PRIORITY, n));
    setPriority(n);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!file) return setErr("ກະລຸນາເລືອກຮູບ");
    if (!name.trim()) return setErr("ກະລຸນາໃສ່ຊື່ແບລນ");

    try {
      setSaving(true);
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("priority", String(priority || 0));
      fd.append("image", file); // server คาด field name = "image"

      await createBrand(fd); // เรียก API
      navigate("/brands");
    } catch (e2) {
      setErr(e2.message || "ບັນທຶກບໍ່ສຳເລັດ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="main brand-create">
      {/* header */}
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

        <h1 className="page__title">ເພີ່ມແບລນ</h1>

        <nav className="breadcrumb" aria-label="breadcrumb">
          <Link to="/brands" style={{ color: "#f06f19", fontWeight: 700 }}>
            ແບລນ
          </Link>
          <span className="sep">›</span>
          <span className="current">ເພີ່ມແບລນ</span>
        </nav>
      </header>

      {/* card */}
      <main className="card">
        {err && <div className="err-box" style={{ marginBottom: 12 }}>{err}</div>}

        <form onSubmit={onSubmit} className="form">
          {/* โลโก้ */}
          <div className="row">
            <label className="label">
              ໂລໂກແບລນ <span className="req">*</span>
            </label>
            <div className="control">
              <div
                className="uploader"
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
              >
                {preview ? (
                  <img src={preview} alt="preview" className="thumb-lg" />
                ) : (
                  <div className="uploader-empty">
                    ຄິກເພື່ອເພີ່ມຮູບ (PNG/JPG/WebP, ≤ 5MB)
                  </div>
                )}
              </div>

              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={onPick}
                style={{ display: "none" }}
              />

              {file && (
                <div style={{ marginTop: 8, display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: "#6b7280" }}>
                    ໄຟຣ໌ {file.name} ({Math.round(file.size / 1024)} KB)
                  </span>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setFile(null);
                      if (preview) URL.revokeObjectURL(preview);
                      setPreview("");
                      if (inputRef.current) inputRef.current.value = "";
                    }}
                  >
                    ລຶບຮູບ
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ชื่อ */}
          <div className="row">
            <label className="label">
              ຊື່ <span className="req">*</span>
            </label>
            <div className="control">
              <input
                className="input"
                placeholder="ເຊັ່ນ: Brand A"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          {/* ลำดับ */}
          <div className="row">
            <label className="label">
              ລຳລັບການສະແດງຜົນ (0 – 1,000,000)
            </label>
            <div className="control">
              <input
                className="input w-160"
                type="number"
                inputMode="numeric"
                min={0}
                max={MAX_PRIORITY}
                step={1}
                value={priority}
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                }}
                onChange={onPriorityChange}
                onBlur={() =>
                  setPriority((p) =>
                    p === "" ? 0 : Math.max(0, Math.min(MAX_PRIORITY, Number(p) || 0))
                  )
                }
              />
            </div>
          </div>

          {/* actions */}
          <div className="actions">
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກ"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/brands")}
            >
                ຍົກເລີກ
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
