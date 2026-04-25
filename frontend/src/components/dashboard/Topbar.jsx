import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Topbar({ toggleSidebar }) {
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotify, setShowNotify] = useState(false);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <header className="sticky top-0 z-[90] bg-white/70 backdrop-blur-md border-b border-black/[0.03] px-6 py-4 animate-apple">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left: Mobile Toggle & Context */}
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden w-10 h-10 rounded-xl bg-[#F5F5F7] flex items-center justify-center text-[#1d1d1f] transition-all active:scale-95"
            onClick={toggleSidebar}
          >
            <i className="bi bi-list text-xl" />
          </button>
          
          <div className="hidden md:block">
            <h2 className="text-[10px] font-black text-[#86868b] uppercase tracking-[0.2em] mb-0.5">Control Center</h2>
            <p className="text-sm font-bold text-[#1d1d1f]">
              {greeting}, <span className="text-[#0071E3]">{user?.name?.split(" ")[0]}!</span> ☀️
            </p>
          </div>
        </div>

        {/* Right: Search & Actions */}
        <div className="flex items-center gap-3">
          
          {/* Search Bar - Pill Styled */}
          <div className="hidden lg:flex items-center relative group min-w-[280px]">
            <i className="bi bi-search absolute left-4 text-[#86868b] group-focus-within:text-[#0071E3] transition-colors" />
            <input
              type="text"
              placeholder="Search data, leads..."
              className="w-full bg-[#F5F5F7] border-transparent rounded-full py-2.5 pl-11 pr-4 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#0071E3]/10 transition-all outline-none"
            />
          </div>

          {/* Quick Action - Supplier Only */}
          {user?.role === "supplier" && (
            <Link 
              to="/add-listing" 
              className="hidden sm:flex items-center gap-2 bg-[#0071E3] text-white px-5 py-2.5 rounded-full text-xs font-black shadow-lg shadow-blue-500/20 active:scale-95 transition-transform"
            >
              <i className="bi bi-plus-lg" />
              NEW LISTING
            </Link>
          )}

          {/* Notifications */}
          <div className="relative">
            <button 
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${showNotify ? 'bg-[#F5F5F7] text-[#0071E3]' : 'text-[#86868b] hover:bg-[#F5F5F7]'}`}
              onClick={() => { setShowNotify(!showNotify); setShowProfile(false); }}
            >
              <i className="bi bi-bell text-xl" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#FF3B30] rounded-full border-2 border-white" />
            </button>

            {showNotify && (
              <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-[24px] shadow-2xl border border-black/[0.03] p-4 animate-apple origin-top-right">
                 <div className="px-2 py-3 border-b border-black/5 mb-2">
                   <h4 className="text-sm font-black text-[#1d1d1f] uppercase tracking-wider">Notifications</h4>
                 </div>
                 <div className="space-y-1">
                   {[
                     { title: "New Inquiry", desc: "Apex Gases sent a quote request", time: "1h ago", icon: "bi-envelope" },
                     { title: "System Update", desc: "v2.1 security patch deployed", time: "3h ago", icon: "bi-shield-check" }
                   ].map((n, i) => (
                     <div key={i} className="p-3 rounded-2xl hover:bg-[#F5F5F7] cursor-pointer transition-colors flex gap-4 items-start">
                        <div className="w-8 h-8 rounded-lg bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center flex-shrink-0">
                          <i className={`bi ${n.icon}`} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#1d1d1f] leading-tight">{n.title}</p>
                          <p className="text-xs text-[#86868b] mt-0.5">{n.desc}</p>
                          <span className="text-[10px] text-[#c1c1c6] font-medium mt-1 block">{n.time}</span>
                        </div>
                     </div>
                   ))}
                 </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button 
              className="flex items-center gap-3 p-1 rounded-full bg-[#F5F5F7] border border-black/[0.03] transition-all hover:bg-white active:scale-95"
              onClick={() => { setShowProfile(!showProfile); setShowNotify(false); }}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0071E3] to-[#5AC8FA] flex items-center justify-center text-white font-black text-xs">
                {(user?.name || "U")[0].toUpperCase()}
              </div>
              <i className={`bi bi-chevron-down text-[10px] text-[#86868b] mr-2 transition-transform duration-300 ${showProfile ? 'rotate-180' : ''}`} />
            </button>

            {showProfile && (
              <div className="absolute top-full right-0 mt-3 w-64 bg-white rounded-[24px] shadow-2xl border border-black/[0.03] p-4 animate-apple origin-top-right">
                <div className="p-3 border-b border-black/5 mb-3 flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center text-[#0071E3] font-bold">
                     {(user?.name || "U")[0].toUpperCase()}
                   </div>
                   <div className="min-w-0">
                     <p className="text-sm font-bold text-[#1d1d1f] truncate leading-tight">{user?.name}</p>
                     <p className="text-xs text-[#86868b] truncate">{user?.email}</p>
                   </div>
                </div>
                <div className="space-y-1">
                  <Link to="/marketplace" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-[#1d1d1f] hover:bg-[#F5F5F7] transition-colors">
                    <i className="bi bi-shop text-[#0071E3]" />
                    Marketplace
                  </Link>
                  <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-[#FF3B30] hover:bg-red-50 transition-colors">
                    <i className="bi bi-box-arrow-right" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
