import React, { useEffect, useState } from "react";
import { createProductApi } from "../../api/products";
import { fetchCategoriesApi } from "../../api/categories";
import { fetchBrandsApi } from "../../api/brands";
import "../../styles/product.css";
import { useNavigate, Link } from "react-router-dom";

const AddProductPage = () => {
  const navigate = useNavigate?.() ?? null;

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    product_type: "main",             // main | sub
    has_variant: "no",                // no | yes
    category_id: "",
    brand_id: "",
    name_lo: "",
    quantity: "",
    reserved_qty: "",
    unit: "ລາຍການ",

    cost: "",
    slug: "",
    rating: "",
    badge_text_lo: "",
    badge_color: "",

    short_desc: "",
    detail_html: ""
  });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [cats, brs] = await Promise.all([
          fetchCategoriesApi(),
          fetchBrandsApi().catch(() => []),
        ]);
        setCategories(cats || []);
        setBrands(brs || []);
      } catch (e) {
        setErr(e.message || "ດາວໂຫຼດຂໍ້ມູນບໍ່ສຳເລັດ");
      }
    })();
  }, []);

  useEffect(() => {
    if (!imageFile) { setPreview(null); return; }
    const url = URL.createObjectURL(imageFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const canSubmit = form.category_id && form.name_lo;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || saving) return;
    setSaving(true);
    setErr("");
    try {
      const payload = {
        ...form,
        quantity: form.quantity === "" ? null : Number(form.quantity),
        reserved_qty: form.reserved_qty === "" ? null : Number(form.reserved_qty),
        rating: form.rating === "" ? null : Number(form.rating),
      };
      if (imageFile) payload.image = imageFile; // field name 'image' (multer single('image'))

      await createProductApi(payload);
      if (navigate) navigate("/products");
      else {
        alert("ເພີ່ມສິນຄ້າສຳເລັດ");
        // reset form
        setForm((s) => ({ ...s, name_lo: "", slug: "", short_desc: "", detail_html: "" }));
        setImageFile(null);
      }
    } catch (e2) {
      setErr(e2.message || "ບັນທຶກບໍ່ສຳເລັດ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="product-add-page">
      <p className="link-back"><Link to="/products" className="Origin-G">ສິນຄ້າ</Link>/ເພິ່ມສິນຄ້າ</p>
      <div className="card">
        <div className="card__header">
          <h2>ເພີ່ມສິນຄ້າ</h2>
        </div>

        <form className="pad-16" onSubmit={handleSubmit}>
          {/* แถวบน */}
          <div className="grid-3">
            <div className="field">
              <label>ປະເພດສິນຄ້າ</label>
              <div className="radio-row">
                <label><input type="radio" name="product_type"
                  value="main" checked={form.product_type==="main"} onChange={handleChange}/> ສິນຄ້າຫຼັກ</label>
                <label><input type="radio" name="product_type"
                  value="sub" checked={form.product_type==="sub"} onChange={handleChange}/> ສິນຄ້າຍ່ອຍ</label>
              </div>
            </div>

            <div className="field">
              <label>ປະເພດສິນຄ້າ <span className="req">*</span></label>
              <select name="category_id" value={form.category_id} onChange={handleChange} required>
                <option value="">– ເລືອກ –</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name_lo || c.name_en || c.name}</option>)}
              </select>
            </div>

            <div className="field">
              <label>ແບຮນ</label>
              <select name="brand_id" value={form.brand_id} onChange={handleChange}>
                <option value="">ບໍ່ລະບຸ</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name_lo || b.name_en || b.name}</option>)}
              </select>
            </div>

            <div className="field col-2">
              <label>ຊື່ສິນຄ້າ<span className="req">*</span></label>
              <input name="name_lo" value={form.name_lo} onChange={handleChange} placeholder="ເຊັ່ນເທິງກ່ອງ UHT 200ml" required/>
            </div>

            <div className="field">
              <label>ຈຳນວນຂອງສິນຄ້າ</label>
              <input name="unit" value={form.unit} onChange={handleChange} />
            </div>

            <div className="field">
              <label>ຈຳນວນ</label>
              <input type="number" name="quantity" value={form.quantity} onChange={handleChange}/>
            </div>

            <div className="field">
              <label>ຈຳນວນທີ່ກັນໄວ້</label>
              <input type="number" name="reserved_qty" value={form.reserved_qty} onChange={handleChange}/>
            </div>

            <div className="field">
              <label>ຮູບແບບສິນຄ້າຍ່ອຍ</label>
              <div className="radio-row">
                <label><input type="radio" name="has_variant" value="no"
                  checked={form.has_variant==="no"} onChange={handleChange}/> ບໍ່ມີສິນຄ້າຍ່ອຍ</label>
                <label><input type="radio" name="has_variant" value="yes"
                  checked={form.has_variant==="yes"} onChange={handleChange}/> ມີສິນຄ້າຍ່ອຍ</label>
              </div>
            </div>
          </div>

          {/* แท็บ: รายละเอียด */}
          <div className="tabs">
            <button type="button" className="tab active">ລາຍລະອຽດສິນຄ້າ</button>
            <button type="button" className="tab" disabled>ໂປຣໂມຊັ່ນ (ໄວໆນີ້)</button>
          </div>

          <div className="grid-4">
            <div className="field">
              <label>ຕົ້ນທຶນ</label>
              <input type="number" step="0.01" name="cost" value={form.cost} onChange={handleChange}/>
            </div>
            <div className="field">
              <label>ຊື່ໃນ URL</label>
              <input name="slug" value={form.slug} onChange={handleChange} placeholder="เช่น uht-milk-200ml"/>
            </div>
            <div className="field">
              <label>Rating</label>
              <input type="number" step="0.1" name="rating" value={form.rating} onChange={handleChange}/>
            </div>
            <div className="field">
              <label>Badge ພາສາລາວ</label>
              <input name="badge_text_lo" value={form.badge_text_lo} onChange={handleChange}/>
            </div>
            <div className="field">
              <label>ສີ Badge</label>
              <select name="badge_color" value={form.badge_color} onChange={handleChange}>
                <option value="">ບໍ່ມີ</option>
                <option value="#22c55e">ຂຽວ</option>
                <option value="#3b82f6">ຟ້າ</option>
                <option value="#f59e0b">ສົ້ມ</option>
                <option value="#ef4444">ແດງ</option>
                <option value="#6b7280">เทา</option>
              </select>
            </div>
            <div className="field col-2">
              <label>ຄຳອະທິບາຍໂດຍຫຍໍ້</label>
              <input name="short_desc" value={form.short_desc} onChange={handleChange}/>
            </div>
          </div>

          {/* อัปโหลดรูป */}
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
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          {/* รายละเอียดตัวเต็ม */}
          <div className="field">
            <label>ລາຍລະອຽດສິນຄ້າ</label>
            <textarea
              rows={6}
              name="detail_html"
              value={form.detail_html}
              onChange={handleChange}
              placeholder="ລາຍລະອຽດ/ວິທີໃຊ້/ສ່ວນປະກອບອື່ນໆ"
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
              onClick={() => (navigate ? navigate(-1) : window.history.back())}
            >
              ຍົກເລີກ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductPage;