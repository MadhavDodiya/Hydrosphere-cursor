import React, { useState, useEffect } from "react";
import StatsCard from "../../dashboard/StatsCard.jsx";
import DashboardChart from "../../dashboard/DashboardChart.jsx";
import api from "../../../services/api.js";
import { Link } from "react-router-dom";

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/api/admin/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching admin stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const quickActions = [
    {
      title: "Pending Listings",
      value: stats?.pendingListings ?? "—",
      icon: "bi-card-list",
      color: "text-[#FF9500]",
      bg: "bg-[#FF9500]/10",
      btn: "bg-[#FF9500]",
      link: "/admin/listings",
      cta: "Review",
    },
    {
      title: "Pending Approvals",
      value: stats?.pendingApprovals ?? "—",
      icon: "bi-person-check",
      color: "text-[#0071E3]",
      bg: "bg-[#0071E3]/10",
      btn: "bg-[#0071E3]",
      link: "/admin/verify",
      cta: "Verify",
    },
    {
      title: "Paid Subscribers",
      value: stats?.paidUsers ?? "—",
      icon: "bi-star-fill",
      color: "text-[#AF52DE]",
      bg: "bg-[#AF52DE]/10",
      btn: "bg-[#AF52DE]",
      link: "/admin/users",
      cta: "View",
    },
  ];

  return (
    <div className="space-y-10 animate-apple">
      
      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatsCard title="Total Users" value={stats?.totalUsers || "0"} icon="bi-people" trend={`+${stats?.newUsersToday || 0} today`} loading={loading} />
        <StatsCard title="Total Listings" value={stats?.totalListings || "0"} icon="bi-card-list" colorClass="warning" trend={`+${stats?.newListingsThisWeek || 0} wk`} loading={loading} />
        <StatsCard title="Total Inquiries" value={stats?.totalInquiries || "0"} icon="bi-chat-left-dots" colorClass="success" trend="Active" loading={loading} />
        <StatsCard title="Active Suppliers" value={stats?.totalSuppliers || "0"} icon="bi-shop" colorClass="info" trend={`${stats?.unverifiedSuppliers || 0} pending`} loading={loading} />
      </div>

      {/* Analytics & Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Main Chart Card */}
        <div className="xl:col-span-2 bg-white rounded-[32px] p-8 shadow-sm border border-black/[0.03] flex flex-col">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="text-[11px] font-black text-[#86868b] uppercase tracking-[0.2em] mb-1">Growth Metrics</h3>
              <p className="text-xl font-black text-[#1d1d1f]">User Acquisition</p>
            </div>
            <div className="bg-[#F5F5F7] px-3 py-1 rounded-full text-[10px] font-bold text-[#86868b] uppercase tracking-widest">
               Last 7 Days
            </div>
          </div>
          <div className="flex-1 min-h-[300px]">
            <DashboardChart loading={loading} data={stats?.chartData} />
          </div>
        </div>

        {/* Quick Management Panel */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-black/[0.03]">
          <h3 className="text-[11px] font-black text-[#86868b] uppercase tracking-[0.2em] mb-8">System Tasks</h3>
          <div className="space-y-4">
            {quickActions.map((qa, i) => (
              <div key={i} className={`flex items-center justify-between p-5 rounded-[24px] ${qa.bg} transition-transform active:scale-[0.98]`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                    <i className={`bi ${qa.icon} ${qa.color} text-xl`} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1d1d1f] opacity-60">{qa.title}</p>
                    <p className={`text-xl font-black ${qa.color}`}>{loading ? "—" : qa.value}</p>
                  </div>
                </div>
                <Link to={qa.link} className={`${qa.btn} text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/5`}>
                  {qa.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deep Analytics Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Progress Metrics */}
        <div className="bg-white rounded-[32px] p-10 shadow-sm border border-black/[0.03]">
          <h3 className="text-[11px] font-black text-[#86868b] uppercase tracking-[0.2em] mb-10">Verification Velocity</h3>
          <div className="space-y-8">
            {[
              { label: "Asset Approval", numerator: (stats?.totalListings || 0) - (stats?.pendingListings || 0), denominator: stats?.totalListings || 1, color: "bg-[#34C759]" },
              { label: "Supplier Onboarding", numerator: (stats?.totalSuppliers || 0) - (stats?.pendingApprovals || 0), denominator: stats?.totalSuppliers || 1, color: "bg-[#0071E3]" },
              { label: "Security Verification", numerator: (stats?.totalSuppliers || 0) - (stats?.unverifiedSuppliers || 0), denominator: stats?.totalSuppliers || 1, color: "bg-[#AF52DE]" },
            ].map((metric, i) => {
              const pct = Math.round((metric.numerator / metric.denominator) * 100);
              return (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-[#1d1d1f]">{metric.label}</span>
                    <span className="text-xs font-black text-[#86868b]">{loading ? "—" : `${pct}%`}</span>
                  </div>
                  <div className="h-2.5 bg-[#F5F5F7] rounded-full overflow-hidden">
                    <div className={`h-full ${metric.color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distribution Map */}
        <div className="bg-white rounded-[32px] p-10 shadow-sm border border-black/[0.03]">
           <h3 className="text-[11px] font-black text-[#86868b] uppercase tracking-[0.2em] mb-10">User Ecosystem</h3>
           <div className="grid grid-cols-3 gap-6 text-center">
              {[
                { label: "Procurement", value: stats?.totalBuyers || 0, color: "text-[#0071E3]", icon: "bi-cart3" },
                { label: "Production", value: stats?.totalSuppliers || 0, color: "text-[#34C759]", icon: "bi-shop" },
                { label: "Enterprise", value: stats?.paidUsers || 0, color: "text-[#AF52DE]", icon: "bi-star-fill" },
              ].map((row, i) => (
                <div key={i} className="space-y-3">
                   <div className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center ${row.color} bg-black/[0.02] text-2xl`}>
                      <i className={`bi ${row.icon}`} />
                   </div>
                   <div>
                      <p className="text-2xl font-black text-[#1d1d1f] tracking-tight">{loading ? "—" : row.value}</p>
                      <p className="text-[10px] font-bold text-[#86868b] uppercase tracking-widest">{row.label}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
}
