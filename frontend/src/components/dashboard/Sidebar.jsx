import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ mobileOpen, closeMobileSidebar }) {
  const location = useLocation();
  const path = location.pathname;

  const menuItems = [
    { name: "Dashboard", icon: "bi-grid-1x2", link: "/dashboard" },
    { name: "Marketplace", icon: "bi-box", link: "/marketplace" },
    { name: "Orders / Leads", icon: "bi-basket", link: "/dashboard" }, // Can keep as dashboard for now
    { name: "Add Listing", icon: "bi-plus-circle", link: "/add-listing" },
    { name: "Profile", icon: "bi-person", link: "/dashboard" },
  ];

  return (
    <>
      <div className={`dashboard-sidebar ${mobileOpen ? "mobile-open" : ""} d-flex flex-column p-3`}>
        <div className="d-flex align-items-center justify-content-between mb-4 px-2 mt-2">
          <Link to="/" className="text-decoration-none text-dark d-flex align-items-center gap-2">
            <div className="bg-primary text-white rounded d-flex align-items-center justify-content-center fw-bold" style={{width: 32, height: 32}}>
               H
            </div>
            <span className="fs-5 fw-bold">HydroSphere</span>
          </Link>
          <button className="btn-close d-lg-none" onClick={closeMobileSidebar}></button>
        </div>
        
        <div className="nav flex-column nav-pills flex-grow-1">
          <div className="small text-muted fw-semibold mb-2 px-2 text-uppercase" style={{fontSize: "0.75rem"}}>Menu</div>
          {menuItems.map((item, idx) => (
            <Link 
              key={idx} 
              to={item.link} 
              className={`nav-link d-flex align-items-center gap-3 ${path === item.link ? "active" : ""}`}
            >
              <i className={`bi ${item.icon}`}></i> {item.name}
            </Link>
          ))}
        </div>
        
        <div className="mt-auto px-2 mb-3">
          <div className="bg-light p-3 rounded text-center">
            <h6 className="fw-bold text-dark fs-6 mb-1">Upgrade Plan</h6>
            <p className="small text-muted mb-2">Get access to premium leads</p>
            <button className="btn btn-primary btn-sm w-100 fw-medium">View Pricing</button>
          </div>
        </div>
      </div>
      
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark opacity-50 z-index-1030 d-lg-none" style={{zIndex: 1030}} onClick={closeMobileSidebar}></div>
      )}
    </>
  );
}
