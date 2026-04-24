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
      {/* Mobile Bottom Navigation */}
      <div className="fixed-bottom bg-white border-top d-lg-none px-2 py-1 shadow-lg" style={{ zIndex: 1045 }}>
        <div className="d-flex justify-content-around align-items-center">
          {menuItems.slice(0, 4).map((item) => {
            const isActive = location.pathname === item.link;
            return (
              <Link
                key={item.name}
                to={item.link}
                className="d-flex flex-column align-items-center text-decoration-none py-2 px-3"
                style={{
                  color: isActive ? "var(--color-primary-end)" : "#94a3b8",
                  transition: "all 0.2s ease",
                  flex: 1
                }}
              >
                <i className={`bi ${item.icon} fs-4 mb-1`}></i>
                <span style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase" }}>{item.name.split(' ')[0]}</span>
              </Link>
            );
          })}
          <button 
            className="btn d-flex flex-column align-items-center border-0 py-2 px-3"
            onClick={closeMobileSidebar ? () => {} : undefined} // This logic is handled by parent's toggle
            data-bs-toggle="offcanvas" 
            data-bs-target="#dashboardMobileSidebar"
            style={{ color: "#94a3b8", flex: 1 }}
          >
            <i className="bi bi-list fs-4 mb-1"></i>
            <span style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase" }}>Menu</span>
          </button>
        </div>
      </div>

      {/* Desktop Sidebar (Permanent) */}
      <aside
        className="d-none d-lg-flex flex-column"
        style={{
          background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
          position: "fixed",
          top: 0, left: 0, bottom: 0,
          width: 260,
          zIndex: 1040,
        }}
      >
        {/* Logo */}
        <div className="d-flex align-items-center justify-content-between px-4 py-4 flex-shrink-0">
          <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
            <div style={{ width: 34, height: 34, borderRadius: "10px", background: "linear-gradient(135deg,#3b82f6,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "white", fontSize: "1rem", boxShadow: "0 4px 12px rgba(59,130,246,0.4)" }}>
              H
            </div>
            <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "white", letterSpacing: "-0.02em" }}>HydroSphere</span>
          </Link>
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
        </div>

        {/* Nav Items */}
        <div className="flex-fill px-3 overflow-auto">
          <nav className="d-flex flex-column gap-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.link;
              return (
                <Link
                  key={item.name}
                  to={item.link}
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

        {/* Logout Button */}
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

      {/* Mobile Offcanvas Menu */}
      <div className="offcanvas offcanvas-start border-0 d-lg-none" tabIndex="-1" id="dashboardMobileSidebar" style={{ background: "#0f172a", width: "280px" }}>
        <div className="offcanvas-header px-4 pt-4">
          <h5 className="offcanvas-title text-white fw-bold">Menu</h5>
          <button type="button" className="btn-close btn-close-white shadow-none" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body px-3">
          <nav className="d-flex flex-column gap-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.link;
              return (
                <Link
                  key={item.name}
                  to={item.link}
                  data-bs-dismiss="offcanvas"
                  className="d-flex align-items-center gap-3 text-decoration-none"
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "10px",
                    background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                    color: isActive ? "white" : "rgba(255,255,255,0.6)",
                    fontSize: "0.95rem"
                  }}
                >
                  <i className={`bi ${item.icon}`}></i>
                  {item.name}
                </Link>
              );
            })}
            <hr className="my-3 border-secondary border-opacity-25" />
            <button onClick={logout} className="btn text-danger border-0 d-flex align-items-center gap-3 p-2 ps-3 shadow-none">
              <i className="bi bi-box-arrow-left"></i> Log out
            </button>
          </nav>
        </div>
      </div>
    </>
  );
}
