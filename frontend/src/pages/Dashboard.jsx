import React, { useState, useEffect } from "react";
import Sidebar from "../components/dashboard/Sidebar.jsx";
import Topbar from "../components/dashboard/Topbar.jsx";
import StatsCard from "../components/dashboard/StatsCard.jsx";
import LeadsTable from "../components/dashboard/LeadsTable.jsx";
import ActivityFeed from "../components/dashboard/ActivityFeed.jsx";
import DashboardChart from "../components/dashboard/DashboardChart.jsx";
import "./Dashboard.css";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

export default function Dashboard() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/seller/stats");
      setStats(data);
    } catch (err) {
      console.error("Error fetching seller stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "seller") {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  const toggleSidebar = () => setMobileOpen(!mobileOpen);
  const closeSidebar = () => setMobileOpen(false);

  return (
    <div className="dashboard-bg">
      <Sidebar mobileOpen={mobileOpen} closeMobileSidebar={closeSidebar} />
      
      <div className="dashboard-main">
        <Topbar toggleSidebar={toggleSidebar} />
        
        {/* Main Workspace Content */}
        <div className="container-fluid p-4 p-md-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
             <div>
               <h3 className="fw-bold text-dark mb-1">Welcome back, {user?.name || 'User'}!</h3>
               <p className="text-secondary mb-0">Here's what is happening with your store today.</p>
             </div>
             <button className="btn btn-primary shadow-sm d-none d-md-block px-4 fw-medium">
               <i className="bi bi-cloud-download pe-2"></i>Export Report
             </button>
          </div>

          {/* Stats Row */}
          <div className="row g-4 mb-4">
            <div className="col-12 col-sm-6 col-xl-3">
              <StatsCard 
                loading={loading} 
                title="Total Leads" 
                value={stats?.totalLeads || "0"} 
                trend="+10%" 
                icon="bi-people" 
                colorClass="primary" 
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatsCard 
                loading={loading} 
                title="Active Listings" 
                value={stats?.activeListings || "0"} 
                trend="+5%" 
                icon="bi-card-list" 
                colorClass="success" 
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatsCard 
                loading={loading} 
                title="New Today" 
                value={stats?.newLeadsToday || "0"} 
                trend="+20%" 
                icon="bi-chat-dots" 
                colorClass="warning" 
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatsCard 
                loading={loading} 
                title="Total Listings" 
                value={stats?.totalListings || "0"} 
                trend="+0%" 
                icon="bi-box" 
                colorClass="info" 
              />
            </div>
          </div>

          {/* Chart & Activity Row */}
          <div className="row g-4 mb-4">
             <div className="col-12 col-lg-8">
               <DashboardChart loading={loading} />
             </div>
             <div className="col-12 col-lg-4">
               <ActivityFeed loading={loading} />
             </div>
          </div>

          {/* Table Row */}
          <div className="row">
            <div className="col-12">
              <LeadsTable loading={loading} />
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
