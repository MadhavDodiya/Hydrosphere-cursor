import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./Navbar.css";

const navLinkClass = ({ isActive }) => `nav-link hs-nav-link ${isActive ? "active" : ""}`;

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [expanded, setExpanded] = useState(false);

  const close = () => setExpanded(false);

  return (
    <header className="sticky-top bg-white border-bottom hs-nav">
      <nav className="navbar navbar-expand-lg navbar-light">
        <div className="container">
          <Link to="/" className="navbar-brand fw-bold hs-brand" onClick={close}>
            HydroSphere
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            aria-controls="hsNav"
            aria-expanded={expanded}
            aria-label={expanded ? "Close navigation" : "Open navigation"}
            onClick={() => setExpanded((v) => !v)}
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className={`collapse navbar-collapse ${expanded ? "show" : ""}`} id="hsNav">
            <ul className="navbar-nav mx-lg-auto mb-3 mb-lg-0 align-items-lg-center gap-lg-2 text-center text-lg-start">
              <li className="nav-item">
                <NavLink to="/" end className={navLinkClass} onClick={close}>
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/marketplace" className={navLinkClass} onClick={close}>
                  Marketplace
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/#about" className={navLinkClass} onClick={close}>
                  About
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/#contact" className={navLinkClass} onClick={close}>
                  Contact
                </NavLink>
              </li>
            </ul>

            <div className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center gap-2">
              {!isAuthenticated ? (
                <>
                  <NavLink to="/login" className="btn btn-link text-decoration-none hs-login" onClick={close}>
                    Login
                  </NavLink>
                  <NavLink to="/signup" className="btn btn-primary px-3" onClick={close}>
                    Sign Up
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/dashboard" className="btn btn-outline-primary fw-medium" onClick={close}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/add-listing" className="btn btn-primary px-3 fw-medium" onClick={close}>
                    <i className="bi bi-plus-circle pe-2"></i> Add Listing
                  </NavLink>
                  <div className="dropdown ms-lg-2 mt-2 mt-lg-0">
                    <button className="btn btn-light dropdown-toggle d-flex align-items-center gap-2 w-100" type="button" data-bs-toggle="dropdown">
                       <span className="small fw-medium text-dark">{user?.name || user?.email}</span>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                       <li>
                         <button
                           className="dropdown-item text-danger small"
                           onClick={() => {
                             close();
                             logout();
                           }}
                         >
                           Log out
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
