import React from "react";

export default function ProductInfo({ title, rating, location, description, imageUrl }) {
  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold text-[#1d1d1f] tracking-tight leading-tight">{title}</h1>
        
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-black/5 transition-transform active:scale-95 cursor-default">
            <i className="bi bi-star-fill text-[#FF9500]" />
            <span className="text-sm font-black text-[#1d1d1f]">{rating}</span>
            <span className="text-[10px] text-[#86868b] font-bold uppercase tracking-widest ml-1">120 Reviews</span>
          </div>
          
          <div className="flex items-center gap-2 text-[#86868b]">
            <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">
              <i className="bi bi-geo-alt-fill text-xs" />
            </div>
            <span className="text-sm font-bold tracking-tight">{location}</span>
          </div>

          <div className="flex items-center gap-2 bg-[#34C759]/10 px-4 py-2 rounded-full">
            <div className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse" />
            <span className="text-[10px] font-black text-[#34C759] uppercase tracking-widest">In Stock</span>
          </div>
        </div>
      </div>
      
      {/* Feature Image */}
      <div className="group relative overflow-hidden rounded-[40px] shadow-2xl shadow-black/5 border border-black/5 aspect-[16/9]">
        <img 
          src={imageUrl || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>

      {/* Description Card */}
      <div className="bg-white rounded-[32px] p-10 shadow-sm border border-black/[0.03]">
        <h2 className="text-[11px] font-black text-[#86868b] uppercase tracking-[0.2em] mb-6">Product Overview</h2>
        <div className="space-y-6">
          <p className="text-[#1d1d1f] text-lg leading-relaxed font-medium">
            {description}
          </p>
          <div className="h-px bg-black/5 w-20" />
          <p className="text-[#86868b] text-base leading-relaxed font-medium italic">
            This premium Hydrogen product is engineered for industrial-grade performance, 
            optimized for the stringent requirements of B2B energy networks and 
            commercial fuel cell integration.
          </p>
        </div>
      </div>
    </div>
  );
}
