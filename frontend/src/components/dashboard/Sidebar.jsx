import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Sidebar({ mobileOpen, closeMobileSidebar, stats }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const sellerMenu = [
    { name: "Supplier Dashboard", icon: "bi-grid-1x2-fill",  link: "/dashboard" },
    { name: "My Listings",      icon: "bi-card-list",       link: "/dashboard/my-listings" },
    { name: "Leads Received",   icon: "bi-inbox-fill",      link: "/dashboard/leads", badge: stats?.newLeadsToday },
    { name: "Billing",          icon: "bi-credit-card-fill", link: "/dashboard/billing" },
    { name: "Add Listing",      icon: "bi-plus-square-fill",link: "/add-listing" },
    { name: "Marketplace",      icon: "bi-shop",            link: "/marketplace" },
  ];

  const buyerMenu = [
    { name: "Buyer Dashboard", icon: "bi-grid-1x2-fill",  link: "/dashboard" },
    { name: "My Inquiries",    icon: "bi-chat-dots-fill",  link: "/dashboard/inquiries" },
    { name: "Saved Listings",  icon: "bi-bookmark-heart-fill", link: "/dashboard/saved", badge: stats?.totalSaved },
    { name: "Marketplace",     icon: "bi-shop",            link: "/marketplace" },
  ];

  const menuItems = user?.role === "seller" ? sellerMenu : buyerMenu;

  return (
    <>
      {/* Overlay */}
      {mobileOpen && (
        <div
          onClick={closeMobileSidebar}
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 1039, backdropFilter: "blur(4px)" }}
          className="d-lg-none"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`dashboard-sidebar ${mobileOpen ? "mobile-open" : ""} d-flex flex-column`}
        style={{
          background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
          borderRight: "none",
          position: "fixed",
          top: 0, left: 0, bottom: 0,
          width: 260,
          zIndex: 1040,
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
          transform: mobileOpen ? "translateX(0)" : undefined,
        }}
      >
        {/* Logo */}
        <div className="d-flex align-items-center justify-content-between px-4 py-4 flex-shrink-0">
          <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none" onClick={closeMobileSidebar}>
            <div style={{ width: 34, height: 34, borderRadius: "10px", background: "linear-gradient(135deg,#3b82f6,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "white", fontSize: "1rem", boxShadow: "0 4px 12px rgba(59,130,246,0.4)" }}>
              H
            </div>
            <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "white", letterSpacing: "-0.02em" }}>HydroSphere</span>
          </Link>
          <button className="btn p-0 border-0 d-lg-none" onClick={closeMobileSidebar}>
            <i className="bi bi-x-lg" style={{ color: "rgba(255,255,255,0.5)", fontSize: "1rem" }}></i>
          </button>
        </div>

        {/* User Profile */}
        <div className="mx-3 mb-4 p-3" style={{ background: "rgba(255,255,255,0.05)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="d-flex align-items-center gap-3">
            <div style={{ width: 38, height: 38, borderRadius: "10px", background: "linear-gradient(135deg,#3b82f6,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "white", fontSize: "0.9rem", flexShrink: 0 }}>
              {(user?.name || "U")[0].toUpperCase()}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div className="fw-semibold text-truncate" style={{ fontSize: "0.875rem", color: "white" }}>{user?.name || "User"}</div>
              <div className="text-truncate" style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)" }}>{user?.email}</div>
            </div>
          </div>
          <div className="mt-2">
            <span style={{ fontSize: "0.7rem", fontWeight: 600, padding: "3px 10px", borderRadius: "20px", background: user?.role === "seller" ? "rgba(34,197,94,0.2)" : "rgba(59,130,246,0.2)", color: user?.role === "seller" ? "#86efac" : "#93c5fd", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {user?.role === "seller" ? "SUPPLIER" : "BUYER"}
            </span>
            {user?.role === "seller" && (
              <span
                className="ms-2"
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: "20px",
                  background: "rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.8)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {String(user?.plan || "free").replace("_", " ")}
              </span>
            )}
          </div>
        </div>

        {/* Nav */}
        <div className="flex-fill px-3 overflow-auto">
          <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", padding: "0 0.5rem", marginBottom: "0.5rem" }}>
            {user?.role === "seller" ? "SUPPLIER PANEL" : "BUYER PANEL"}
          </p>
          <nav className="d-flex flex-column gap-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.link;
              return (
                <Link
                  key={item.name}
                  to={item.link}
                  onClick={closeMobileSidebar}
                  className="d-flex align-items-center gap-3 text-decoration-none"
                  style={{
                    padding: "0.65rem 0.875rem",
                    borderRadius: "10px",
                    transition: "all 0.2s ease",
                    background: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                    color: isActive ? "white" : "rgba(255,255,255,0.55)",
                    fontWeight: isActive ? 600 : 400,
                    fontSize: "0.875rem",
                    borderLeft: isActive ? "3px solid #3b82f6" : "3px solid transparent",
                  }}
                >
                  <i className={`bi ${item.icon}`} style={{ fontSize: "1rem", flexShrink: 0 }}></i>
                  {item.name}
                  {item.badge != null && (
                    <span className="ms-auto" style={{ background: "#3b82f6", color: "white", fontSize: "0.65rem", fontWeight: 700, padding: "2px 7px", borderRadius: "20px" }}>{item.badge}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom */}
        <div className="p-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            onClick={logout}
            className="btn w-100 d-flex align-items-center gap-2 fw-medium"
            style={{ borderRadius: "10px", background: "rgba(239,68,68,0.1)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.2)", fontSize: "0.85rem", padding: "0.55rem" }}
          >
            <i className="bi bi-box-arrow-left"></i> Log out
          </button>
        </div>
      </aside>
    </>
  );
}
