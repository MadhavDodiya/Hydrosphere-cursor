import React, { useState, useEffect } from "react";
import Sidebar from "../components/dashboard/Sidebar.jsx";
import Topbar from "../components/dashboard/Topbar.jsx";
import StatsCard from "../components/dashboard/StatsCard.jsx";
import LeadsTable from "../components/dashboard/LeadsTable.jsx";
import ActivityFeed from "../components/dashboard/ActivityFeed.jsx";
import DashboardChart from "../components/dashboard/DashboardChart.jsx";

// Section Components
import MyListings from "../components/dashboard/MyListings.jsx";
import BuyerInquiries from "../components/dashboard/BuyerInquiries.jsx";
import SavedListings from "../components/dashboard/SavedListings.jsx";
import Billing from "../components/dashboard/Billing.jsx";

import "./Dashboard.css";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";
import { useToast } from "../context/ToastContext.jsx";

export default function Dashboard({ section = "overview" }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const endpoint = user?.role === "seller" ? "/api/seller/stats" : "/api/users/stats";
      const { data } = await api.get(endpoint);
      setStats(data);
    } catch (err) {
      console.error("Error fetching stats:", err);
      showToast(err?.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStats();
    }
    window.scrollTo(0, 0);
  }, [user, section]);

  const toggleSidebar = () => setMobileOpen(!mobileOpen);
  const closeSidebar = () => setMobileOpen(false);

  const renderOverview = () => (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Welcome back, {user?.name || 'User'}!</h3>
          <p className="text-secondary mb-0">Here's what is happening with your {user?.role === 'seller' ? 'store' : 'account'} today.</p>
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
            title={user?.role === 'seller' ? "Total Leads" : "Sent Inquiries"} 
            value={user?.role === 'seller' ? stats?.totalLeads : stats?.totalInquiries || "0"} 
            trend="+10%" 
            icon="bi-people" 
            colorClass="primary" 
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatsCard 
            loading={loading} 
            title={user?.role === 'seller' ? "Active Listings" : "Saved Listings"} 
            value={user?.role === 'seller' ? stats?.activeListings : stats?.totalSaved || "0"} 
            trend="+5%" 
            icon="bi-card-list" 
            colorClass="success" 
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatsCard 
            loading={loading} 
            title={user?.role === 'seller' ? "New Today" : "Market Listings"} 
            value={user?.role === 'seller' ? stats?.newLeadsToday : stats?.marketListings || "0"} 
            trend="+2%" 
            icon="bi-chat-dots" 
            colorClass="warning" 
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatsCard 
            loading={loading} 
            title={user?.role === 'seller' ? "Total Listings" : "Account Status"} 
            value={user?.role === 'seller' ? (stats?.totalListings || "0") : "Active"} 
            trend={user?.role === 'seller' ? "+0%" : "Verified"} 
            icon="bi-box" 
            colorClass="info" 
          />
        </div>
      </div>

      {/* Chart & Activity Row */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-8">
          <DashboardChart loading={loading} data={stats?.chartData} />
        </div>
        <div className="col-12 col-lg-4">
          <ActivityFeed loading={loading} activities={stats?.activity} />
        </div>
      </div>

      {/* Conditional bottom content */}
      <div className="row">
        <div className="col-12">
          {user?.role === 'seller' ? (
            <LeadsTable loading={loading} />
          ) : (
            <BuyerInquiries />
          )}
        </div>
      </div>
    </>
  );

  const renderSection = () => {
    switch (section) {
      case "overview":     return renderOverview();
      case "my-listings": return <MyListings />;
      case "leads":        return <LeadsTable />;
      case "inquiries":    return <BuyerInquiries />;
      case "saved":        return <SavedListings />;
      case "billing":      return <Billing />;
      default:             return renderOverview();
    }
  };

  return (
    <div className="dashboard-bg">
      <Sidebar 
        mobileOpen={mobileOpen} 
        closeMobileSidebar={closeSidebar} 
        stats={stats} 
      />
      
      <div className="dashboard-main">
        <Topbar toggleSidebar={toggleSidebar} />
        
        {/* Main Workspace Content */}
        <div className="container-fluid p-4 p-md-5">
           {renderSection()}
        </div>
      </div>
    </div>
  );
}
