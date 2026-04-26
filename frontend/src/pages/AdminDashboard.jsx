import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar.jsx';
import AdminTopbar from '../components/admin/AdminTopbar.jsx';
import api from '../api/axiosInstance';

// Sections
import AdminOverview from '../components/admin/sections/AdminOverview.jsx';
import UserManagement from '../components/admin/sections/UserManagement.jsx';
import ListingsManagement from '../components/admin/sections/ListingsManagement.jsx';
import SupplierVerification from '../components/admin/sections/SupplierVerification.jsx';
import InquiryMonitor from '../components/admin/sections/InquiryMonitor.jsx';
import ContactMessages from '../components/admin/sections/ContactMessages.jsx';
import AdminAnalytics from '../components/admin/sections/AdminAnalytics.jsx';

export default function AdminDashboard({ section = 'overview' }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    window.scrollTo(0, 0);
  }, [section]);

  const renderSection = () => {
    switch (section) {
      case 'overview':   return <AdminOverview stats={stats} refreshStats={fetchStats} />;
      case 'users':      return <UserManagement />;
      case 'listings':   return <ListingsManagement />;
      case 'verify':     return <SupplierVerification refreshStats={fetchStats} />;
      case 'inquiries':  return <InquiryMonitor />;
      case 'contacts':   return <ContactMessages />;
      case 'analytics':  return <AdminAnalytics />;
      default:           return <AdminOverview stats={stats} refreshStats={fetchStats} />;
    }
  };

  const getSectionTitle = () => {
    switch (section) {
      case 'overview':   return 'Platform Overview';
      case 'users':      return 'User Management';
      case 'listings':   return 'Marketplace Audit';
      case 'verify':     return 'Supplier Verification';
      case 'inquiries':  return 'Inquiry Monitor';
      case 'contacts':   return 'Contact Messages';
      case 'analytics':  return 'Platform Analytics';
      default:           return 'Admin Panel';
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex overflow-hidden">
      <AdminSidebar 
        mobileOpen={mobileOpen} 
        closeMobileSidebar={() => setMobileOpen(false)} 
        stats={stats}
      />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <AdminTopbar 
          toggleSidebar={() => setMobileOpen(true)} 
          sectionName={getSectionTitle()} 
        />
        
        <main className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
           <div className="max-w-7xl mx-auto pb-20">
             {loading && !stats ? (
               <div className="flex items-center justify-center h-64">
                  <div className="w-10 h-10 border-4 border-black/5 border-t-[#0071E3] rounded-full animate-spin" />
               </div>
             ) : (
               <div className="animate-apple">
                 {renderSection()}
               </div>
             )}
           </div>
        </main>
      </div>
    </div>
  );
}
