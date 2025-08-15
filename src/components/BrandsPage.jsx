import React, { useEffect,useState } from "react";
import { FiEdit2} from "react-icons/fi";
import { IoTimeOutline, IoAdd } from "react-icons/io5";
import { listBrands} from "../api/brands";
import { urlFor } from "../api/client";
import "../styles/brands.css";
import { Link} from "react-router-dom";

export default function BrandsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  

  const fetchRows = async () => {
    setLoading(true);
    setErr("");
    try {
      const data = await listBrands(); // backend is become array
      setRows(Array.isArray(data) ? data : data.items || []);
    } catch (e) {
      setErr(e?.message || "ບໍ່ສາມາດໂຫລດຂໍ້ມູນໄດ້");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRows(); }, []);

  return (
    <div className="main">
      <section className="card">
        <header className="card__header">
          <h2 className="card__title">
            ລາຍການ <span className="muted">(ເຫັນ {rows.length} ລາຍການ)</span>
          </h2>
          <div className="actions-stack">
            <button className="fab fab--secondary" onClick={() => alert("TODO: ไปหน้า/โมดัลถังขยะ")}>
              <IoTimeOutline className="fab__icon" /><span className="fab__label">ທີ່ຖືກລົບ</span>
            </button>
            <button className="fab fab--primary" onClick={ ()=> window.location.href = "/brands/new" }>
              <IoAdd className="fab__icon" /><span className="fab__label">ເພີ່ມ</span>
            </button>
          </div>
        </header>

        <div className="table-wrap">
          {err && <div style={{color:"#c00", padding:"12px 16px"}}>{err}</div>}
          <table className="brand-table">
            <thead>
              <tr>
                <th style={{ minWidth: 60 }}>#</th>
                <th>ຊື່ແບລນ</th>
                <th style={{ minWidth: 220 }}>ຮູບ</th>
                <th style={{ minWidth: 140 }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="empty-cell">ກຳລັງໂຫລດ...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={4} className="empty-cell">ຍັງບໍ່ມີຂໍ້ມູນ</td></tr>
              ) : rows.map((b, i) => (
                <tr key={b.id}>
                  <td className="col-index" data-label=""> {i + 1} </td>

                  <td className="col-name" data-label="ຊື່ແບລນ">
                    <span className="name-ellipsis">{b.name}</span>
                  </td>

                  <td className="col-image" data-label="ຮູບ">
                    {b.imageUrl ? (
                      <img className="brand-img" src={urlFor(b.imageUrl)} alt={b.name} />
                    ) : (<div className="img-placeholder">ບໍ່ມີຮູບ</div>)}
                  </td>

                  <td className="col-actions" data-label="ການຈັດການ">
                    <div className="row-actions">
                      <Link to={`/brands/${b.id}/edit`} className="edit-btn" title="ແກ້ໄຂ">
                        <FiEdit2 />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
