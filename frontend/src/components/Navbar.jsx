import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import NotificationBell from "./NotificationBell.jsx";

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

  const navLinkStyle = ({ isActive }) => `
    px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
    ${isActive ? 'text-[#0071E3] bg-[#0071E3]/10' : 'text-[#86868b] hover:text-[#0071E3]'}
  `;

  return (
    <header className="apple-nav">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* ── Brand ───────────────────────────────────────── */}
        <Link to="/" className="flex items-center gap-2 group transition-transform active:scale-95" onClick={close}>
          <div className="w-8 h-8 bg-[#0071E3] rounded-lg flex items-center justify-center text-white font-black text-lg shadow-sm">
            H
          </div>
          <span className="text-lg font-bold tracking-tight text-[#1d1d1f]">HydroSphere</span>
        </Link>

        {/* ── Desktop Links ───────────────────────────────── */}
        <nav className="hidden lg:flex items-center gap-1">
          <NavLink to="/" end className={navLinkStyle}>Home</NavLink>
          <NavLink to="/marketplace" className={navLinkStyle}>Marketplace</NavLink>
          <NavLink to="/pricing" className={navLinkStyle}>Pricing</NavLink>
          <NavLink to="/about" className={navLinkStyle}>About</NavLink>
          <NavLink to="/contact" className={navLinkStyle}>Contact</NavLink>
        </nav>

        {/* ── Desktop Auth & Actions ──────────────────────── */}
        <div className="hidden lg:flex items-center gap-4">
          {!isAuthenticated ? (
            <>
              <NavLink to="/login" className="text-sm font-medium text-[#1d1d1f] hover:text-[#0071E3] px-4 py-2" onClick={close}>
                Log in
              </NavLink>
              <NavLink to="/free-trial" className="btn-primary" onClick={close}>
                Get Started
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/dashboard" className="px-4 py-2 text-sm font-medium text-[#86868b] hover:text-[#1d1d1f] flex items-center gap-1" onClick={close}>
                <i className="bi bi-grid-fill" />
              </NavLink>

              <NotificationBell user={user} />

              {/* User Dropdown */}
              <div className="relative" ref={dropRef}>
                <button 
                  className="flex items-center gap-2 p-1 pl-3 bg-[#f5f5f7] rounded-full hover:bg-[#e8e8ed] transition-colors"
                  onClick={() => setDropOpen(v => !v)}
                >
                  <span className="text-xs font-bold text-[#86868b] bg-white w-6 h-6 flex items-center justify-center rounded-full border border-black/5">
                    {(user?.name || user?.email || "U")[0].toUpperCase()}
                  </span>
                  <i className={`bi bi-chevron-${dropOpen ? "up" : "down"} text-[10px] text-[#86868b] mr-2`} />
                </button>

                {dropOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white/90 backdrop-blur-xl border border-black/5 rounded-3xl shadow-2xl overflow-hidden animate-apple z-50">
                    <div className="p-5 border-bottom border-black/5">
                      <div className="text-sm font-bold text-[#1d1d1f] truncate">{user?.name}</div>
                      <div className="text-xs text-[#86868b] truncate">{user?.email}</div>
                      <div className="mt-2 inline-block px-2 py-0.5 rounded-full bg-[#f5f5f7] text-[10px] font-black uppercase text-[#86868b]">
                        {user?.role}
                      </div>
                    </div>
                    <div className="p-2">
                      <NavLink to="/dashboard" className="flex items-center gap-3 px-4 py-2 text-sm text-[#1d1d1f] hover:bg-[#0071E3] hover:text-white rounded-2xl transition-colors" onClick={close}>
                        <i className="bi bi-speedometer2" /> Dashboard
                      </NavLink>
                      {user?.role === "admin" && (
                        <NavLink to="/admin" className="flex items-center gap-3 px-4 py-2 text-sm text-[#1d1d1f] hover:bg-red-500 hover:text-white rounded-2xl transition-colors" onClick={close}>
                          <i className="bi bi-shield-lock" /> Admin Panel
                        </NavLink>
                      )}
                      <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-2xl transition-colors mt-1" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right" /> Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Mobile Hamburger ─────────────────────────── */}
        <button
          className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 active:scale-90 transition-transform"
          onClick={() => setMenuOpen(v => !v)}
        >
          <span className={`w-6 h-0.5 bg-[#1d1d1f] transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`w-6 h-0.5 bg-[#1d1d1f] transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`w-6 h-0.5 bg-[#1d1d1f] transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* ── Mobile Menu ──────────────────────────────────── */}
      {menuOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full h-[calc(100vh-64px)] bg-white z-40 p-6 flex flex-col animate-apple">
          <nav className="flex flex-col gap-2">
            <NavLink to="/" end className="px-4 py-3 rounded-2xl text-lg font-medium text-[#1d1d1f] active:bg-[#f5f5f7]" onClick={close}>Home</NavLink>
            <NavLink to="/marketplace" className="px-4 py-3 rounded-2xl text-lg font-medium text-[#1d1d1f] active:bg-[#f5f5f7]" onClick={close}>Marketplace</NavLink>
            <NavLink to="/pricing" className="px-4 py-3 rounded-2xl text-lg font-medium text-[#1d1d1f] active:bg-[#f5f5f7]" onClick={close}>Pricing</NavLink>
            <NavLink to="/about" className="px-4 py-3 rounded-2xl text-lg font-medium text-[#1d1d1f] active:bg-[#f5f5f7]" onClick={close}>About</NavLink>
            <NavLink to="/contact" className="px-4 py-3 rounded-2xl text-lg font-medium text-[#1d1d1f] active:bg-[#f5f5f7]" onClick={close}>Contact</NavLink>
          </nav>

          <div className="mt-auto pb-10 flex flex-col gap-4">
             {!isAuthenticated ? (
               <>
                 <NavLink to="/login" className="btn-secondary text-center" onClick={close}>Log in</NavLink>
                 <NavLink to="/free-trial" className="btn-primary text-center" onClick={close}>Get Started</NavLink>
               </>
             ) : (
               <button className="btn-secondary text-red-500" onClick={handleLogout}>Log out</button>
             )}
          </div>
        </div>
      )}
    </header>
  );
}
