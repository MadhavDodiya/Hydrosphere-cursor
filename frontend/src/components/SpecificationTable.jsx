import React from "react";

export default function SpecificationTable({ listing }) {
  if (!listing) return null;

  const typeColors = {
    Green: "bg-[#34C759]/10 text-[#34C759] border-[#34C759]/20",
    Blue:  "bg-[#0071E3]/10 text-[#0071E3] border-[#0071E3]/20",
    Grey:  "bg-[#8E8E93]/10 text-[#8E8E93] border-[#8E8E93]/20",
  };
  const tc = typeColors[listing.hydrogenType] || typeColors.Grey;

  const specs = [
    { label: "Hydrogen Type", value: listing.hydrogenType ? (
      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${tc}`}>
        {listing.hydrogenType} Hydrogen
      </span>
    ) : "—" },
    { label: "Price per kg", value: listing.price != null ? (
      <span className="text-[#1d1d1f] font-bold">${listing.price}</span>
    ) : "—" },
    { label: "Inventory", value: listing.quantity != null ? (
      <span className="text-[#1d1d1f] font-bold">{listing.quantity} kg</span>
    ) : "—" },
    { label: "Purity", value: listing.purity != null ? (
      <div className="flex items-center gap-2">
         <span className="text-[#1d1d1f] font-bold">{listing.purity}%</span>
         <div className="w-16 h-1.5 bg-black/5 rounded-full overflow-hidden">
            <div className="h-full bg-[#0071E3] rounded-full" style={{ width: `${listing.purity}%` }} />
         </div>
      </div>
    ) : "—" },
    { label: "Production Site", value: listing.location || "—" },
    { label: "Capacity", value: listing.productionCapacity || "—" },
    { label: "Delivery", value: listing.deliveryAvailability || "—" },
    { label: "Supplier Status", value: listing.supplier?.isVerified
      ? <div className="flex items-center gap-2 text-[#34C759] font-bold"><i className="bi bi-patch-check-fill" /> Verified</div>
      : <div className="flex items-center gap-2 text-[#86868b] font-bold"><i className="bi bi-hourglass-split" /> Pending</div>
    },
  ];

  return (
    <div className="bg-white rounded-[32px] p-10 shadow-sm border border-black/[0.03]">
      <div className="flex items-center gap-4 mb-10">
         <div className="w-10 h-10 rounded-xl bg-[#0071E3]/10 flex items-center justify-center text-[#0071E3]">
            <i className="bi bi-file-earmark-text text-xl" />
         </div>
         <h3 className="text-[11px] font-black text-[#86868b] uppercase tracking-[0.2em]">Technical Specifications</h3>
      </div>

      <div className="space-y-1">
        {specs.map((spec, index) => (
          <div 
            key={index} 
            className="flex flex-col sm:flex-row sm:items-center justify-between py-5 border-b border-black/[0.03] last:border-0 group transition-colors hover:bg-[#F5F5F7]/50 px-2 rounded-2xl"
          >
            <span className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest sm:w-1/3 mb-1 sm:mb-0">
              {spec.label}
            </span>
            <div className="text-sm font-medium text-[#1d1d1f] flex-1">
              {spec.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
