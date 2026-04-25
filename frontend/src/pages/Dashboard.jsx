import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/dashboard/Sidebar.jsx';
import Topbar from '../components/dashboard/Topbar.jsx';
import StatsCard from '../components/dashboard/StatsCard.jsx';
import { Button, Card, Badge } from '../components/ui';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axiosInstance';
import { useToast } from '../context/ToastContext.jsx';

// Sections
import MyListings from '../components/dashboard/MyListings.jsx';
import BuyerInquiries from '../components/dashboard/BuyerInquiries.jsx';
import SavedListings from '../components/dashboard/SavedListings.jsx';
import Billing from '../components/dashboard/Billing.jsx';
import LeadsTable from '../components/dashboard/LeadsTable.jsx';

export default function Dashboard({ section = 'overview' }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      try {
        setLoading(true);
        const endpoint = user?.role === 'supplier' ? '/supplier/stats' : '/users/stats';
        const response = await api.get(endpoint);
        setStats(response.data);
      } catch (err) {
        console.error('Error fetching stats:', err);
        showToast(err.response?.data?.message || 'Failed to load dashboard', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    window.scrollTo(0, 0);
  }, [user?.role, user?._id, section]);

  const renderOverview = () => (
    <div className="space-y-10 animate-apple">
      {/* Supplier Status Alert */}
      {user?.role === 'supplier' && !user?.isApproved && (
        <Card className="bg-[#FF9500]/5 border-[#FF9500]/20 p-6 flex items-start gap-4" hover={false}>
          <div className="w-10 h-10 rounded-xl bg-[#FF9500] flex items-center justify-center text-white flex-shrink-0">
            <i className="bi bi-shield-lock" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#1d1d1f] uppercase tracking-widest mb-1">Account Pending Approval</h3>
            <p className="text-[#86868b] text-sm font-medium leading-relaxed">Your supplier account is awaiting admin verification. You can set up your profile, but listing creation will be enabled once approved.</p>
          </div>
        </Card>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Badge variant="primary" className="mb-4">Live Dashboard</Badge>
          <h1 className="text-4xl font-black text-[#1d1d1f] tracking-tight mb-2">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="text-[#86868b] font-medium text-lg">Here's what's happening with your energy marketplace today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="gap-2">
            <i className="bi bi-download" /> Export
          </Button>
          {user?.role === 'supplier' && (
            <Button className="gap-2 shadow-xl shadow-blue-500/30" onClick={() => window.location.href='/add-listing'}>
              <i className="bi bi-plus-lg" /> New Listing
            </Button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          loading={loading} 
          title={user?.role === 'supplier' ? "Total Leads" : "Sent Inquiries"} 
          value={user?.role === 'supplier' ? stats?.totalLeads : stats?.totalInquiries || "0"} 
          trend="+12%" 
          icon="bi-people-fill" 
          colorClass="primary" 
        />
        <StatsCard 
          loading={loading} 
          title={user?.role === 'supplier' ? "Active Listings" : "Saved Listings"} 
          value={user?.role === 'supplier' ? stats?.activeListings : stats?.totalSaved || "0"} 
          trend="+5.4%" 
          icon="bi-box-seam-fill" 
          colorClass="success" 
        />
        <StatsCard 
          loading={loading} 
          title="Profile Views" 
          value={stats?.profileViews || "1.2k"} 
          trend="+22%" 
          icon="bi-eye-fill" 
          colorClass="warning" 
        />
        <StatsCard 
          loading={loading} 
          title="Account Status" 
          value={user?.isVerified ? "Verified" : "Standard"} 
          trend="Active" 
          icon="bi-patch-check-fill" 
          colorClass="info" 
        />
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <Card className="p-8 h-full min-h-[400px] flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-[#F5F5F7] rounded-full flex items-center justify-center text-[#86868b] text-3xl mb-6">
                <i className="bi bi-graph-up" />
              </div>
              <h3 className="text-xl font-black text-[#1d1d1f] mb-2">Performance Analytics</h3>
              <p className="text-[#86868b] font-medium max-w-sm">Detailed visualization of your hydrogen trade activity will appear here as your data scales.</p>
           </Card>
        </div>
        <div className="space-y-8">
           <Card className="p-8">
              <h3 className="text-sm font-black text-[#1d1d1f] uppercase tracking-widest mb-6">Recent Activity</h3>
              <div className="space-y-6">
                 {(stats?.activity || [
                   { title: 'Welcome to HydroSphere', desc: 'Your account is now active.', time: '1m ago' },
                   { title: 'Profile Updated', desc: 'Added HQ location and tax ID.', time: '2h ago' }
                 ]).map((act, i) => (
                   <div key={i} className="flex gap-4 group">
                      <div className="w-1.5 h-1.5 bg-[#0071E3] rounded-full mt-1.5 flex-shrink-0 group-hover:scale-150 transition-transform" />
                      <div>
                         <p className="text-sm font-black text-[#1d1d1f] mb-0.5">{act.title}</p>
                         <p className="text-xs text-[#86868b] font-medium mb-1">{act.desc}</p>
                         <p className="text-[10px] text-[#c1c1c6] font-bold uppercase tracking-wider">{act.time}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </Card>

           {user?.role === 'supplier' && stats?.limits && (
             <Card className="p-8 border-[#0071E3]/20 bg-[#0071E3]/5">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-sm font-black text-[#1d1d1f] uppercase tracking-widest">Plan & Usage</h3>
                   <Badge variant="primary" className="!bg-[#0071E3] !text-white !border-none">
                      {stats.limits.planName}
                   </Badge>
                </div>
                
                <div className="space-y-6">
                   <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                         <span className="text-[#86868b]">Listings</span>
                         <span className="text-[#1d1d1f]">{stats.limits.listingsUsed} / {stats.limits.listingsLimit || '∞'}</span>
                      </div>
                      <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-[#0071E3] rounded-full transition-all duration-1000" 
                           style={{ width: `${Math.min(100, (stats.limits.listingsUsed / (stats.limits.listingsLimit || 100)) * 100)}%` }} 
                         />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                         <span className="text-[#86868b]">Monthly Leads</span>
                         <span className="text-[#1d1d1f]">{stats.limits.leadsUsed} / {stats.limits.leadsLimit || '∞'}</span>
                      </div>
                      <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-green-500 rounded-full transition-all duration-1000" 
                           style={{ width: `${Math.min(100, (stats.limits.leadsUsed / (stats.limits.leadsLimit || 100)) * 100)}%` }} 
                         />
                      </div>
                   </div>

                   {stats.limits.trialExpiresAt && (
                     <div className="pt-4 border-t border-black/5">
                        <p className="text-[10px] font-black text-[#86868b] uppercase tracking-widest mb-1">Trial Status</p>
                        <p className="text-xs font-bold text-[#1d1d1f]">
                           Expires in <span className="text-[#0071E3]">{Math.ceil((new Date(stats.limits.trialExpiresAt) - new Date()) / (1000 * 60 * 60 * 24))} days</span>
                        </p>
                     </div>
                   )}

                   <Button variant="primary" className="w-full mt-4" onClick={() => window.location.href='/pricing'}>
                      Upgrade Plan
                   </Button>
                </div>
             </Card>
           )}
        </div>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (section) {
      case 'overview':     return renderOverview();
      case 'my-listings':  return <MyListings />;
      case 'leads':        return <LeadsTable />;
      case 'inquiries':    return <BuyerInquiries />;
      case 'saved':        return <SavedListings />;
      case 'billing':      return <Billing />;
      default:             return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex overflow-hidden">
      <Sidebar 
        mobileOpen={mobileOpen} 
        closeMobileSidebar={() => setMobileOpen(false)} 
        stats={stats} 
      />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Topbar toggleSidebar={() => setMobileOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
           <div className="max-w-7xl mx-auto pb-20">
             {renderSection()}
           </div>
        </main>
      </div>
    </div>
  );
}
