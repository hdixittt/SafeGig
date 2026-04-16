import React, { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import Overview      from './admin/Overview';
import Workers       from './admin/Workers';
import Policies      from './admin/Policies';
import PricingEngine from './admin/PricingEngine';
import TriggerMonitor from './admin/TriggerMonitor';
import Claims        from './admin/Claims';
import Fraud         from './admin/Fraud';
import Payouts       from './admin/Payouts';
import Heatmap       from './admin/Heatmap';
import MLHealth      from './admin/MLHealth';
import Notifications from './admin/Notifications';
import Reports       from './admin/Reports';
import Roles         from './admin/Roles';
import Analytics     from './admin/Analytics';

const TABS = {
  overview:      Overview,
  workers:       Workers,
  policies:      Policies,
  pricing:       PricingEngine,
  triggers:      TriggerMonitor,
  claims:        Claims,
  fraud:         Fraud,
  payouts:       Payouts,
  heatmap:       Heatmap,
  mlhealth:      MLHealth,
  notifications: Notifications,
  reports:       Reports,
  roles:         Roles,
  analytics:     Analytics,
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const Tab = TABS[activeTab] || Overview;

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-auto">
        <div className="topbar-premium px-8 py-4 sticky top-0 z-10 flex items-center justify-between">
          <div>
            <h1 className="text-base coverly-brand" style={{ color: 'var(--text-1)' }}>Coverly Admin</h1>
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>Guidewire DEVTrails 2026 · Operations Portal</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ background: 'rgba(74,74,74,0.12)', border: '1px solid rgba(74,74,74,0.25)' }}>
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-bold" style={{ color: '#4A4A4A' }}>Live</span>
          </div>
        </div>
        <div className="p-8">
          <Tab />
        </div>
      </main>
    </div>
  );
}
