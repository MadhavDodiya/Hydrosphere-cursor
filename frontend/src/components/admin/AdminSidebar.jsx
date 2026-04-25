import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, Badge } from '../ui';

export default function AdminSidebar({ mobileOpen, closeMobileSidebar, stats }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Platform Overview', icon: 'bi-speedometer2', path: '/admin' },
    { label: 'User Management', icon: 'bi-people-fill', path: '/admin/users' },
    { label: 'Marketplace Audit', icon: 'bi-list-check', path: '/admin/listings' },
    { label: 'Supplier Verification', icon: 'bi-shield-check-fill', path: '/admin/verify', badge: stats?.pendingVerifications > 0 ? stats.pendingVerifications : null },
    { label: 'Inquiry Monitor', icon: 'bi-chat-square-dots-fill', path: '/admin/inquiries' },
    { label: 'Contact Messages', icon: 'bi-envelope-paper-fill', path: '/admin/contacts', badge: stats?.unreadContacts > 0 ? stats.unreadContacts : null },
    { label: 'Global Analytics', icon: 'bi-bar-chart-fill', path: '/admin/analytics' },
  ];

  return (
    <>
      <div 
        className={`fixed inset-0 bg-[#1d1d1f]/60 backdrop-blur-md z-40 transition-opacity lg:hidden ${mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={closeMobileSidebar} 
      />

      <aside className={`fixed inset-y-0 left-0 w-72 bg-[#1d1d1f] text-white z-50 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          
          {/* Brand */}
          <div className="flex items-center gap-3 px-2 mb-10">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#1d1d1f] font-black text-xl shadow-lg">
              H
            </div>
            <div className="flex flex-col">
               <span className="text-lg font-black tracking-tight leading-none">HydroSphere</span>
               <span className="text-[10px] font-black text-[#0071E3] uppercase tracking-widest mt-1">Super Admin</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-grow space-y-1.5">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] px-3 mb-4">System Controls</p>
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) => `
                  flex items-center justify-between px-3 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 group
                  ${isActive ? 'bg-[#0071E3] text-white shadow-lg shadow-blue-500/40' : 'text-white/50 hover:bg-white/5 hover:text-white'}
                `}
                onClick={closeMobileSidebar}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg transition-colors ${location.pathname === item.path ? 'bg-white/20' : 'bg-white/5 text-white/40 group-hover:bg-[#0071E3]/20 group-hover:text-white'}`}>
                    <i className={`bi ${item.icon}`} />
                  </div>
                  {item.label}
                </div>
                {item.badge && <Badge variant="primary" className="!bg-red-500 !text-white !border-none !px-2">{item.badge}</Badge>}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-white/5">
             <Button variant="ghost" className="w-full justify-start gap-3 text-white/60 hover:bg-white/5 hover:text-red-400" onClick={handleLogout}>
               <i className="bi bi-power" /> Exit Panel
             </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
