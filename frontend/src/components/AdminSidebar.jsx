import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, LayoutDashboard, LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const nav = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview' },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const logout = () => { localStorage.removeItem('admin_token'); navigate('/admin/login'); };

  return (
    <motion.aside
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="sidebar-premium w-60 flex-shrink-0 flex flex-col h-screen sticky top-0"
    >
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}>
          <ShieldCheck size={18} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="font-black text-lg tracking-tight" style={{ color: 'var(--text-1)' }}>SafeGig</span>
        <span className="ml-auto text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide"
          style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
          Admin
        </span>
      </div>

      {/* User card */}
      <div className="mx-3 mt-4 mb-2 p-4 rounded-2xl"
        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white"
            style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}>
            A
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>Admin</p>
            <p className="text-xs" style={{ color: 'rgba(239,68,68,0.8)' }}>admin@safegig.demo</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            end
            to={to}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <ThemeToggle className="w-full justify-start" />
        <button
          onClick={logout}
          className="sidebar-item w-full text-left"
          style={{ color: 'rgba(255,255,255,0.5)' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.background = ''; }}
        >
          <LogOut size={17} />
          <span>Logout</span>
        </button>
      </div>
    </motion.aside>
  );
}
