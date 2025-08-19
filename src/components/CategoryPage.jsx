import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/category.css";
import {
  listCategories,
  deleteCategory,
} from "../api/categories";
import { listWarehouses } from "../api/warehouses";

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
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

              <button type="button" className="btn btn-edit" >
                <Link to={`/categories/${cat.id}/edit`} title="ແກ້ໄຂ">
                ແກ້ໄຂ
                </Link>
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
    </div>
  );
};

export default CategoryPage;
