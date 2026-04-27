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
        const endpoint = user?.role === 'supplier' ? '/api/supplier/stats' : '/api/users/stats';
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="animate-apple">
          <Badge variant="primary" className="mb-4">Live Insights</Badge>
          <h1 className="text-4xl md:text-5xl font-black text-[#1d1d1f] tracking-tight mb-2">
            Welcome back, <span className="text-[#0071E3]">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-[#86868b] font-medium text-lg">Your hydrogen trade overview for today.</p>
        </div>
        <div className="flex items-center gap-3 animate-apple delay-100">
          <Button variant="secondary" className="gap-2">
            <i className="bi bi-download" /> Export Reports
          </Button>
          {user?.role === 'supplier' && (
            <Button className="gap-2 shadow-2xl shadow-blue-500/30" onClick={() => window.location.href='/add-listing'}>
              <i className="bi bi-plus-lg" /> New Asset
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
           <Card className="p-0 overflow-hidden group">
              <div className="p-8 border-b border-black/[0.03] flex justify-between items-center bg-white">
                <div>
                  <h3 className="text-sm font-black text-[#1d1d1f] uppercase tracking-widest">Market Performance</h3>
                  <p className="text-xs text-[#86868b] font-medium mt-1">Real-time demand visualization</p>
                </div>
                <div className="flex gap-2">
                  <div className="px-3 py-1 bg-black/[0.03] rounded-full text-[10px] font-black text-[#86868b]">7 DAYS</div>
                  <div className="px-3 py-1 bg-[#0071E3]/5 rounded-full text-[10px] font-black text-[#0071E3]">30 DAYS</div>
                </div>
              </div>
              <div className="p-12 flex flex-col items-center justify-center text-center bg-[#fbfbfd]">
                <div className="w-20 h-20 bg-white rounded-[24px] shadow-2xl shadow-black/[0.05] flex items-center justify-center text-[#0071E3] text-3xl mb-8 group-hover:scale-110 transition-transform duration-500">
                  <i className="bi bi-graph-up-arrow" />
                </div>
                <h3 className="text-xl font-black text-[#1d1d1f] mb-2 tracking-tight">Activity Scaling</h3>
                <p className="text-[#86868b] font-medium max-w-sm text-sm leading-relaxed">
                  Advanced visualizations of your hydrogen trade activity will appear here as your marketplace footprint grows.
                </p>
              </div>
           </Card>
        </div>
        
        <div className="space-y-8">
           <Card className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black text-[#1d1d1f] uppercase tracking-widest">Recent Activity</h3>
                <i className="bi bi-arrow-right text-[#86868b] text-xs" />
              </div>
              <div className="space-y-8">
                 {(stats?.activity || [
                   { title: 'Welcome to HydroSphere', desc: 'Your account is now active and ready for trade.', time: '1m ago', icon: 'bi-rocket-takeoff-fill' },
                   { title: 'Profile Optimized', desc: 'Added HQ location and verified tax ID.', time: '2h ago', icon: 'bi-check-circle-fill' }
                 ]).map((act, i) => (
                   <div key={i} className="flex gap-5 group relative">
                      {i !== (stats?.activity?.length || 2) - 1 && (
                        <div className="absolute top-10 left-4 bottom-0 w-px bg-black/[0.05] -mb-8" />
                      )}
                      <div className="w-9 h-9 rounded-xl bg-black/[0.03] flex items-center justify-center text-sm text-[#1d1d1f] group-hover:bg-[#0071E3] group-hover:text-white transition-all duration-300 z-10 flex-shrink-0">
                        <i className={`bi ${act.icon || 'bi-lightning-fill'}`} />
                      </div>
                      <div>
                         <p className="text-sm font-black text-[#1d1d1f] mb-0.5">{act.title}</p>
                         <p className="text-xs text-[#86868b] font-medium mb-1.5 leading-relaxed">{act.desc}</p>
                         <p className="text-[9px] text-[#c1c1c6] font-black uppercase tracking-widest">{act.time}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </Card>

           {user?.role === 'supplier' && stats?.limits && (
             <Card className="p-0 overflow-hidden border-[#0071E3]/20 shadow-2xl shadow-blue-500/5">
                <div className="p-8 bg-gradient-to-br from-[#0071E3] to-[#00D1B2]">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-black text-white/80 uppercase tracking-[0.2em]">Current Tier</h3>
                    <Badge variant="primary" className="!bg-white !text-[#0071E3] !border-none !py-0.5 !px-2 !text-[9px]">
                       {stats.limits.planName}
                    </Badge>
                  </div>
                  <h4 className="text-2xl font-black text-white tracking-tight">Account Usage</h4>
                </div>
                
                <div className="p-8 space-y-8 bg-white">
                   <div className="space-y-3">
                      <div className="flex justify-between items-end">
                         <div className="space-y-1">
                            <span className="text-[10px] font-black text-[#86868b] uppercase tracking-widest">Active Assets</span>
                            <p className="text-sm font-black text-[#1d1d1f]">{stats.limits.listingsUsed} <span className="text-[#86868b] font-medium">/ {stats.limits.listingsLimit || '∞'}</span></p>
                         </div>
                         <span className="text-[10px] font-black text-[#0071E3] bg-[#0071E3]/5 px-2 py-0.5 rounded-md">
                            {Math.round((stats.limits.listingsUsed / (stats.limits.listingsLimit || 100)) * 100)}%
                         </span>
                      </div>
                      <div className="h-1.5 w-full bg-black/[0.03] rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-[#0071E3] rounded-full transition-all duration-1000 ease-out" 
                           style={{ width: `${Math.min(100, (stats.limits.listingsUsed / (stats.limits.listingsLimit || 100)) * 100)}%` }} 
                         />
                      </div>
                   </div>

                   <div className="space-y-3">
                      <div className="flex justify-between items-end">
                         <div className="space-y-1">
                            <span className="text-[10px] font-black text-[#86868b] uppercase tracking-widest">Monthly Inquiries</span>
                            <p className="text-sm font-black text-[#1d1d1f]">{stats.limits.leadsUsed} <span className="text-[#86868b] font-medium">/ {stats.limits.leadsLimit || '∞'}</span></p>
                         </div>
                         <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-md">
                            {Math.round((stats.limits.leadsUsed / (stats.limits.leadsLimit || 100)) * 100)}%
                         </span>
                      </div>
                      <div className="h-1.5 w-full bg-black/[0.03] rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-green-500 rounded-full transition-all duration-1000 ease-out" 
                           style={{ width: `${Math.min(100, (stats.limits.leadsUsed / (stats.limits.leadsLimit || 100)) * 100)}%` }} 
                         />
                      </div>
                   </div>

                   {stats.limits.trialExpiresAt && (
                     <div className="pt-6 border-t border-black/[0.03] flex items-center justify-between">
                        <div>
                           <p className="text-[9px] font-black text-[#86868b] uppercase tracking-widest mb-0.5">Trial Status</p>
                           <p className="text-xs font-bold text-[#1d1d1f]">
                              Expires in <span className="text-[#0071E3]">{Math.ceil((new Date(stats.limits.trialExpiresAt) - new Date()) / (1000 * 60 * 60 * 24))} days</span>
                           </p>
                        </div>
                        <i className="bi bi-clock-history text-[#c1c1c6]" />
                     </div>
                   )}

                   <Button variant="primary" className="w-full mt-2 !py-4 shadow-xl shadow-blue-500/10" onClick={() => window.location.href='/pricing'}>
                      Upgrade Infrastructure
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
