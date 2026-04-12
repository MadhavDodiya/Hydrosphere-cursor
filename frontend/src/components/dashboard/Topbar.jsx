import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Topbar({ toggleSidebar }) {
  const { user, logout } = useAuth();
  return (
    <nav className="navbar navbar-expand bg-white border-bottom px-3 py-2 sticky-top m-0 shadow-sm">
      <div className="d-flex align-items-center gap-3">
        <button className="btn btn-light d-lg-none" onClick={toggleSidebar}>
          <i className="bi bi-list fs-4"></i>
        </button>
        <h4 className="fw-bold mb-0 d-none d-md-block text-dark">Dashboard</h4>
      </div>

      <div className="ms-auto d-flex align-items-center gap-3">
        {/* Search */}
        <div className="position-relative d-none d-md-block" style={{ width: "250px" }}>
          <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
          <input 
            type="text" 
            className="form-control form-control-sm rounded-pill ps-5 bg-light border-0 py-2" 
            placeholder="Search leads or orders..." 
          />
        </div>

        {/* Notifications Dropdown */}
        <div className="dropdown">
          <button className="btn btn-light rounded-circle position-relative p-2" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            <i className="bi bi-bell"></i>
            <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
              <span className="visually-hidden">New alerts</span>
            </span>
          </button>
          <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-2" style={{ width: "300px" }}>
            <li><h6 className="dropdown-header fw-bold">Notifications</h6></li>
            <li><a className="dropdown-item py-2 small" href="#"><span className="fw-medium text-dark">Apex Gases</span> sent a new inquiry.</a></li>
            <li><a className="dropdown-item py-2 small" href="#"><span className="fw-medium text-dark">Order #4421</span> was approved.</a></li>
            <li><hr className="dropdown-divider" /></li>
            <li><a className="dropdown-item text-center text-primary small fw-medium" href="#">View all notifications</a></li>
          </ul>
        </div>

        {/* Profile Dropdown */}
        <div className="dropdown">
          <button className="btn btn-light dropdown-toggle d-flex align-items-center gap-2 p-1 pe-2 rounded-pill bg-white border" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{width: 32, height: 32}}>
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <span className="d-none d-md-block small fw-medium text-dark">{user?.name || user?.email}</span>
          </button>
          <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-2">
            <li><a className="dropdown-item small" href="#"><i className="bi bi-person pe-2"></i>My Profile</a></li>
            <li><a className="dropdown-item small" href="#"><i className="bi bi-gear pe-2"></i>Settings</a></li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button 
                className="dropdown-item small text-danger btn btn-link text-decoration-none" 
                onClick={() => logout()}
              >
                <i className="bi bi-box-arrow-right pe-2"></i>Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
