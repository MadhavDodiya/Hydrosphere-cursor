import React, { useState, useEffect } from "react";
import StatsCard from "../../dashboard/StatsCard.jsx";
import api from "../../../services/api.js";

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

  return (
    <div className="admin-overview fade-in">
      <div className="row g-4 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatsCard 
            title="Total Users" 
            value={stats?.totalUsers || "0"} 
            icon="bi-people" 
            trend="+12%" 
            loading={loading}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatsCard 
            title="Total Listings" 
            value={stats?.totalListings || "0"} 
            icon="bi-card-list" 
            colorClass="warning" 
            trend="+5%" 
            loading={loading}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatsCard 
            title="Total Inquiries" 
            value={stats?.totalInquiries || "0"} 
            icon="bi-chat-left-dots" 
            colorClass="success" 
            trend="+24%" 
            loading={loading}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatsCard 
            title="Recent Signups" 
            value={stats?.newUsersToday || "0"} 
            icon="bi-person-plus" 
            colorClass="info" 
            trend="New Today" 
            loading={loading}
          />
        </div>
      </div>

      <div className="row g-4">
        {/* Left: Recent Signups */}
        <div className="col-12 col-xl-7">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-transparent border-0 p-4">
              <h5 className="fw-bold mb-0">Platform Overview</h5>
            </div>
            <div className="card-body p-4 pt-0">
               {/* Summary info or placeholder table */}
               <div className="p-5 text-center bg-light rounded-4">
                  <i className="bi bi-display fs-1 text-muted opacity-25"></i>
                  <p className="mt-2 text-muted small">Platform charts and detailed reports moving here soon...</p>
               </div>
            </div>
          </div>
        </div>

        {/* Right: Pending Approvals */}
        <div className="col-12 col-xl-5">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-transparent d-flex justify-content-between align-items-center p-4">
              <h5 className="fw-bold mb-0">Pending Approvals</h5>
              <button className="btn btn-sm btn-light border rounded-pill px-3">View All</button>
            </div>
            <div className="card-body p-4 pt-0">
              <div className="d-flex flex-column gap-3">
                {stats?.pendingListings > 0 ? (
                  <div className="alert alert-warning border-0 rounded-4 p-3 d-flex align-items-center justify-content-between">
                    <div>
                      <h6 className="fw-bold mb-1">New Listings Pending</h6>
                      <p className="mb-0 small">{stats.pendingListings} items waiting for verification.</p>
                    </div>
                    <i className="bi bi-chevron-right"></i>
                  </div>
                ) : (
                  <div className="text-center py-5 text-muted small">
                     <i className="bi bi-check-circle fs-2 d-block mb-2 opacity-25"></i>
                     No pending approvals at the moment.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
