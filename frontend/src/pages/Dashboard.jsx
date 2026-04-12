import React, { useState, useEffect } from "react";
import Sidebar from "../components/dashboard/Sidebar.jsx";
import Topbar from "../components/dashboard/Topbar.jsx";
import StatsCard from "../components/dashboard/StatsCard.jsx";
import LeadsTable from "../components/dashboard/LeadsTable.jsx";
import ActivityFeed from "../components/dashboard/ActivityFeed.jsx";
import DashboardChart from "../components/dashboard/DashboardChart.jsx";
import "./Dashboard.css";
import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate network latency for skeleton load
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

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
              <StatsCard loading={loading} title="Total Leads" value="128" trend={12.5} icon="bi-people" colorClass="primary" />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatsCard loading={loading} title="Active Orders" value="45" trend={8.2} icon="bi-basket" colorClass="success" />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatsCard loading={loading} title="Messages" value="23" trend={-2.4} icon="bi-chat-dots" colorClass="warning" />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatsCard loading={loading} title="Total Revenue" value="$45,210" trend={24.5} icon="bi-currency-dollar" colorClass="info" />
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
