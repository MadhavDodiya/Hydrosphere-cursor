import React from "react";

const colorMap = {
  primary: { bg: "bg-[#0071E3]/10", text: "text-[#0071E3]", iconBg: "bg-[#0071E3]" },
  success: { bg: "bg-[#34C759]/10", text: "text-[#34C759]", iconBg: "bg-[#34C759]" },
  warning: { bg: "bg-[#FF9500]/10", text: "text-[#FF9500]", iconBg: "bg-[#FF9500]" },
  info:    { bg: "bg-[#5AC8FA]/10", text: "text-[#5AC8FA]", iconBg: "bg-[#5AC8FA]" },
};

export default function StatsCard({ loading, title, value, trend, icon, colorClass }) {
  if (loading) {
    return (
      <div className="bg-white rounded-[24px] p-6 border border-black/[0.03] shadow-sm animate-pulse space-y-4">
        <div className="flex justify-between items-start">
          <div className="h-3 w-20 bg-[#F5F5F7] rounded-full" />
          <div className="w-10 h-10 bg-[#F5F5F7] rounded-xl" />
        </div>
        <div className="h-8 w-24 bg-[#F5F5F7] rounded-lg" />
        <div className="h-4 w-32 bg-[#F5F5F7] rounded-full mt-auto" />
      </div>
    );
  }

  const rawTrend = typeof trend === "string" ? parseFloat(trend.replace(/[^0-9.-]/g, "")) : trend;
  const isPositive = rawTrend >= 0;
  const c = colorMap[colorClass] || colorMap.primary;

  return (
    <div className="bg-white rounded-[24px] p-6 border border-black/[0.03] shadow-sm hover:shadow-xl hover:shadow-black/[0.02] transition-all duration-500 animate-apple flex flex-col group">
      <div className="flex justify-between items-start mb-6">
        <p className="text-[10px] font-black text-[#86868b] uppercase tracking-[0.15em]">{title}</p>
        <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.text} flex items-center justify-center transition-transform group-hover:scale-110 duration-500`}>
          <i className={`bi ${icon} text-lg`} />
        </div>
      </div>
      
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-extrabold text-[#1d1d1f] tracking-tight">{value}</h2>
        
        <div className="flex items-center gap-2 mt-4">
          <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider ${
            isPositive ? 'bg-[#34C759]/10 text-[#34C759]' : 'bg-[#FF3B30]/10 text-[#FF3B30]'
          }`}>
            <i className={`bi ${isPositive ? "bi-arrow-up-right" : "bi-arrow-down-right"}`} />
            {trend}
          </span>
          <span className="text-[10px] text-[#86868b] font-bold uppercase tracking-widest">Growth</span>
        </div>
      </div>
    </div>
  );
}
