import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// Use flex only (not block+flex — they conflict on `display`)
const linkClass = ({ isActive }) =>
  `flex min-h-[44px] items-center rounded-md px-3 py-2.5 text-sm font-medium ${
    isActive ? "bg-sky-50 text-sky-800" : "text-slate-700 hover:bg-slate-50"
  }`;

const desktopLinkClass = ({ isActive }) =>
  `text-sm font-medium px-2 py-1 rounded-md ${
    isActive ? "text-sky-700 bg-sky-50" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
  }`;

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const NavItems = ({ mobile = false }) => (
    <>
      <NavLink to="/" className={mobile ? linkClass : desktopLinkClass} end onClick={closeMenu}>
        Listings
      </NavLink>
      {isAuthenticated && (
        <NavLink to="/dashboard" className={mobile ? linkClass : desktopLinkClass} onClick={closeMenu}>
          Dashboard
        </NavLink>
      )}
      {user?.role === "seller" && (
        <NavLink to="/add-listing" className={mobile ? linkClass : desktopLinkClass} onClick={closeMenu}>
          Add listing
        </NavLink>
      )}
      {!isAuthenticated ? (
        <>
          <NavLink to="/login" className={mobile ? linkClass : desktopLinkClass} onClick={closeMenu}>
            Login
          </NavLink>
          <NavLink to="/signup" className={mobile ? linkClass : desktopLinkClass} onClick={closeMenu}>
            Sign up
          </NavLink>
        </>
      ) : (
        <div
          className={
            mobile
              ? "mt-2 border-t border-slate-200 pt-3"
              : "ml-2 flex items-center gap-2 border-l border-slate-200 pl-4"
          }
        >
          <span
            className={`max-w-[220px] truncate text-xs text-slate-500 ${mobile ? "mb-2 block px-1" : "hidden lg:inline"}`}
            title={user.email}
          >
            {user.name || user.email}
            <span className="text-slate-400"> · {user.role}</span>
          </span>
          <button
            type="button"
            onClick={() => {
              closeMenu();
              logout();
            }}
            className="w-full rounded border border-slate-300 px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 lg:w-auto lg:py-1 min-h-[44px] lg:min-h-0"
          >
            Log out
          </button>
        </div>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="text-lg font-semibold text-slate-900 shrink-0" onClick={closeMenu}>
          HydroSphere
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex md:flex-wrap md:items-center md:gap-1 lg:gap-2">
          <NavItems />
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-slate-300 p-2 text-slate-700 md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
          {menuOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile panel */}
      {menuOpen && (
        <div
          id="mobile-nav"
          className="border-t border-slate-200 bg-white px-4 pb-4 md:hidden"
        >
          <nav className="flex flex-col pt-2">
            <NavItems mobile />
          </nav>
        </div>
      )}
    </header>
  );
}
