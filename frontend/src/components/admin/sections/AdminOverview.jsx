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

  // Quick action items with real pending counts from stats
  const quickActions = [
    {
      title: "Pending Listings",
      value: stats?.pendingListings ?? "—",
      icon: "bi-card-list",
      color: "#f59e0b",
      bg: "#fffbeb",
      border: "#fde68a",
      link: "/admin/listings",
      cta: "Review Now",
    },
    {
      title: "Pending Approvals",
      value: stats?.pendingApprovals ?? "—",
      icon: "bi-person-check",
      color: "#2563eb",
      bg: "#eff6ff",
      border: "#bfdbfe",
      link: "/admin/verify",
      cta: "Approve Suppliers",
    },
    {
      title: "Paid Subscribers",
      value: stats?.paidUsers ?? "—",
      icon: "bi-star-fill",
      color: "#7c3aed",
      bg: "#f5f3ff",
      border: "#ddd6fe",
      link: "/admin/users",
      cta: "View Users",
    },
    {
      title: "Featured Listings",
      value: stats?.featuredListings ?? "—",
      icon: "bi-lightning-fill",
      color: "#0891b2",
      bg: "#ecfeff",
      border: "#a5f3fc",
      link: "/admin/listings",
      cta: "Manage",
    },
  ];

  return (
    <div className="admin-overview fade-in">

      {/* Primary KPI Cards */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatsCard title="Total Users" value={stats?.totalUsers || "0"} icon="bi-people" trend={`+${stats?.newUsersToday || 0} today`} loading={loading} />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatsCard title="Total Listings" value={stats?.totalListings || "0"} icon="bi-card-list" colorClass="warning" trend={`+${stats?.newListingsThisWeek || 0} this week`} loading={loading} />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatsCard title="Total Inquiries" value={stats?.totalInquiries || "0"} icon="bi-chat-left-dots" colorClass="success" trend="All time" loading={loading} />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatsCard title="Active Suppliers" value={stats?.totalSellers || "0"} icon="bi-shop" colorClass="info" trend={`${stats?.unverifiedSellers || 0} unverified`} loading={loading} />
        </div>
      </div>

      {/* Chart + Quick Actions */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-xl-7">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-0 overflow-hidden">
            <div className="card-header bg-white border-0 px-4 pt-4 pb-2">
              <h6 className="fw-bold mb-0 text-dark">New User Signups (Last 7 Days)</h6>
              <p className="text-muted mb-0" style={{ fontSize: "0.78rem" }}>Daily registration activity on the platform</p>
            </div>
            <div className="card-body px-4 pb-4 pt-2">
              <DashboardChart loading={loading} data={stats?.chartData} />
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-5">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-0 px-4 pt-4 pb-0">
              <h6 className="fw-bold mb-3 text-dark">Quick Actions</h6>
            </div>
            <div className="card-body px-4 pb-4 d-flex flex-column gap-3">
              {quickActions.map((qa, i) => (
                <div key={i} className="d-flex align-items-center justify-content-between p-3 rounded-3"
                  style={{ background: qa.bg, border: `1px solid ${qa.border}` }}>
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-3 d-flex align-items-center justify-content-center"
                      style={{ width: 40, height: 40, background: "white", border: `1px solid ${qa.border}` }}>
                      <i className={`bi ${qa.icon}`} style={{ color: qa.color, fontSize: "1.1rem" }}></i>
                    </div>
                    <div>
                      <div className="fw-semibold" style={{ fontSize: "0.85rem", color: "#0f172a" }}>{qa.title}</div>
                      <div className="fw-bold" style={{ fontSize: "1.2rem", color: qa.color, lineHeight: 1 }}>{loading ? "…" : qa.value}</div>
                    </div>
                  </div>
                  <Link to={qa.link} className="btn btn-sm fw-medium"
                    style={{ background: qa.color, color: "white", borderRadius: "8px", fontSize: "0.78rem", border: "none" }}>
                    {qa.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* User Split */}
      <div className="row g-4">
        <div className="col-12 col-xl-4">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white border-0 p-4 pb-2">
              <h6 className="fw-bold mb-0">User Breakdown</h6>
            </div>
            <div className="card-body p-4 pt-2">
              {[
                { label: "Buyers", value: stats?.totalBuyers || 0, color: "#2563eb", icon: "bi-cart3" },
                { label: "Sellers", value: stats?.totalSellers || 0, color: "#0891b2", icon: "bi-shop" },
                { label: "Paid Plans", value: stats?.paidUsers || 0, color: "#7c3aed", icon: "bi-star-fill" },
              ].map((row, i) => {
                const pct = stats?.totalUsers > 0 ? Math.round((row.value / stats.totalUsers) * 100) : 0;
                return (
                  <div key={i} className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="small fw-semibold text-dark"><i className={`bi ${row.icon} me-1`} style={{ color: row.color }}></i>{row.label}</span>
                      <span className="small text-muted">{loading ? "…" : `${row.value} (${pct}%)`}</span>
                    </div>
                    <div className="progress" style={{ height: 6, borderRadius: 99 }}>
                      <div className="progress-bar" style={{ width: `${pct}%`, background: row.color, borderRadius: 99, transition: "width 1s ease" }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-8">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white border-0 p-4 pb-0">
              <h6 className="fw-bold mb-0">Platform Health</h6>
            </div>
            <div className="card-body p-4">
              <div className="row g-3">
                {[
                  { label: "Listing Approval Rate", numerator: (stats?.totalListings || 0) - (stats?.pendingListings || 0), denominator: stats?.totalListings || 1, color: "#16a34a" },
                  { label: "Supplier Approval Rate", numerator: (stats?.totalSellers || 0) - (stats?.pendingApprovals || 0), denominator: stats?.totalSellers || 1, color: "#2563eb" },
                  { label: "Supplier Verification Rate", numerator: (stats?.totalSellers || 0) - (stats?.unverifiedSellers || 0), denominator: stats?.totalSellers || 1, color: "#7c3aed" },
                ].map((metric, i) => {
                  const pct = Math.round((metric.numerator / metric.denominator) * 100);
                  return (
                    <div key={i} className="col-12">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="small fw-medium text-dark">{metric.label}</span>
                        <span className="small fw-bold" style={{ color: metric.color }}>{loading ? "…" : `${pct}%`}</span>
                      </div>
                      <div className="progress" style={{ height: 8, borderRadius: 99, background: "#f1f5f9" }}>
                        <div className="progress-bar" style={{ width: `${pct}%`, background: metric.color, borderRadius: 99, transition: "width 1.2s ease" }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
