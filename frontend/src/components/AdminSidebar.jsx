import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck, LayoutDashboard, LogOut, Users, FileText, Cpu,
  Zap, AlertTriangle, IndianRupee, Map, Activity, Bell, Download, UserCog, BarChart2
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import CoverlyLogo from './CoverlyLogo';
import LanguageSelector from './LanguageSelector';

const nav = [
  { id: 'overview',      icon: LayoutDashboard, label: 'Overview'           },
  { id: 'workers',       icon: Users,           label: 'Workers'            },
  { id: 'policies',      icon: FileText,        label: 'Policies'           },
  { id: 'pricing',       icon: Cpu,             label: 'Premium Engine'     },
  { id: 'triggers',      icon: Zap,             label: 'Trigger Monitor'    },
  { id: 'claims',        icon: AlertTriangle,   label: 'Claims'             },
  { id: 'fraud',         icon: ShieldCheck,     label: 'Fraud & Risk'       },
  { id: 'payouts',       icon: IndianRupee,     label: 'Payouts'            },
  { id: 'heatmap',       icon: Map,             label: 'Zone Heatmap'       },
  { id: 'mlhealth',      icon: Activity,        label: 'ML Health'          },
  { id: 'notifications', icon: Bell,            label: 'Notifications'      },
  { id: 'reports',       icon: Download,        label: 'Reports'            },
  { id: 'roles',         icon: UserCog,         label: 'Roles & Users'      },
  { id: 'analytics',     icon: BarChart2,       label: 'Predictive Analytics' },
];

export default function AdminSidebar({ activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const logout = () => { localStorage.removeItem('admin_token'); navigate('/admin/login'); };

  return (
    <motion.aside
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="sidebar-premium w-60 flex-shrink-0 flex flex-col h-screen sticky top-0"
    >
      <div className="px-5 py-5 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
          <CoverlyLogo size={28} />
        </div>
        <span className="coverly-brand text-lg text-white">Coverly</span>
        <span className="ml-auto text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide"
          style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
          Admin
        </span>
      </div>

      <div className="mx-3 mt-4 mb-2 p-3 rounded-2xl"
        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white"
            style={{ background: 'linear-gradient(135deg, #ef4444, #7091E6)' }}>A</div>
          <div>
            <p className="text-sm font-bold text-white">Admin</p>
            <p className="text-xs" style={{ color: 'rgba(173,187,218,0.7)' }}>admin@coverly.demo</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {nav.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`sidebar-item w-full text-left ${activeTab === id ? 'active' : ''}`}>
            <Icon size={16} />
            <span className="text-sm">{label}</span>
          </button>
        ))}
      </nav>

      <div className="p-3 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="px-1 pb-1"><LanguageSelector /></div>
        <ThemeToggle className="w-full justify-start" />
        <button onClick={logout} className="sidebar-item w-full text-left hover:!bg-red-500/10 hover:!text-red-400">
          <LogOut size={16} />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </motion.aside>
  );
}
