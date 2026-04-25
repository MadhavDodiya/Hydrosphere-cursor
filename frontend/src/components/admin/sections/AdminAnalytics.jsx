import React, { useState, useEffect } from "react";
import DashboardChart from "../../dashboard/DashboardChart.jsx";
import api from "../../../services/api.js";

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/admin/stats")
      .then(res => setStats(res.data))
      .catch(err => console.error("AdminAnalytics stats error:", err))
      .finally(() => setLoading(false));
  }, []);

  const typeColors = {
    "Green Hydrogen": { bar: "bg-[#34C759]", bg: "bg-[#34C759]/10", border: "border-[#34C759]/20", text: "text-[#34C759]" },
    "Blue Hydrogen":  { bar: "bg-[#0071E3]", bg: "bg-[#0071E3]/10", border: "border-[#0071E3]/20", text: "text-[#0071E3]" },
    "Grey Hydrogen":  { bar: "bg-[#8E8E93]", bg: "bg-[#8E8E93]/10", border: "border-[#8E8E93]/20", text: "text-[#8E8E93]" },
  };

  return (
    <div className="space-y-10 animate-apple">
      
      {/* Platform Velocity Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Network Scale", value: stats?.totalUsers, icon: "bi-people", color: "text-[#0071E3]", bg: "bg-[#0071E3]/10" },
          { label: "Market Interactions", value: stats?.totalInquiries, icon: "bi-chat-left", color: "text-[#34C759]", bg: "bg-[#34C759]/10" },
          { label: "Available Supply", value: (stats?.totalListings || 0) - (stats?.pendingListings || 0), icon: "bi-layers", color: "text-[#FF9500]", bg: "bg-[#FF9500]/10" },
          { label: "Premium Nodes", value: stats?.paidUsers, icon: "bi-star", color: "text-[#AF52DE]", bg: "bg-[#AF52DE]/10" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white rounded-[24px] p-6 shadow-sm border border-black/[0.03] transition-transform active:scale-[0.98]">
             <div className={`w-10 h-10 rounded-xl ${kpi.bg} ${kpi.color} flex items-center justify-center mb-4`}>
                <i className={`bi ${kpi.icon} text-lg`} />
             </div>
             <p className="text-[10px] font-black text-[#86868b] uppercase tracking-widest mb-1">{kpi.label}</p>
             <h3 className="text-2xl font-black text-[#1d1d1f] tracking-tight">
               {loading ? <span className="inline-block w-12 h-6 bg-[#F5F5F7] animate-pulse rounded" /> : (kpi.value ?? 0)}
             </h3>
          </div>
        ))}
      </div>

      {/* Primary Data Visualizers */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Trend Analysis */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-black/[0.03]">
          <div className="mb-10">
            <h3 className="text-[11px] font-black text-[#86868b] uppercase tracking-[0.2em] mb-1">Growth Vectors</h3>
            <p className="text-xl font-black text-[#1d1d1f]">User Acquisition Pipeline</p>
          </div>
          <div className="min-h-[300px]">
             <DashboardChart loading={loading} data={stats?.chartData} />
          </div>
        </div>

        {/* Inventory Composition */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-black/[0.03]">
          <div className="mb-10">
            <h3 className="text-[11px] font-black text-[#86868b] uppercase tracking-[0.2em] mb-1">Inventory Composition</h3>
            <p className="text-xl font-black text-[#1d1d1f]">Pathway Distribution</p>
          </div>
          
          <div className="space-y-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-[#F5F5F7] animate-pulse rounded-2xl" />)}
              </div>
            ) : stats?.hydrogenBreakdown?.length > 0 ? (
              stats.hydrogenBreakdown.map((cat, i) => {
                const colors = typeColors[cat.name] || { bar: "bg-[#8E8E93]", bg: "bg-[#F5F5F7]", border: "border-transparent", text: "text-[#8E8E93]" };
                return (
                  <div key={i} className={`p-5 rounded-[22px] ${colors.bg} border ${colors.border}`}>
                    <div className="flex justify-between items-center mb-3">
                      <span className={`text-sm font-black uppercase tracking-widest ${colors.text}`}>{cat.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-[#86868b]">{cat.count} Units</span>
                        <span className={`text-sm font-black ${colors.text}`}>{cat.share}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                      <div className={`h-full ${colors.bar} rounded-full transition-all duration-1000`} style={{ width: cat.share }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16">
                 <div className="w-16 h-16 bg-[#F5F5F7] rounded-full flex items-center justify-center mx-auto mb-4 text-[#86868b]">
                    <i className="bi bi-bar-chart text-2xl" />
                 </div>
                 <p className="text-sm font-bold text-[#86868b]">No active supply nodes detected.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Platform Health Matrix */}
      <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-black/[0.03]">
        <div className="p-8 border-b border-black/[0.03]">
           <h3 className="text-[11px] font-black text-[#86868b] uppercase tracking-[0.2em] mb-1">Operational Metrics</h3>
           <p className="text-xl font-black text-[#1d1d1f]">Node Integrity Monitor</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F5F5F7]/50 backdrop-blur-md">
                <th className="px-8 py-5 text-[10px] font-black text-[#86868b] uppercase tracking-widest">Dimension</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#86868b] uppercase tracking-widest">Magnitude</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#86868b] uppercase tracking-widest">Vector Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#86868b] uppercase tracking-widest text-right">Integrity Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03]">
              {[
                { metric: "Supplier Nodes", value: stats?.totalSuppliers, detail: `${stats?.pendingApprovals || 0} await validation`, ok: (stats?.pendingApprovals || 0) === 0 },
                { metric: "Security Clearance", value: (stats?.totalSuppliers || 0) - (stats?.unverifiedSuppliers || 0), detail: `${stats?.unverifiedSuppliers || 0} pending KYC`, ok: (stats?.unverifiedSuppliers || 0) === 0 },
                { metric: "Listing Throughput", value: stats?.pendingListings, detail: "Active review queue", ok: (stats?.pendingListings || 0) === 0 },
                { metric: "Market Visibility", value: stats?.featuredListings, detail: "Strategic placement nodes", ok: true },
                { metric: "Daily Acquisition", value: stats?.newUsersToday, detail: "Platform expansion rate", ok: true },
              ].map((row, i) => (
                <tr key={i} className="group hover:bg-[#F5F5F7]/30 transition-colors">
                  <td className="px-8 py-6 text-sm font-black text-[#1d1d1f] tracking-tight">{row.metric}</td>
                  <td className="px-8 py-6">
                    <span className="text-lg font-black text-[#0071E3]">
                      {loading ? "—" : (row.value ?? 0)}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-xs font-bold text-[#86868b] uppercase tracking-widest">{row.detail}</td>
                  <td className="px-8 py-6 text-right">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      row.ok ? 'bg-[#34C759]/10 text-[#34C759]' : 'bg-[#FF9500]/10 text-[#FF9500]'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${row.ok ? 'bg-[#34C759]' : 'bg-[#FF9500]'}`} />
                      {row.ok ? "Optimal" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
