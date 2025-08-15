// src/components/brands/EditBrand.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getBrand, updateBrand, deleteBrand } from "../../api/brands";
import { urlFor } from "../../api/client";

export default function EditBrand() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [loadErr, setLoadErr] = useState("");
  const [submitErr, setSubmitErr] = useState("");

  const [name, setName] = useState("");
  const [priority, setPriority] = useState(0);

  const [imageUrl, setImageUrl] = useState(""); // path เดิมจาก DB
  const [file, setFile] = useState(null);       // รูปใหม่ (ถ้าเลือก)
  const [preview, setPreview] = useState("");   // URL สำหรับแสดงรูป (absolute หรือ blob)
  const [imageRemoved, setImageRemoved] = useState(false); // ✅ กดลบโลโก้

//   const brandId = Number(id);
  // เคลียร์ blob URL เวลาหน้า unmount หรือ preview เปลี่ยน
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // โหลดข้อมูลเดิม
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setLoadErr("");
        const data = await getBrand(id); // { id, name, imageUrl, priority }
        setName(data?.name || "");
        setPriority(Number.isFinite(Number(data?.priority)) ? Number(data.priority) : 0);
        setImageUrl(data?.imageUrl || "");
        setPreview(urlFor(data?.imageUrl || "")); // พรีวิวรูปเดิม (absolute)
        setImageRemoved(false);
        setFile(null);
      } catch (e) {
        setLoadErr(e.message || "ໂຫລດຂໍ້ມູນບໍ່ສຳເລັດ");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // เลือกรูปใหม่
  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/^image\/(png|jpe?g|webp|gif|bmp)$/i.test(f.type)) {
      setSubmitErr("ຮູບທີ່ຮັບຮອງ: PNG, JPG, JPEG, WebP, GIF, BMP");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setSubmitErr("ຂະໜາດຮູບຫ້າມເກີນ 5MB");
      return;
    }
    setSubmitErr("");
    setFile(f);
    setImageRemoved(false);                   // เพราะมีไฟล์ใหม่แล้ว
    setImageUrl("");                          // เคลียร์ path เดิม เพื่อให้สถานะปุ่มสอดคล้อง
    setPreview(URL.createObjectURL(f));       // พรีวิวรูปใหม่ (blob)
  };

  // ลบโลโก้ (คงตัวแบรนด์ไว้)
  const onRemoveLogo = () => {
    if (!preview && !imageUrl) return;
    setFile(null);
    setPreview("");
    setImageUrl("");          // ✅ เคลียร์ path เดิม
    setImageRemoved(true);    // ✅ ส่งสัญญาณให้ backend ล้างรูป (clearImage)
  };

  // จำกัด priority ≥ 0
  const onPriorityChange = (e) => {
    const v = e.target.value;
    if (v === "") return setPriority("");
    const n = Math.floor(Number(v) || 0);
    setPriority(Math.max(0, n));
  };

  // บันทึก
  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitErr("");

    if (!name.trim()) {
      setSubmitErr("ກະລຸນາໃສ່ຊື່ແບຣນ");
      return;
    }
    const n = Number(priority);
    if (!Number.isFinite(n) || n < 0) {
      setSubmitErr("ລຳດັບຕ້ອງເປັນຈຳນວນເຕັມ (≥ 0)");
      return;
    }

    try {
      setSaving(true);

      if (file) {
        // 1) มีไฟล์ใหม่ -> ใช้ FormData (image field = "image")
        const fd = new FormData();
        fd.append("name", name.trim());
        fd.append("priority", String(Math.floor(n)));
        fd.append("image", file);
        await updateBrand(id, fd);
      } else if (imageRemoved) {
        // 2) ไม่มีไฟล์ใหม่ แต่สั่งลบโลโก้
        await updateBrand(id, {
          name: name.trim(),
          priority: Math.floor(n),
          clearImage: true,
        });
      } else {
        // 3) อัปเดตเฉพาะข้อมูล
        await updateBrand(id, {
          name: name.trim(),
          priority: Math.floor(n),
        });
      }

      navigate("/brands");
    } catch (e) {
      setSubmitErr(e.message || "ບັນທຶກບໍ່ສຳເລັດ");
    } finally {
      setSaving(false);
    }
  };

  // ลบแบรนด์
  const onDeleteBrand = async () => {
    if (!window.confirm("ຢືນຢັນລຶບແບຣນນີ້?")) return;
    try {
      setDeleting(true);
      await deleteBrand(id);
      navigate("/brands");
    } catch (e) {
      setSubmitErr(e.message || "ລຶບບໍ່ສຳເລັດ");
    } finally {
      setDeleting(false);
    }
  };
  return (
    <div className="brand-create">
      <header className="page__topbar">
        <button
          className="back"
          type="button"
          onClick={() => window.history.back()}
          aria-label="Back"
          disabled={saving || deleting}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
               strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="11" />
            <polyline points="12 8 8 12 12 16" />
            <line x1="16" y1="12" x2="8" y2="12" />
          </svg>
        </button>
        <h1 className="page__title">ແກ້ໄຂແບຣນ</h1>
        <nav className="breadcrumb" aria-label="breadcrumb">
          <Link to="/brands" style={{ color: "#f06f19", fontWeight: 700 }}>ແບຣນດ໌</Link>
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
            {/* โลโก้ + ลบโลโก้ */}
            <div className="row">
              <label className="label">ໂລໂກ້ແບຣນ <span className="req">*</span></label>
              <div className="control">
                <label className="uploader" htmlFor="brand-image" style={{ pointerEvents: saving || deleting ? "none" : "auto", opacity: (saving || deleting) ? .6 : 1 }}>
                  {preview ? (
                    <img className="thumb-lg" src={preview} alt="brand" />
                  ) : (
                    <div className="uploader-empty">
                      ຄລິກເພື່ອອັບໂຫລດ (PNG/JPG/WebP, ≤ 5MB)
                    </div>
                  )}
                </label>

                <input
                  id="brand-image"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/bmp"
                  style={{ display: "none" }}
                  onChange={onPickFile}
                  disabled={saving || deleting}
                />

                <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {/* <label htmlFor="brand-image" className="btn-secondary" style={{ cursor: "pointer", opacity: (saving || deleting) ? .6 : 1, pointerEvents: (saving || deleting) ? "none" : "auto" }}>
                    ເລືອກຮູບ...
                  </label> */}
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={onRemoveLogo}
                    disabled={(!preview && !imageUrl) || saving || deleting}
                    style={{ background: "#fee2e2", color: "#b91c1c" }}
                    title="ລຶບໂລໂກ້ (ຈະຖືກລ້າງຕອນກົດບັນທຶກ)"
                  >
                    ລຶບໂລໂກ້
                  </button>
                </div>
              </div>
            </div>

            {/* ชื่อ */}
            <div className="row">
              <label className="label">ຊື່ <span className="req">*</span></label>
              <div className="control">
                <input
                  className="input"
                  placeholder="ເຊັ່ນ Brand A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={saving || deleting}
                  required
                />
              </div>
            </div>

            {/* Priority */}
            <div className="row">
              <label className="label">ລຳດັບການສະແດງ (0 – 1,000,000)</label>
              <div className="control">
                <input
                  className="input w-160"
                  type="number"
                  min={0}
                  step={1}
                  value={priority}
                  inputMode="numeric"
                  onKeyDown={(e) => {
                    if (["-", "e", "E", "+"].includes(e.key)) e.preventDefault();
                  }}
                  onChange={onPriorityChange}
                  onBlur={() => setPriority((p) => (p === "" ? 0 : Math.max(0, Math.floor(Number(p) || 0))))}
                  disabled={saving || deleting}
                />
              </div>
            </div>

            {/* ปุ่ม */}
            <div className="actions" style={{ gap: 10, flexWrap: "wrap" }}>
              <button className="btn-primary" type="submit" disabled={saving || deleting}>
                {saving ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກ"}
              </button>
              <Link className="btn-secondary" to="/brands" aria-disabled={saving || deleting} style={{ pointerEvents: (saving || deleting) ? "none" : "auto", opacity: (saving || deleting) ? .6 : 1 }}>
                ຍົກເລີກ
              </Link>

              <button
                type="button"
                className="btn-thridary"
                onClick={onDeleteBrand}
                disabled={deleting || saving}
                style={{ background: "#ef4444", color: "#fff", marginLeft: "20px" }}
                title="ລຶບແບຣນ"
              >
                {deleting ? "ກຳລັງລຶບ..." : "ລຶບແບຣນ"}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
