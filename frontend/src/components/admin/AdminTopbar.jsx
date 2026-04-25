import React from 'react';

export default function AdminTopbar({ toggleSidebar, sectionName }) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-black/[0.03] h-20">
      <div className="h-full px-6 md:px-10 flex items-center justify-between">
        
        <div className="flex items-center gap-4">
          <button 
            className="lg:hidden w-10 h-10 rounded-xl bg-[#1d1d1f] flex items-center justify-center text-white active:scale-95 transition-transform"
            onClick={toggleSidebar}
          >
            <i className="bi bi-list text-xl" />
          </button>
          
          <div>
             <h2 className="text-xl font-black text-[#1d1d1f] tracking-tight">{sectionName || 'Admin Panel'}</h2>
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                <span className="text-[10px] font-black text-[#86868b] uppercase tracking-widest">Global Node: Secure</span>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="hidden md:flex items-center gap-4 text-[#86868b]">
              <div className="flex flex-col items-end">
                 <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Server Load</span>
                 <span className="text-xs font-bold text-[#1d1d1f]">14% Nominal</span>
              </div>
              <div className="w-[1px] h-8 bg-black/5" />
              <div className="flex flex-col items-end">
                 <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Last Update</span>
                 <span className="text-xs font-bold text-[#1d1d1f]">Just now</span>
              </div>
           </div>

           <div className="w-10 h-10 rounded-full bg-[#f5f5f7] border border-black/5 flex items-center justify-center text-[#1d1d1f] font-black">
              A
           </div>
        </div>
      </div>
    </header>
  );
}
