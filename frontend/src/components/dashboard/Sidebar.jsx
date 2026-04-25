import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Sidebar({ mobileOpen, closeMobileSidebar, stats }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const supplierMenu = [
    { name: "Dashboard", icon: "bi-grid-1x2",  link: "/dashboard" },
    { name: "My Listings",      icon: "bi-card-list",       link: "/dashboard/my-listings" },
    { name: "Leads Received",   icon: "bi-inbox",           link: "/dashboard/leads", badge: stats?.newLeadsToday },
    { name: "Billing",          icon: "bi-credit-card",     link: "/dashboard/billing" },
    { name: "Add Listing",      icon: "bi-plus-square",     link: "/add-listing" },
    { name: "Marketplace",      icon: "bi-shop",            link: "/marketplace" },
  ];

  const buyerMenu = [
    { name: "Dashboard", icon: "bi-grid-1x2",  link: "/dashboard" },
    { name: "My Inquiries",    icon: "bi-chat-dots",       link: "/dashboard/inquiries" },
    { name: "Saved Listings",  icon: "bi-bookmark-heart",  link: "/dashboard/saved", badge: stats?.totalSaved },
    { name: "Marketplace",     icon: "bi-shop",            link: "/marketplace" },
  ];

  const menuItems = user?.role === "supplier" ? supplierMenu : buyerMenu;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] lg:hidden" 
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-[#1d1d1f] text-white z-[110] transform transition-transform duration-500 ease-apple lg:relative lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full p-6">
          
          {/* Brand */}
          <div className="mb-10 px-2">
            <Link to="/" className="flex items-center gap-3 active:scale-95 transition-transform">
              <div className="w-10 h-10 bg-[#0071E3] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">
                H
              </div>
              <span className="font-extrabold text-xl tracking-tight">HydroSphere</span>
            </Link>
          </div>

          {/* User Profile Glassmorphism */}
          <div className="bg-white/5 border border-white/5 rounded-[22px] p-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white font-bold text-sm border border-white/10">
                {(user?.name || "U")[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate leading-tight">{user?.name || "User"}</div>
                <div className="text-[10px] text-[#86868b] font-medium truncate uppercase tracking-widest mt-0.5">{user?.role}</div>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.link;
              return (
                <Link
                  key={item.name}
                  to={item.link}
                  onClick={closeMobileSidebar}
                  className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                    isActive 
                      ? 'bg-[#0071E3] text-white shadow-lg shadow-blue-500/20' 
                      : 'text-[#86868b] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <i className={`bi ${item.icon} text-lg ${isActive ? 'text-white' : 'text-[#86868b] group-hover:text-white'}`} />
                  <span className="text-sm font-bold tracking-tight">{item.name}</span>
                  {item.badge != null && item.badge > 0 && (
                    <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-black ${isActive ? 'bg-white text-[#0071E3]' : 'bg-[#0071E3] text-white'}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout Section */}
          <div className="mt-6 pt-6 border-t border-white/5">
            <button
              onClick={logout}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-[#FF453A] hover:bg-[#FF453A]/10 transition-colors font-bold text-sm"
            >
              <i className="bi bi-box-arrow-left text-lg" />
              Log Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
