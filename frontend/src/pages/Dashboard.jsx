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

import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";
import { useToast } from "../context/ToastContext.jsx";

export default function Dashboard({ section = "overview" }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const fetchStats = async () => {
      try {
        setLoading(true);
        const endpoint = user?.role === "supplier" ? "/api/supplier/stats" : "/api/users/stats";
        const { data } = await api.get(endpoint);
        if (!cancelled) setStats(data);
      } catch (err) {
        console.error("Error fetching stats:", err);
        if (!cancelled) showToast(err?.response?.data?.message || "Failed to load dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchStats();
    window.scrollTo(0, 0);
    return () => { cancelled = true; };
  }, [user?.role, user?._id, section]);

  const toggleSidebar = () => setMobileOpen(!mobileOpen);
  const closeSidebar = () => setMobileOpen(false);

  const renderOverview = () => (
    <div className="space-y-10">
      {/* Unapproved Supplier Banner */}
      {user?.role === 'supplier' && !user?.isApproved && (
        <div className="bg-[#FF9500]/10 border border-[#FF9500]/20 rounded-[22px] p-6 flex items-start gap-4 animate-apple shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#FF9500] flex items-center justify-center text-white text-xl flex-shrink-0">
            <i className="bi bi-hourglass-split" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#1d1d1f] uppercase tracking-widest mb-1">Account Pending Approval</h3>
            <p className="text-[#86868b] text-sm leading-relaxed font-medium">Your supplier account is awaiting admin verification. You can set up your profile, but listing creation will be enabled once approved.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1d1d1f] tracking-tight mb-2">Welcome back, {user?.name?.split(' ')[0] || 'User'}</h1>
          <p className="text-[#86868b] text-lg">Here's what is happening with your {user?.role === 'supplier' ? 'marketplace' : 'account'} today.</p>
        </div>
        <button className="btn-primary flex items-center gap-2 shadow-lg shadow-blue-500/20">
          <i className="bi bi-cloud-download" />
          Export Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatsCard 
          loading={loading} 
          title={user?.role === 'supplier' ? "Total Leads" : "Sent Inquiries"} 
          value={user?.role === 'supplier' ? stats?.totalLeads : stats?.totalInquiries || "0"} 
          trend="+10%" 
          icon="bi-people" 
          colorClass="primary" 
        />
        <StatsCard 
          loading={loading} 
          title={user?.role === 'supplier' ? "Active Listings" : "Saved Listings"} 
          value={user?.role === 'supplier' ? stats?.activeListings : stats?.totalSaved || "0"} 
          trend="+5%" 
          icon="bi-card-list" 
          colorClass="success" 
        />
        <StatsCard 
          loading={loading} 
          title={user?.role === 'supplier' ? "New Today" : "Market Listings"} 
          value={user?.role === 'supplier' ? stats?.newLeadsToday : stats?.marketListings || "0"} 
          trend="+2%" 
          icon="bi-chat-dots" 
          colorClass="warning" 
        />
        <StatsCard 
          loading={loading} 
          title={user?.role === 'supplier' ? "Total Listings" : "Account Status"} 
          value={user?.role === 'supplier' ? (stats?.totalListings || "0") : "Active"} 
          trend={user?.role === 'supplier' ? "+0%" : "Verified"} 
          icon="bi-box" 
          colorClass="info" 
        />
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <DashboardChart loading={loading} data={stats?.chartData} planUsage={stats?.planUsage} />
        </div>
        <div>
          <ActivityFeed loading={loading} activities={stats?.activity} />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-black/[0.03]">
        {user?.role === 'supplier' ? (
          <LeadsTable loading={loading} />
        ) : (
          <BuyerInquiries />
        )}
      </div>
    </div>
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
    <div className="min-h-screen bg-[#F5F5F7] flex">
      <Sidebar 
        mobileOpen={mobileOpen} 
        closeMobileSidebar={closeSidebar} 
        stats={stats} 
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden lg:pl-0">
        <Topbar toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
           <div className="max-w-7xl mx-auto">
             {renderSection()}
           </div>
        </main>
      </div>
    </div>
  );
}
