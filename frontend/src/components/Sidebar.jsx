import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, LogOut, Sparkles, CreditCard, Gift, HelpCircle, Phone } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import CoverlyLogo from './CoverlyLogo';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '../context/LanguageContext';

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
  { to: '/plans',     icon: CreditCard,      labelKey: 'plans' },
  { to: '/bonus',     icon: Gift,            labelKey: 'bonusDashboard' },
  { to: '/faq',       icon: HelpCircle,      labelKey: 'faqs' },
  { to: '/support',   icon: Phone,           labelKey: 'customerCare' },
];

export default function Sidebar({ worker }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const logout = () => {
    localStorage.removeItem('sb_token');
    localStorage.removeItem('worker_id');
    navigate('/login');
  };

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="sidebar-premium w-[268px] flex-shrink-0 flex flex-col h-screen sticky top-0"
    >
      {/* Logo area — generous breathing room */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center gap-3.5">
          <div className="float-anim flex-shrink-0" style={{
            width: 46, height: 46,
            borderRadius: '14px 18px 14px 18px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CoverlyLogo size={32} />
          </div>
          <div>
            <span className="text-xl coverly-brand text-white block leading-tight">Coverly</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(173,187,218,0.6)' }}>
              {t('worker')}
            </span>
          </div>
        </div>
      </div>

      {/* Soft divider */}
      <div className="mx-5 mb-4" style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />

      {/* Worker profile — warm, personal */}
      {worker && (
        <div className="mx-4 mb-5 px-4 py-4 rounded-2xl" style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.09)',
        }}>
          <div className="flex items-center gap-3 mb-3">
            {/* Avatar — organic shape */}
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-sm font-black text-white"
              style={{
                borderRadius: '12px 14px 10px 14px',
                background: 'linear-gradient(140deg, #5B6FD4, #7091E6)',
                boxShadow: '0 4px 12px rgba(112,145,230,0.3)',
              }}>
              {worker.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate leading-tight">{worker.name}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(173,187,218,0.65)' }}>{worker.platform}</p>
            </div>
          </div>
          {/* City pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{
            background: 'rgba(112,145,230,0.12)',
            border: '1px solid rgba(112,145,230,0.18)',
          }}>
            <Sparkles size={10} style={{ color: '#7091E6' }} />
            <span className="text-xs font-semibold" style={{ color: 'rgba(173,187,218,0.8)' }}>{worker.city}</span>
          </div>
        </div>
      )}

      {/* Navigation — spacious, not cramped */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {nav.map(({ to, icon: Icon, labelKey }, i) => (
          <motion.div
            key={to}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.06, duration: 0.4 }}
          >
            <NavLink to={to} className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
              <Icon size={17} strokeWidth={2.2} />
              <span>{t(labelKey)}</span>
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Footer — language, theme, logout */}
      <div className="px-3 pt-4 pb-5 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="px-2 pb-2">
          <LanguageSelector />
        </div>
        <ThemeToggle />
        <button
          onClick={logout}
          className="sidebar-item w-full text-left"
          style={{ color: 'rgba(173,187,218,0.65)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#fca5a5'; }}
          onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(173,187,218,0.65)'; }}
        >
          <LogOut size={16} strokeWidth={2.2} />
          <span>{t('logout')}</span>
        </button>
      </div>
    </motion.aside>
  );
}
