import React, { useEffect, useState } from 'react';
import { fetchProductsApi } from '../api/products';
import { listCategories } from '../api/categories';
import { IoTimeOutline, IoAdd,IoSearch } from "react-icons/io5";
import '../styles/product.css';
import { Link } from 'react-router-dom';


const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  //const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const [p, c] = await Promise.all([
          fetchProductsApi(),
          listCategories(), // <-- use this instead of fetchCategoriesApi
        ]);
        setProducts(p || []);
        setCategories(c || []);
      } catch (error) {
        console.error('Initial load error:', error);
      }
    })();
  }, []);

  const filteredProducts = products.filter((p) => {
    const nameLo = (p.name_lo || '').toLowerCase();
    const nameEn = (p.name_en || '').toLowerCase();
    const q = search.toLowerCase();

    const matchText = nameLo.includes(q) || nameEn.includes(q);
    const matchCategory =
      selectedCategory === '' || p.category_id === Number(selectedCategory);

    return matchText && matchCategory;
  });

  return (
    <div className="product-page">
       <h2>ລາຍການສິນຄ້າ (ເຫັນ {filteredProducts.length} ລາຍການ)</h2>

  <div className="filter-row">
    <input
      type="text"
      placeholder="ຄົ້ນຫາຊື່ສິນຄ້າ..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
    <select
      value={selectedCategory}
      onChange={(e) => setSelectedCategory(e.target.value)}
    >
      <option value="">ເລືອກທັງໝົດ</option>
      {categories.map((cat) => (
        <option key={cat.id} value={cat.id}>{cat.name_lo}</option>
      ))}
    </select>
  </div>

  {/* แถบปุ่มเหนือหัวตาราง */}
  <div className="table-actions">
    <button
      className="btnt btn--search"
      onClick={() => {/* ถ้าต้องการ trigger ค้นหาแบบ manual ก็ใส่โค้ดที่นี่ */}}
    >
      <IoSearch className="icon" />
      <span>ຄົ້ນຫາ</span>
    </button>
    <button
      className="btnt btn--secondary"
      onClick={() => alert("TODO: ไปหน้า/โมดัลรายการที่ถูกลบ")}
    >
      <IoTimeOutline className="icon" />
      <span>ທີ່ຖືກລົບ</span>
    </button>

    <Link to="/products/new" className="btnt btn--primary">
      <IoAdd className="icon" />
      <span>ເພີ່ມ</span>
    </Link>
  </div>
      <table className="product-table">
        <thead>
          <tr>
            <th>#</th>
            <th>ຮູບສິນຄ້າ</th>
            <th>ຊື່ສິນຄ້າ</th>
            <th>ໝວດໝູ່</th>
            <th>🕵️‍♀️</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((prod, index) => (
            <tr key={prod.id}>
              <td>{index + 1}</td>
              <td>-</td>
              <td>{prod.name_lo}</td>
              <td>{prod.category_name || '-'}</td>
              <td>
                <button className="detail-btn">🔍</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductPage;
