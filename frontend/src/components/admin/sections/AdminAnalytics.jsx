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
    "Green Hydrogen": { bar: "#22c55e", bg: "#f0fdf4", border: "#bbf7d0" },
    "Blue Hydrogen":  { bar: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
    "Grey Hydrogen":  { bar: "#94a3b8", bg: "#f8fafc", border: "#e2e8f0" },
  };

  return (
    <div className="admin-analytics fade-in">

      {/* Top KPIs */}
      <div className="row g-4 mb-4">
        {[
          { label: "Total Platform Users", value: stats?.totalUsers, icon: "bi-people-fill", color: "#2563eb" },
          { label: "All-Time Inquiries", value: stats?.totalInquiries, icon: "bi-chat-dots-fill", color: "#0891b2" },
          { label: "Active Listings", value: (stats?.totalListings || 0) - (stats?.pendingListings || 0), icon: "bi-grid-fill", color: "#16a34a" },
          { label: "Paid Subscribers", value: stats?.paidUsers, icon: "bi-star-fill", color: "#7c3aed" },
        ].map((kpi, i) => (
          <div key={i} className="col-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100" style={{ background: "white" }}>
              <div className="d-flex align-items-center gap-3 mb-2">
                <div className="rounded-3 d-flex align-items-center justify-content-center"
                  style={{ width: 44, height: 44, background: `${kpi.color}15` }}>
                  <i className={`bi ${kpi.icon}`} style={{ color: kpi.color, fontSize: "1.25rem" }}></i>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>{kpi.label}</div>
                  <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>
                    {loading ? <span className="placeholder col-4" style={{ height: 24 }}></span> : (kpi.value ?? 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Hydrogen Breakdown */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-xl-7">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-0 px-4 pt-4 pb-0">
              <h6 className="fw-bold mb-0">New User Signups — Last 7 Days</h6>
              <p className="text-muted mb-3" style={{ fontSize: "0.78rem" }}>Platform growth trends by daily registrations</p>
            </div>
            <div className="card-body px-4 pb-4 pt-0">
              <DashboardChart loading={loading} data={stats?.chartData} />
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-5">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-0 px-4 pt-4 pb-0">
              <h6 className="fw-bold mb-1">Hydrogen Type Distribution</h6>
              <p className="text-muted mb-3" style={{ fontSize: "0.78rem" }}>Market share of approved listings by type</p>
            </div>
            <div className="card-body px-4 pb-4 pt-0">
              {loading ? (
                <div className="placeholder-glow d-flex flex-column gap-3">
                  {[70, 45, 30].map((w, i) => <div key={i} className="placeholder rounded" style={{ height: 56 }}></div>)}
                </div>
              ) : stats?.hydrogenBreakdown?.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {stats.hydrogenBreakdown.map((cat, i) => {
                    const colors = typeColors[cat.name] || { bar: "#94a3b8", bg: "#f8fafc", border: "#e2e8f0" };
                    return (
                      <div key={i} className="p-3 rounded-3" style={{ background: colors.bg, border: `1px solid ${colors.border}` }}>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-semibold" style={{ fontSize: "0.875rem", color: "#0f172a" }}>{cat.name}</span>
                          <div className="d-flex align-items-center gap-2">
                            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{cat.count} listings</span>
                            <span className="fw-bold" style={{ fontSize: "0.9rem", color: colors.bar }}>{cat.share}</span>
                          </div>
                        </div>
                        <div className="progress" style={{ height: 6, borderRadius: 99, background: "white" }}>
                          <div className="progress-bar" style={{ width: cat.share, background: colors.bar, borderRadius: 99, transition: "width 1s ease" }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-bar-chart fs-2 d-block mb-2 opacity-25"></i>
                  No approved listings yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Platform Metrics Table */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-header bg-white border-0 p-4 pb-0">
          <h6 className="fw-bold mb-0">Platform Summary</h6>
        </div>
        <div className="card-body p-4">
          <div className="table-responsive">
            <table className="table table-borderless align-middle mb-0">
              <thead>
                <tr className="text-muted" style={{ fontSize: "0.78rem", textTransform: "uppercase", fontWeight: 700 }}>
                  <th className="pb-3">Metric</th>
                  <th className="pb-3">Value</th>
                  <th className="pb-3">Details</th>
                  <th className="pb-3 text-end">Status</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: "0.875rem" }}>
                {[
                  { metric: "Total Buyers", value: stats?.totalBuyers, detail: "Registered buyer accounts", ok: true },
                  { metric: "Total Suppliers", value: stats?.totalSuppliers, detail: `${stats?.pendingApprovals || 0} pending approval`, ok: (stats?.pendingApprovals || 0) === 0 },
                  { metric: "Verified Suppliers", value: (stats?.totalSuppliers || 0) - (stats?.unverifiedSuppliers || 0), detail: `${stats?.unverifiedSuppliers || 0} not yet verified`, ok: (stats?.unverifiedSuppliers || 0) === 0 },
                  { metric: "Listings in Review", value: stats?.pendingListings, detail: "Awaiting admin approval", ok: (stats?.pendingListings || 0) === 0 },
                  { metric: "Featured Listings", value: stats?.featuredListings, detail: "Priority marketplace placement", ok: true },
                  { metric: "New Users Today", value: stats?.newUsersToday, detail: "Signed up in the last 24h", ok: true },
                  { metric: "New Listings This Week", value: stats?.newListingsThisWeek, detail: "Created in the last 7 days", ok: true },
                ].map((row, i) => (
                  <tr key={i} className="border-top">
                    <td className="py-3 fw-semibold text-dark">{row.metric}</td>
                    <td className="py-3">
                      <span className="fw-bold" style={{ fontSize: "1.05rem" }}>
                        {loading ? "…" : (row.value ?? 0)}
                      </span>
                    </td>
                    <td className="py-3 text-muted small">{row.detail}</td>
                    <td className="py-3 text-end">
                      <span className={`badge rounded-pill px-3 py-2 ${row.ok ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"}`}>
                        <i className={`bi ${row.ok ? "bi-check-circle" : "bi-exclamation-circle"} me-1`}></i>
                        {row.ok ? "Healthy" : "Needs Attention"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
