import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, Badge } from '../ui';

export const Sidebar = ({ mobileOpen, closeMobileSidebar, stats }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = user?.role === 'supplier' ? [
    { label: 'Overview', icon: 'bi-grid-fill', path: '/dashboard' },
    { label: 'My Listings', icon: 'bi-box-seam-fill', path: '/dashboard/my-listings' },
    { label: 'Leads', icon: 'bi-person-badge-fill', path: '/dashboard/leads', badge: stats?.newLeadsToday > 0 ? stats.newLeadsToday : null },
    { label: 'Inquiries', icon: 'bi-chat-left-dots-fill', path: '/dashboard/inquiries' },
    { label: 'Billing', icon: 'bi-credit-card-fill', path: '/dashboard/billing' },
  ] : [
    { label: 'Overview', icon: 'bi-grid-fill', path: '/dashboard' },
    { label: 'Saved Items', icon: 'bi-bookmark-fill', path: '/dashboard/saved' },
    { label: 'Inquiries', icon: 'bi-chat-left-dots-fill', path: '/dashboard/inquiries' },
    { label: 'Billing', icon: 'bi-credit-card-fill', path: '/dashboard/billing' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-[#1d1d1f]/40 backdrop-blur-sm z-40 transition-opacity lg:hidden ${mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={closeMobileSidebar} 
      />

      <aside className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-black/5 z-50 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          
          {/* Brand */}
          <div className="flex items-center gap-3 px-2 mb-10">
            <div className="w-10 h-10 bg-[#0071E3] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">
              H
            </div>
            <span className="text-xl font-black text-[#1d1d1f] tracking-tight">HydroSphere</span>
          </div>

          {/* Navigation */}
          <nav className="flex-grow space-y-1.5">
            <p className="text-[10px] font-black text-[#86868b] uppercase tracking-[0.2em] px-3 mb-4">Main Menu</p>
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                className={({ isActive }) => `
                  flex items-center justify-between px-3 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 group
                  ${isActive ? 'bg-[#0071E3] text-white shadow-lg shadow-blue-500/20' : 'text-[#86868b] hover:bg-black/[0.03] hover:text-[#1d1d1f]'}
                `}
                onClick={closeMobileSidebar}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg transition-colors ${location.pathname === item.path ? 'bg-white/20' : 'bg-black/[0.03] text-[#86868b] group-hover:bg-[#0071E3]/10 group-hover:text-[#0071E3]'}`}>
                    <i className={`bi ${item.icon}`} />
                  </div>
                  {item.label}
                </div>
                {item.badge && <Badge variant="primary" className="!bg-red-500 !text-white !border-none">{item.badge}</Badge>}
              </NavLink>
            ))}
          </nav>

          {/* User Profile / Bottom */}
          <div className="mt-auto pt-6 border-t border-black/5">
            <div className="bg-[#f5f5f7] rounded-[24px] p-4 flex items-center gap-3 mb-4 border border-black/[0.02]">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#1d1d1f] font-black border border-black/5 shadow-sm">
                {(user?.name || 'U')[0]}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-[#1d1d1f] truncate">{user?.name}</p>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-bold text-[#86868b] uppercase tracking-widest">{user?.role}</p>
                  {user?.plan && (
                    <Badge variant="primary" className="!py-0 !px-1.5 !text-[8px] !font-black uppercase tracking-tighter !border-none !bg-[#0071E3]/10 !text-[#0071E3]">
                      {user.plan}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-start gap-3 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right" /> Log Out
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};
