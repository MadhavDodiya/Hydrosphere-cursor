import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./Navbar.css";

const navLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/marketplace", label: "Marketplace" },
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const close = () => setExpanded(false);
  const handleLogout = () => { close(); logout(); navigate("/"); };

  const navLinkClass = ({ isActive }) =>
    `nav-link hs-nav-link${isActive ? " active" : ""}`;

  return (
    <header className="sticky-top hs-nav">
      <nav className="navbar navbar-expand-lg navbar-light">
        <div className="container">
          {/* Brand */}
          <Link to="/" className="navbar-brand hs-brand" onClick={close}>
            <span className="hs-brand-icon">H</span>
            HydroSphere
          </Link>

          {/* Mobile toggler */}
          <button
            className="navbar-toggler border-0 shadow-none hs-toggler"
            type="button"
            aria-controls="hsNav"
            aria-expanded={expanded}
            aria-label={expanded ? "Close navigation" : "Open navigation"}
            onClick={() => setExpanded(v => !v)}
          >
            <span className={`hs-hamburger ${expanded ? "open" : ""}`}>
              <span></span><span></span><span></span>
            </span>
          </button>

          {/* Collapse */}
          <div className={`collapse navbar-collapse ${expanded ? "show" : ""}`} id="hsNav">
            {/* Nav links */}
            <ul className="navbar-nav mx-lg-auto mb-3 mb-lg-0 align-items-lg-center gap-lg-1">
              {navLinks.map(l => (
                <li className="nav-item" key={l.to}>
                  <NavLink to={l.to} end={l.end} className={navLinkClass} onClick={close}>
                    {l.label}
                  </NavLink>
                </li>
              ))}
              <li className="nav-item">
                <a href="/#about" className="nav-link hs-nav-link" onClick={close}>About</a>
              </li>
              <li className="nav-item">
                <a href="/#contact" className="nav-link hs-nav-link" onClick={close}>Contact</a>
              </li>
            </ul>

            {/* Auth buttons */}
            <div className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center gap-2 mt-3 mt-lg-0">
              {!isAuthenticated ? (
                <>
                  <NavLink to="/login" className="btn hs-btn-ghost" onClick={close}>
                    Log in
                  </NavLink>
                  <NavLink to="/signup" className="btn hs-btn-primary" onClick={close}>
                    Get Started <i className="bi bi-arrow-right ms-1"></i>
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/marketplace" className="btn hs-btn-ghost" onClick={close}>
                    <i className="bi bi-grid me-1"></i> Marketplace
                  </NavLink>
                  <NavLink to="/dashboard" className="btn hs-btn-outline" onClick={close}>
                    <i className="bi bi-columns-gap me-1"></i> Dashboard
                  </NavLink>
                  {/* User menu */}
                  <div className="dropdown ms-lg-1">
                    <button
                      className="btn hs-user-btn dropdown-toggle"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <span className="hs-avatar">{(user?.name || user?.email || "U")[0].toUpperCase()}</span>
                      <span className="d-none d-lg-inline small fw-semibold">{user?.name || user?.email}</span>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end hs-dropdown shadow border-0 mt-2">
                      <li className="px-3 py-2">
                        <div className="fw-semibold text-dark" style={{ fontSize: "0.875rem" }}>{user?.name}</div>
                        <div className="text-muted" style={{ fontSize: "0.75rem" }}>{user?.email}</div>
                        <span className="badge mt-1" style={{ background: user?.role === "seller" ? "#dcfce7" : "#dbeafe", color: user?.role === "seller" ? "#16a34a" : "#2563eb", fontSize: "0.7rem" }}>
                          {user?.role}
                        </span>
                      </li>
                      <li><hr className="dropdown-divider my-1" /></li>
                      <li>
                        <NavLink to="/dashboard" className="dropdown-item d-flex align-items-center gap-2 py-2" onClick={close}>
                          <i className="bi bi-speedometer2"></i> Dashboard
                        </NavLink>
                      </li>
                      {user?.role === "seller" && (
                        <li>
                          <NavLink to="/add-listing" className="dropdown-item d-flex align-items-center gap-2 py-2" onClick={close}>
                            <i className="bi bi-plus-circle"></i> Add Listing
                          </NavLink>
                        </li>
                      )}
                      <li><hr className="dropdown-divider my-1" /></li>
                      <li>
                        <button className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger" onClick={handleLogout}>
                          <i className="bi bi-box-arrow-right"></i> Log out
                        </button>
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
