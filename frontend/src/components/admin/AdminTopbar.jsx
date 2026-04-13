import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function AdminTopbar({ toggleSidebar, sectionName = "Admin Overview" }) {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <header className="d-flex align-items-center justify-content-between px-4 py-3 flex-shrink-0"
      style={{ background: "white", borderBottom: "1px solid #f1f5f9", boxShadow: "0 1px 10px rgba(0,0,0,0.03)", position: "sticky", top: 0, zIndex: 100 }}>

      {/* Left: hamburger + section name */}
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn p-2 d-lg-none border-0"
          onClick={toggleSidebar}
          style={{ borderRadius: "10px", background: "#fef2f2" }}
        >
          <i className="bi bi-list fs-5" style={{ color: "#ef4444" }}></i>
        </button>
        <div className="d-none d-md-block">
          <h6 className="fw-bold mb-0" style={{ color: "#0f172a", fontSize: "1rem" }}>{sectionName}</h6>
          <p className="text-muted mb-0" style={{ fontSize: "0.78rem" }}>
            {greeting}, <span className="fw-semibold" style={{ color: "#ef4444" }}>Admin {user?.name?.split(" ")[0] || "there"}!</span> 👋
          </p>
        </div>
      </div>

      {/* Right: profile + quick links */}
      <div className="d-flex align-items-center gap-2 gap-md-3">
        
        {/* Environment Badge */}
        <div className="d-none d-sm-flex align-items-center gap-2 px-3 py-1.5 rounded-pill border border-danger-subtle bg-danger-subtle text-danger" style={{ fontSize: "0.75rem", fontWeight: 700 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block" }}></span>
          PRODUCTION LIVE
        </div>

        {/* Notifications */}
        <div className="dropdown">
          <button className="btn p-2 border-0 position-relative" type="button" data-bs-toggle="dropdown"
            style={{ borderRadius: "10px", background: "#f8fafc" }}>
            <i className="bi bi-bell" style={{ color: "#475569", fontSize: "1rem" }}></i>
            <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: "#ef4444", border: "2px solid white" }}></span>
          </button>
          <ul className="dropdown-menu dropdown-menu-end border-0 shadow py-2 mt-2" style={{ borderRadius: "16px", minWidth: 300 }}>
            <li className="px-3 pb-2 border-bottom mb-2">
              <span className="fw-bold" style={{ fontSize: "0.875rem", color: "#0f172a" }}>System Notifications</span>
            </li>
            <li className="px-3 py-2">
              <span className="text-muted small">All systems operational.</span>
            </li>
          </ul>
        </div>

        {/* Quick Back to User Side Link */}
        <Link to="/" className="btn btn-sm fw-semibold d-none d-md-inline-flex align-items-center gap-2"
          style={{ borderRadius: "10px", background: "#f1f5f9", color: "#475569", border: "none", fontSize: "0.8rem", padding: "0.45rem 0.9rem" }}>
          <i className="bi bi-arrow-left"></i> Home
        </Link>
      </div>
    </header>
  );
}
