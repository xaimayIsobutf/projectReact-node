import React, { useState, useCallback } from "react";
import Navbar from "../components/navbar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const setOpen = useCallback((next) => {
    setSidebarOpen(prev => (typeof next === "function" ? next(prev) : !!next));
  }, []);

  return (
    <>
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setOpen} />
      {/* push content down if navbar is fixed */}
      <main className={`main p-6 ${sidebarOpen ? "shifted" : ""}`} >
        <Outlet />
      </main>
    </>
  );
}
