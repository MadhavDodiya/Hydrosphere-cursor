import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./Navbar.css";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const navigate = useNavigate();
  const dropRef = useRef(null);

  const close = () => { setMenuOpen(false); setDropOpen(false); };
  const handleLogout = () => { close(); logout(); navigate("/"); };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 992) { setMenuOpen(false); setDropOpen(false); } };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const navLinkStyle = ({ isActive }) => ({
    display: "block",
    padding: "0.5rem 0.875rem",
    borderRadius: "10px",
    fontWeight: 500,
    fontSize: "0.9rem",
    color: isActive ? "#2563eb" : "#475569",
    background: isActive ? "rgba(37,99,235,0.1)" : "transparent",
    textDecoration: "none",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  });

  const plainLinkStyle = {
    display: "block",
    padding: "0.5rem 0.875rem",
    borderRadius: "10px",
    fontWeight: 500,
    fontSize: "0.9rem",
    color: "#475569",
    background: "transparent",
    textDecoration: "none",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
    cursor: "pointer",
  };

  return (
    <header className="hs-nav sticky-top">
      <div className="hs-nav-inner hs-container">

        {/* ── Brand ───────────────────────────────────────── */}
        <Link to="/" className="hs-brand" onClick={close}>
          <span className="hs-brand-icon">H</span>
          HydroSphere
        </Link>

        {/* ── Desktop Links (hidden on mobile) ────────────── */}
        <nav className="hs-desktop-nav">
          <NavLink to="/" end style={navLinkStyle}>Home</NavLink>
          <NavLink to="/marketplace" style={navLinkStyle}>Marketplace</NavLink>
          <NavLink to="/pricing" style={navLinkStyle}>Pricing</NavLink>
          <NavLink to="/about" style={navLinkStyle}>About</NavLink>
          <NavLink to="/contact" style={navLinkStyle}>Contact</NavLink>
        </nav>

        {/* ── Desktop Auth (hidden on mobile) ─────────────── */}
        <div className="hs-desktop-auth">
          {!isAuthenticated ? (
            <>
              <NavLink to="/login" className="hs-btn-ghost" onClick={close}>Log in</NavLink>
              <NavLink to="/signup" className="hs-btn-primary" onClick={close}>
                Get Started <i className="bi bi-arrow-right ms-1" />
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/dashboard" className="hs-btn-outline" onClick={close}>
                <i className="bi bi-columns-gap me-1" />Dashboard
              </NavLink>

              {/* User dropdown */}
              <div className="hs-user-menu" ref={dropRef}>
                <button className="hs-user-btn" onClick={() => setDropOpen(v => !v)}>
                  <span className="hs-avatar">{(user?.name || user?.email || "U")[0].toUpperCase()}</span>
                  <span className="hs-user-name">{user?.name || user?.email}</span>
                  <i className={`bi bi-chevron-${dropOpen ? "up" : "down"} hs-chevron`} />
                </button>

                {dropOpen && (
                  <div className="hs-dropdown">
                    <div className="hs-dropdown-header">
                      <div className="hs-dropdown-name">{user?.name}</div>
                      <div className="hs-dropdown-email">{user?.email}</div>
                      <span className="hs-role-badge" data-role={user?.role}>{user?.role}</span>
                    </div>
                    <div className="hs-dropdown-divider" />
                    <NavLink to="/dashboard" className="hs-dropdown-item" onClick={close}>
                      <i className="bi bi-speedometer2" /> Dashboard
                    </NavLink>
                    {user?.role === "admin" && (
                      <NavLink to="/admin" className="hs-dropdown-item" onClick={close}>
                        <i className="bi bi-shield-lock-fill text-danger" /> Admin Panel
                      </NavLink>
                    )}
                    {user?.role === "seller" && (
                      <NavLink to="/add-listing" className="hs-dropdown-item" onClick={close}>
                        <i className="bi bi-plus-circle" /> Add Listing
                      </NavLink>
                    )}
                    <div className="hs-dropdown-divider" />
                    <button className="hs-dropdown-item danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right" /> Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Hamburger (mobile only) ───────────────────── */}
        <button
          className="hs-hamburger-btn"
          onClick={() => setMenuOpen(v => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          <span className={`hs-hamburger ${menuOpen ? "open" : ""}`}>
            <span /><span /><span />
          </span>
        </button>
      </div>

      {/* ── Mobile Menu ──────────────────────────────────── */}
      {menuOpen && (
        <div className="hs-mobile-menu">
          <nav className="hs-mobile-nav">
            <NavLink to="/" end style={navLinkStyle} onClick={close}>Home</NavLink>
            <NavLink to="/marketplace" style={navLinkStyle} onClick={close}>Marketplace</NavLink>
            <NavLink to="/pricing" style={navLinkStyle} onClick={close}>Pricing</NavLink>
            <NavLink to="/about" style={navLinkStyle} onClick={close}>About</NavLink>
            <NavLink to="/contact" style={navLinkStyle} onClick={close}>Contact</NavLink>
          </nav>

          <div className="hs-mobile-divider" />

          <div className="hs-mobile-auth">
            {!isAuthenticated ? (
              <>
                <NavLink to="/login" className="hs-mobile-btn-ghost" onClick={close}>Log in</NavLink>
                <NavLink to="/signup" className="hs-mobile-btn-primary" onClick={close}>
                  Get Started <i className="bi bi-arrow-right ms-1" />
                </NavLink>
              </>
            ) : (
              <>
                <div className="hs-mobile-user">
                  <span className="hs-avatar">{(user?.name || "U")[0].toUpperCase()}</span>
                  <div>
                    <div className="hs-mobile-user-name">{user?.name}</div>
                    <div className="hs-mobile-user-email">{user?.email}</div>
                  </div>
                  <span className="hs-role-badge ms-auto" data-role={user?.role}>{user?.role}</span>
                </div>
                <NavLink to="/dashboard" className="hs-mobile-btn-outline" onClick={close}>
                  <i className="bi bi-columns-gap me-2" />Dashboard
                </NavLink>
                {user?.role === "seller" && (
                  <NavLink to="/add-listing" className="hs-mobile-btn-outline" onClick={close}>
                    <i className="bi bi-plus-circle me-2" />Add Listing
                  </NavLink>
                )}
                <button className="hs-mobile-btn-danger" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2" />Log out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
