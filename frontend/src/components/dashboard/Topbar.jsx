import React from 'react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../NotificationBell';

export default function Topbar({ toggleSidebar }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-[#F5F5F7]/80 backdrop-blur-xl border-b border-black/[0.03] h-20">
      <div className="h-full px-6 md:px-10 flex items-center justify-between">
        
        <div className="flex items-center gap-4">
          <button 
            className="lg:hidden w-10 h-10 rounded-xl bg-white border border-black/5 flex items-center justify-center text-[#1d1d1f] active:scale-95 transition-transform shadow-sm"
            onClick={toggleSidebar}
          >
            <i className="bi bi-list text-xl" />
          </button>
          
          <div className="hidden md:flex items-center gap-2">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-500/20" />
             <span className="text-[11px] font-black text-[#86868b] uppercase tracking-widest">System Status: Active</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Search / Global Actions */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-black/[0.03] rounded-full border border-black/[0.02] group focus-within:bg-white focus-within:ring-4 focus-within:ring-[#0071E3]/5 transition-all">
            <i className="bi bi-search text-[#86868b] text-sm" />
            <input 
              type="text" 
              placeholder="Quick search..." 
              className="bg-transparent border-none text-sm font-medium text-[#1d1d1f] focus:outline-none w-48 placeholder:text-[#86868b]"
            />
            <span className="text-[10px] font-black text-[#c1c1c6] bg-white px-1.5 py-0.5 rounded-md border border-black/5">⌘K</span>
          </div>

          <div className="h-8 w-[1px] bg-black/5 mx-2" />

          <NotificationBell user={user} />

          <button className="hidden md:flex items-center gap-3 px-4 py-2 bg-white rounded-full border border-black/5 shadow-sm hover:shadow-md transition-all active:scale-95">
             <i className="bi bi-gear-fill text-[#86868b]" />
             <span className="text-xs font-bold text-[#1d1d1f]">Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
}
