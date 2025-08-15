import React, { useState } from "react";
import { RiSearch2Line } from "react-icons/ri";
import { IoMdArrowDropdown } from "react-icons/io";
import { FaArrowRightLong } from "react-icons/fa6";
import "../styles/home.css"; // หรือไฟล์ CSS ที่คุณใช้

export default function AgentReportPage() {
  const [startDate, setStartDate] = useState("2025-08-01");
  const [endDate, setEndDate] = useState("2025-08-06");
  const [agent, setAgent] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = () => {
    setResults([]);
  };

  return (
<div className="flex w-full overflow-x-auto">
  <main className={`main p-6`}>
    {/* ...content */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">ລາຍງານຜົນປະກອບການຕາມຕົວແທນລະດັບທີ່ 1</h2>
        </div>
        {/* Filters */}
        <div className="filter-row mb-6">
          <div className="filter-group">
            <label>ວັນທີ່</label>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <span className="arrow-icon"><FaArrowRightLong /></span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="filter-group">
            <label>Agents</label>
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="ຄົ້ນຫາຈາກ Agent"
                value={agent}
                onChange={(e) => setAgent(e.target.value)}
                className="input-with-icon"
              />
              <IoMdArrowDropdown className="dropdown-icon" />
            </div>
          </div>

          <div className="filter-button">
            <button onClick={handleSearch}>
              <span className="search-icon"><RiSearch2Line /></span>
              ຄົ້ນຫາ
            </button>
          </div>
        </div>

        {/* Results */}
        <table className="w-full border">
          <thead className="bg-gray-200 text-left">
            <tr>
              <th className="p-2">Path ID</th>
              <th className="p-2">ຊື່ຕົວແທນ</th>
              <th className="p-2">ຈຳນວນການສັ່ງຊື້</th>
              <th className="p-2">ຍອດທີ່ຕົວແທນຕ້ອງຊຳລະ</th>
              <th className="p-2">ກຳໄລທີ່ທ່ານຈະໄດ້ຮັບ</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr><td colSpan="5" className="text-center p-4">ບໍ່ພົບຜົນການຄົ້ນຫາ</td></tr>
            ) : (
              results.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="p-2">{item.pathId}</td>
                  <td className="p-2">{item.agentName}</td>
                  <td className="p-2">{item.orderCount}</td>
                  <td className="p-2">{item.amountDue}</td>
                  <td className="p-2">{item.profit}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </main>
    </div>
  );
}