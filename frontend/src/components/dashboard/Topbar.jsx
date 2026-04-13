import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Topbar({ toggleSidebar }) {
  const { user, logout } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <header className="d-flex align-items-center justify-content-between px-4 py-3 flex-shrink-0"
      style={{ background: "white", borderBottom: "1px solid #f1f5f9", boxShadow: "0 1px 10px rgba(0,0,0,0.03)", position: "sticky", top: 0, zIndex: 100 }}>

      {/* Left: hamburger + greeting */}
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn p-2 d-lg-none border-0"
          onClick={toggleSidebar}
          style={{ borderRadius: "10px", background: "#f8fafc" }}
        >
          <i className="bi bi-list fs-5" style={{ color: "#475569" }}></i>
        </button>
        <div className="d-none d-md-block">
          <h6 className="fw-bold mb-0" style={{ color: "#0f172a", fontSize: "1rem" }}>Dashboard</h6>
          <p className="text-muted mb-0" style={{ fontSize: "0.78rem" }}>
            {greeting}, <span className="fw-semibold" style={{ color: "#2563eb" }}>{user?.name?.split(" ")[0] || "there"}!</span> ☀️
          </p>
        </div>
      </div>

      {/* Right: search + actions */}
      <div className="d-flex align-items-center gap-2 gap-md-3">

        {/* Search */}
        <div className="position-relative d-none d-md-block">
          <i className="bi bi-search position-absolute top-50 translate-middle-y ms-3" style={{ color: "#94a3b8", fontSize: "0.85rem" }}></i>
          <input
            type="text"
            placeholder="Search leads, orders…"
            className="form-control"
            style={{ paddingLeft: "2.25rem", borderRadius: "12px", border: "1.5px solid #f1f5f9", background: "#f8fafc", fontSize: "0.85rem", width: 220, color: "#334155" }}
          />
        </div>

        {/* Add listing shortcut (sellers only) */}
        {user?.role === "seller" && (
          <Link to="/add-listing" className="btn btn-sm fw-semibold d-none d-md-inline-flex align-items-center gap-2"
            style={{ borderRadius: "10px", background: "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "white", border: "none", fontSize: "0.8rem", padding: "0.4rem 0.9rem", boxShadow: "0 4px 10px rgba(37,99,235,0.25)" }}>
            <i className="bi bi-plus-lg"></i> New Listing
          </Link>
        )}

        {/* Notifications */}
        <div className="dropdown">
          <button className="btn p-2 border-0 position-relative" type="button" data-bs-toggle="dropdown"
            style={{ borderRadius: "10px", background: "#f8fafc" }}>
            <i className="bi bi-bell" style={{ color: "#475569", fontSize: "1rem" }}></i>
            <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: "#ef4444", border: "2px solid white" }}></span>
          </button>
          <ul className="dropdown-menu dropdown-menu-end border-0 shadow p-2 mt-2" style={{ borderRadius: "16px", minWidth: 300 }}>
            <li className="px-2 pb-2 border-bottom mb-2">
              <span className="fw-bold" style={{ fontSize: "0.875rem", color: "#0f172a" }}>Notifications</span>
            </li>
            {[
              { icon: "bi-envelope-fill", color: "#2563eb", bg: "#eff6ff", text: "Apex Gases sent a new inquiry.", time: "1hr ago" },
              { icon: "bi-check-circle-fill", color: "#16a34a", bg: "#f0fdf4", text: "Order #4421 was approved.", time: "3hr ago" },
            ].map((n, i) => (
              <li key={i}>
                <a href="#" className="dropdown-item d-flex align-items-start gap-3 py-2 px-2" style={{ borderRadius: "10px" }}>
                  <div style={{ width: 34, height: 34, borderRadius: "10px", background: n.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className={`bi ${n.icon}`} style={{ color: n.color, fontSize: "0.9rem" }}></i>
                  </div>
                  <div>
                    <p className="mb-0 fw-medium" style={{ fontSize: "0.82rem", color: "#1e293b" }}>{n.text}</p>
                    <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{n.time}</span>
                  </div>
                </a>
              </li>
            ))}
            <li className="border-top mt-2 pt-2">
              <a href="#" className="dropdown-item text-center fw-semibold" style={{ fontSize: "0.8rem", color: "#2563eb", borderRadius: "8px" }}>
                View all notifications
              </a>
            </li>
          </ul>
        </div>

        {/* Avatar dropdown */}
        <div className="dropdown">
          <button className="btn p-1 border-0 d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown"
            style={{ borderRadius: "12px", border: "1.5px solid #f1f5f9 !important", background: "#f8fafc" }}>
            <div style={{ width: 34, height: 34, borderRadius: "10px", background: "linear-gradient(135deg,#2563eb,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "white", fontSize: "0.85rem" }}>
              {(user?.name || "U")[0].toUpperCase()}
            </div>
            <i className="bi bi-chevron-down d-none d-md-block" style={{ color: "#94a3b8", fontSize: "0.7rem" }}></i>
          </button>
          <ul className="dropdown-menu dropdown-menu-end border-0 shadow p-2 mt-2" style={{ borderRadius: "16px", minWidth: 200 }}>
            <li className="px-2 pb-2 border-bottom mb-2">
              <div className="fw-semibold" style={{ fontSize: "0.875rem", color: "#0f172a" }}>{user?.name}</div>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{user?.email}</div>
            </li>
            <li>
              <Link to="/marketplace" className="dropdown-item d-flex align-items-center gap-2 py-2" style={{ borderRadius: "8px", fontSize: "0.85rem" }}>
                <i className="bi bi-shop" style={{ color: "#2563eb" }}></i> Marketplace
              </Link>
            </li>
            <li><hr className="dropdown-divider my-1" /></li>
            <li>
              <button onClick={logout} className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger" style={{ borderRadius: "8px", fontSize: "0.85rem" }}>
                <i className="bi bi-box-arrow-right"></i> Log out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
