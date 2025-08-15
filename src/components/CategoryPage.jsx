import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/category.css";
import {
  listCategories,
  updateCategory,
  deleteCategory,
} from "../api/categories";
import { listWarehouses } from "../api/warehouses";

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [modalVisible, setModalVisible] = useState(false); // ใช้เฉพาะแก้ไข
  const [formData, setFormData] = useState({
    name_lo: "",
    name_en: "",
    priority: "",
    warehouse_id: "",
  });
  const [isEditMode, setIsEditMode] = useState(false); // true เมื่อแก้ไข
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const warehouseMap = useMemo(() => {
    const m = new Map();
    warehouses.forEach((w) => m.set(String(w.id), w.name || w.title || ""));
    return m;
  }, [warehouses]);

  const fetchAll = async () => {
    setLoading(true);
    setErr("");
    try {
      const [cats, whs] = await Promise.all([listCategories(), listWarehouses()]);
      setCategories(cats);
      setWarehouses(whs);
    } catch (e) {
      setErr(e.message || "ໂຫລດຂໍ້ມູນບໍ່ສຳເລັດ...");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  // ใช้เฉพาะแก้ไข
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!isEditMode || !editingId) return;
    setSaving(true);
    setErr("");
    try {
      await updateCategory(editingId, formData);
      await fetchAll();
      setModalVisible(false);
      setIsEditMode(false);
      setEditingId(null);
    } catch (e) {
      setErr(e.message || "ບໍ່ສາມາດບັນທຶກໄດ້");
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (cat) => {
    setFormData({
      name_lo: cat.name_lo || "",
      name_en: cat.name_en || "",
      priority: cat.priority ?? "",
      warehouse_id: String(cat.warehouse_id || ""),
    });
    setIsEditMode(true);
    setEditingId(cat.id);
    setModalVisible(true);
  };

  const onDelete = async (cat) => {
    if (!window.confirm(`ລຶບໝວດໝູ່ “${cat.name_lo || cat.name_en}” ?`)) return;
    try {
      await deleteCategory(cat.id);
      await fetchAll();
    } catch (e) {
      alert(e.message || "ລຶບບໍ່ສຳເລັດ");
    }
  };

  return (
    <div className="category-page">
      <div className="header-row">
        <h2>ລາຍການໝວດໝູ່ສິນຄ້າ (ເຫັນ {categories.length} ລາຍການ)</h2>
        <Link className="add-btn" to="/categories/new">➕ ເພີ່ມໝວດໝູ່</Link>
      </div>

      {err && (
        <div style={{ color: "#c0392b", marginTop: 8, fontWeight: 600 }}>
          {err}
        </div>
      )}

      <div className="table-wrap">
  <table className="category-table">
    <thead>
      <tr>
        <th>#</th>
        <th>ໝວດໝູ່ຫຼັກ</th>
        <th>ຊື່ພາສາລາວ</th>
        <th>ຊື່ພາສາອັງກິດ</th>
        <th>ລຳດັບຄວາມສຳຄັນ</th>
        <th>ຈຳນວນຂອງສິນຄ້າ</th>
        <th>🛠</th>
      </tr>
    </thead>
    <tbody>
      {loading ? (
        <tr><td colSpan={7} style={{ textAlign: "center", padding: 16 }}>ກຳລັງໂຫລດ...</td></tr>
      ) : categories.length === 0 ? (
        <tr><td colSpan={7} style={{ textAlign: "center", padding: 16 }}>ຍັງບໍ່ມີຂໍ້ມູນ</td></tr>
      ) : (
        categories.map((cat, index) => (
          <tr key={cat.id}>
            <td data-label="#">{index + 1}</td>
            <td data-label="ໝວດໝູ່ຫຼັກ">
              {cat.warehouse_name || warehouseMap.get(String(cat.warehouse_id)) || "-"}
            </td>
            <td data-label="ຊື່ພາສາລາວ">{cat.name_lo}</td>
            <td data-label="ຊື່ພາສາອັງກິດ">{cat.name_en}</td>
            <td data-label="ລຳດັບຄວາມສຳຄັນ">{cat.priority ?? "-"}</td>
            <td data-label="ຈຳນວນຂອງສິນຄ້າ">{cat.product_count ?? "-"}</td>
            <td data-label="ຈັດການ" className="actions">
              <button
                type="button"
                className="btn btn-edit"
                onClick={() => openEditModal(cat)}
                title="ແກ້ໄຂ"
              >
                ແກ້ໄຂ
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => onDelete(cat)}
                title="ລຶບ"
              >
                ລຶບ
              </button>
          </td>
          </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* โมดัลเฉพาะแก้ไข */}
      {modalVisible && isEditMode && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>ແກ້ໄຂໝວດໝູ່ສິນຄ້າ</h3>

            <form onSubmit={handleUpdateSubmit}>
              <input type="text" name="name_lo" placeholder="ຊື່ພາສາລາວ" value={formData.name_lo} onChange={handleChange} required />
              <input type="text" name="name_en" placeholder="ຊື່ພາສາອັງກິດ" value={formData.name_en} onChange={handleChange} required />
              <input type="number" name="priority" placeholder="ລຳດັບຄວາມສຳຄັນ" value={formData.priority} onChange={handleChange} />

              <select name="warehouse_id" value={formData.warehouse_id} onChange={handleChange} required>
                <option value="">-- ເລືອກຄັງສິນຄ້າ --</option>
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>{wh.name}</option>
                ))}
              </select>

              <div className="modal-actions">
                <button type="submit" disabled={saving}>{saving ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກການແກ້ໄຂ"}</button>
                <button type="button" onClick={() => setModalVisible(false)}>ຍົກເລີກ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
