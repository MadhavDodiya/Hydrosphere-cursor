export default function SupplierCard({ supplier }) {
  return (
    <div className="card h-full flex flex-col group overflow-hidden border border-black/[0.03]">
      {/* Media Container with Apple-style rounding */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-[18px]">
        <img 
          src={supplier.imageUrl} 
          alt={supplier.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy" 
        />
        <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1.5 text-xs font-bold text-[#1d1d1f] shadow-sm">
          <i className="bi bi-star-fill text-[#FF9500]" />
          {supplier.rating}
        </div>
      </div>

      <div className="flex flex-col flex-1 mt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-[#1d1d1f] leading-tight truncate group-hover:text-[#0071E3] transition-colors">{supplier.name}</h3>
            <div className="flex items-center gap-1.5 text-sm text-[#86868b] mt-1">
              <i className="bi bi-geo-alt" />
              <span className="truncate">{supplier.location}</span>
            </div>
          </div>

          <div className="w-10 h-10 rounded-full bg-[#f5f5f7] flex items-center justify-center text-[#0071E3] transition-all duration-300 group-hover:bg-[#0071E3] group-hover:text-white group-hover:rotate-[-45deg]">
            <i className="bi bi-arrow-right text-lg" />
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-between">
          <div className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest">Pricing</div>
          <div className="text-lg font-black text-[#1d1d1f]">{supplier.price}</div>
        </div>
      </div>
    </div>
  );
}

