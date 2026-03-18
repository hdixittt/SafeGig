import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Shield, LogOut, Sparkles } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
];

export default function Sidebar({ worker }) {
  const navigate = useNavigate();
  const logout = () => { 
    localStorage.removeItem('sb_token'); 
    localStorage.removeItem('worker_id'); 
    navigate('/login'); 
  };

  return (
    <motion.aside 
      initial={{x:-80,opacity:0}} 
      animate={{x:0,opacity:1}} 
      transition={{duration:0.5,ease:[0.6,0.05,0.01,0.9]}}
      className="sidebar-premium w-72 flex-shrink-0 flex flex-col h-screen sticky top-0"
    >
      {/* Logo */}
      <div className="px-6 py-8 border-b border-white/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600 shadow-xl">
            <Shield size={24} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-2xl font-black text-white block">SafeGig</span>
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Worker</span>
          </div>
        </div>
      </div>

      {/* Worker Profile */}
      {worker && (
        <div className="px-6 py-6 border-b border-white/10">
          <div className="glass-card p-4 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black text-white bg-gradient-to-br from-orange-500 to-orange-600">
                {worker.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black truncate" style={{ color: 'var(--text-1)' }}>{worker.name}</p>
                <p className="text-xs font-semibold" style={{ color: 'var(--text-2)' }}>{worker.platform}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500/10">
              <Sparkles size={12} className="text-orange-400" />
              <span className="text-xs font-bold text-orange-400">{worker.city}</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-6 py-6 space-y-2">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <Icon size={20} strokeWidth={2.5} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout + Theme */}
      <div className="p-6 border-t border-white/10 space-y-2">
        <ThemeToggle className="w-full justify-start px-3" />
        <button 
          onClick={logout} 
          className="sidebar-item w-full text-left hover:!bg-red-500/10 hover:!text-red-400 hover:!border-red-500/30"
        >
          <LogOut size={20} strokeWidth={2.5} />
          <span>Logout</span>
        </button>
      </div>
    </motion.aside>
  );
}
