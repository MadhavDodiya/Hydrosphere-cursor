import React, { useState, useEffect } from "react";
import api from "../services/api.js";
import AdminSidebar from "../components/admin/AdminSidebar.jsx";
import AdminTopbar from "../components/admin/AdminTopbar.jsx";

// Sections
import AdminOverview from "../components/admin/sections/AdminOverview.jsx";
import UserManagement from "../components/admin/sections/UserManagement.jsx";
import ListingsManagement from "../components/admin/sections/ListingsManagement.jsx";
import SupplierVerification from "../components/admin/sections/SupplierVerification.jsx";
import InquiryMonitor from "../components/admin/sections/InquiryMonitor.jsx";
import ContactMessages from "../components/admin/sections/ContactMessages.jsx";
import AdminAnalytics from "../components/admin/sections/AdminAnalytics.jsx";

export default function AdminDashboard({ section = "overview" }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [stats, setStats] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await api.get("/api/admin/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching admin stats:", err);
    }
  };

  useEffect(() => {
    fetchStats();
    window.scrollTo(0, 0);
  }, [section]);

  const renderSection = () => {
    switch (section) {
      case "overview":   return <AdminOverview stats={stats} refreshStats={fetchStats} />;
      case "users":      return <UserManagement />;
      case "listings":   return <ListingsManagement />;
      case "verify":     return <SupplierVerification refreshStats={fetchStats} />;
      case "inquiries":  return <InquiryMonitor />;
      case "contacts":   return <ContactMessages />;
      case "analytics":  return <AdminAnalytics />;
      default:           return <AdminOverview stats={stats} refreshStats={fetchStats} />;
    }
  };

  const getSectionTitle = () => {
    switch (section) {
      case "overview":   return "Admin Overview";
      case "users":      return "User Management";
      case "listings":   return "Listings Management";
      case "verify":     return "Supplier Verification";
      case "inquiries":  return "Inquiry Monitor";
      case "contacts":   return "Contact Messages";
      case "analytics":  return "Platform Analytics";
      default:           return "Super Admin Panel";
    }
  };

  return (
    <div className="admin-layout min-vh-100 bg-light">
      {/* Sidebar - Pass pending counts for badges */}
      <AdminSidebar 
        mobileOpen={mobileOpen} 
        closeMobileSidebar={() => setMobileOpen(false)} 
        stats={stats}
      />

      {/* Main Content */}
      <div className="main-content" style={{ marginLeft: 260, transition: "margin 0.3s ease" }}>
        <AdminTopbar toggleSidebar={() => setMobileOpen(true)} sectionName={getSectionTitle()} />
        
        <main className="p-4">
          <div className="container-fluid p-0">
            {renderSection()}
          </div>
        </main>
      </div>

      <style jsx="true">{`
        @media (max-width: 991.98px) {
          .main-content { margin-left: 0 !important; }
        }
        .admin-layout { font-family: 'Inter', sans-serif; }
      `}</style>
    </div>
  );
}
