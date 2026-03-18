import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Users, Shield, AlertTriangle, CloudRain, Thermometer, Wind, Ban,
  CheckCircle, Activity, IndianRupee, TrendingUp, Eye
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import api from '../api';
import AdminSidebar from '../components/AdminSidebar';

const TRIGGER_TYPES = [
  { type: 'heavy_rain',       label: 'Heavy Rain',       icon: CloudRain,   color: '#3b82f6', defaultVal: 65,  unit: 'mm/hr' },
  { type: 'extreme_heat',     label: 'Extreme Heat',     icon: Thermometer, color: '#ef4444', defaultVal: 44,  unit: '°C'    },
  { type: 'severe_pollution', label: 'Severe Pollution', icon: Wind,        color: '#8b5cf6', defaultVal: 320, unit: 'AQI'   },
  { type: 'curfew_strike',    label: 'Curfew / Strike',  icon: Ban,         color: '#f59e0b', defaultVal: 1,   unit: 'flag'  },
];

const payoutData = [
  { name: 'Mon', amount: 450 }, { name: 'Tue', amount: 0 },   { name: 'Wed', amount: 750 },
  { name: 'Thu', amount: 300 }, { name: 'Fri', amount: 900 }, { name: 'Sat', amount: 450 }, { name: 'Sun', amount: 0 },
];
const tierData = [
  { name: 'Low',      value: 30, color: '#22c55e' },
  { name: 'Standard', value: 45, color: '#3b82f6' },
  { name: 'High',     value: 18, color: '#f59e0b' },
  { name: 'Premium',  value: 7,  color: '#ef4444' },
];
const claimTrend = [
  { day: 'Mon', claims: 2 }, { day: 'Tue', claims: 0 }, { day: 'Wed', claims: 5 },
  { day: 'Thu', claims: 3 }, { day: 'Fri', claims: 7 }, { day: 'Sat', claims: 4 }, { day: 'Sun', claims: 1 },
];

const darkTooltipStyle = {
  background: 'rgba(0,0,0,0.85)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  fontSize: '12px',
  color: '#fff',
};

function StatCard({ label, value, icon: Icon, color, sub, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="stat-card-premium"
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
        style={{ background: `${color}18` }}>
        <Icon size={18} style={{ color }} strokeWidth={2} />
      </div>
      <p className="text-2xl font-black mb-1" style={{ color: 'var(--text-1)' }}>{value}</p>
      <p className="text-sm font-semibold" style={{ color: 'var(--text-2)' }}>{label}</p>
      {sub && <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>{sub}</p>}
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [selected, setSelected] = useState(TRIGGER_TYPES[0]);
  const [pinCode, setPinCode]   = useState('400001');
  const [value, setValue]       = useState(65);
  const [result, setResult]     = useState(null);
  const [firing, setFiring]     = useState(false);
  const [log, setLog]           = useState([]);

  const fireTrigger = async () => {
    setFiring(true); setResult(null);
    try {
      const { data } = await api.post('/triggers/mock', {
        type: selected.type, pin_code: pinCode, actual_value: parseFloat(value)
      });
      setResult({ success: true, data });
      setLog(prev => [{ ...data.trigger, ts: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)]);
    } catch (err) {
      setResult({ success: false, error: err.response?.data?.error || 'Failed' });
    } finally { setFiring(false); }
  };

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      <AdminSidebar />

      <main className="flex-1 overflow-auto">
        {/* Topbar */}
        <div className="topbar-premium px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-black" style={{ color: 'var(--text-1)' }}>Admin Dashboard</h1>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                SafeGig Operations · Guidewire DEVTrails 2026
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)' }}>
                <div className="w-2 h-2 rounded-full bg-orange-400 pulse-glow" />
                <span className="text-xs font-bold" style={{ color: '#f97316' }}>Demo Mode</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6 max-w-7xl">
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard label="Total Workers"   value="1"          icon={Users}       color="#3b82f6" delay={0}    sub="Registered" />
            <StatCard label="Active Policies" value="1"          icon={Shield}      color="#22c55e" delay={0.07} sub="This week" />
            <StatCard label="Triggers Fired"  value={log.length} icon={Zap}         color="#f97316" delay={0.14} sub="This session" />
            <StatCard label="Total Payouts"   value="₹2,850"     icon={IndianRupee} color="#8b5cf6" delay={0.21} sub="Mock UPI" />
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-5 gap-5">
            {/* Trigger panel — 3 cols */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card-strong p-6 col-span-3"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(249,115,22,0.15)' }}>
                  <Zap size={16} style={{ color: '#f97316' }} />
                </div>
                <h2 className="font-black text-base" style={{ color: 'var(--text-1)' }}>Fire Parametric Trigger</h2>
                <span className="ml-auto text-xs px-3 py-1 rounded-full font-bold"
                  style={{ background: 'rgba(249,115,22,0.12)', color: '#f97316', border: '1px solid rgba(249,115,22,0.25)' }}>
                  Demo Mode
                </span>
              </div>

              {/* Trigger type selector */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                {TRIGGER_TYPES.map(t => {
                  const Icon = t.icon;
                  const active = selected.type === t.type;
                  return (
                    <button
                      key={t.type}
                      onClick={() => { setSelected(t); setValue(t.defaultVal); }}
                      className="flex items-center gap-2.5 p-3.5 rounded-xl text-sm font-semibold transition-all text-left"
                      style={{
                        background: active ? `${t.color}14` : 'rgba(255,255,255,0.04)',
                        border: `1.5px solid ${active ? t.color + '40' : 'rgba(255,255,255,0.08)'}`,
                        color: active ? t.color : 'rgba(255,255,255,0.5)',
                      }}
                    >
                      <Icon size={15} />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* Inputs */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest mb-2 block"
                    style={{ color: 'var(--text-3)' }}>PIN Code</label>
                  <input
                    value={pinCode}
                    onChange={e => setPinCode(e.target.value)}
                    className="input-premium py-4"
                    placeholder="400001"
                    style={{ fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest mb-2 block"
                    style={{ color: 'var(--text-3)' }}>Value ({selected.unit})</label>
                  <input
                    type="number"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    className="input-premium py-4"
                    style={{ fontSize: '14px' }}
                  />
                </div>
              </div>

              {/* Fire button */}
              <button
                onClick={fireTrigger}
                disabled={firing}
                className="w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 text-white transition-all"
                style={{
                  background: `linear-gradient(135deg, ${selected.color}, ${selected.color}bb)`,
                  boxShadow: `0 8px 24px ${selected.color}30`,
                  opacity: firing ? 0.7 : 1,
                  cursor: firing ? 'not-allowed' : 'pointer',
                }}
              >
                {firing ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Firing...</>
                ) : (
                  <><Zap size={15} />Fire {selected.label}</>
                )}
              </button>

              {/* Result */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 p-4 rounded-xl text-xs font-semibold"
                    style={{
                      background: result.success ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                      border: `1px solid ${result.success ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                    }}
                  >
                    {result.success ? (
                      <span className="flex items-center gap-2" style={{ color: '#4ade80' }}>
                        <CheckCircle size={13} />
                        Trigger fired — ID: {result.data?.trigger?.id?.slice(0, 8)}...
                      </span>
                    ) : (
                      <span style={{ color: '#f87171' }}>{result.error}</span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Charts — 2 cols */}
            <div className="col-span-2 space-y-4">
              {/* Bar chart */}
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="glass-card-strong p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={15} style={{ color: '#f97316' }} />
                  <p className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>Weekly Payouts (₹)</p>
                </div>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={payoutData} barSize={14}>
                      <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={darkTooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                      <Bar dataKey="amount" fill="#f97316" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Pie chart */}
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card-strong p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Eye size={15} style={{ color: '#8b5cf6' }} />
                  <p className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>Risk Tier Distribution</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-24 w-24 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={tierData} cx="50%" cy="50%" innerRadius={24} outerRadius={42} dataKey="value" paddingAngle={3}>
                          {tierData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 flex-1">
                    {tierData.map(t => (
                      <div key={t.name} className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: t.color }} />
                        <span className="flex-1" style={{ color: 'var(--text-2)' }}>{t.name}</span>
                        <span className="font-bold" style={{ color: 'var(--text-1)' }}>{t.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-2 gap-5">
            {/* Line chart */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="glass-card-strong p-6"
            >
              <div className="flex items-center gap-2 mb-5">
                <AlertTriangle size={15} style={{ color: '#8b5cf6' }} />
                <p className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>Claims This Week</p>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={claimTrend}>
                    <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={darkTooltipStyle} cursor={{ stroke: 'rgba(255,255,255,0.08)' }} />
                    <Line type="monotone" dataKey="claims" stroke="#8b5cf6" strokeWidth={2.5}
                      dot={{ fill: '#8b5cf6', r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: '#a78bfa' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Activity log */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card-strong p-6"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(249,115,22,0.15)' }}>
                  <Activity size={14} style={{ color: '#f97316' }} />
                </div>
                <p className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>Trigger Activity Log</p>
                {log.length > 0 && (
                  <span className="ml-auto text-xs px-2.5 py-1 rounded-full font-bold"
                    style={{ background: 'rgba(249,115,22,0.12)', color: '#f97316' }}>
                    {log.length}
                  </span>
                )}
              </div>

              {log.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                    style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <Zap size={20} style={{ color: 'rgba(255,255,255,0.2)' }} />
                  </div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-3)' }}>No triggers fired yet</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>Use the panel above to fire a trigger</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-auto">
                  <AnimatePresence>
                    {log.map((entry, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 rounded-xl text-xs"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                          <span className="font-semibold" style={{ color: 'var(--text-1)' }} >
                            {entry.type?.replace(/_/g, ' ')}
                          </span>
                          <span style={{ color: 'var(--text-3)' }}>PIN {entry.pin_code}</span>
                        </div>
                        <span style={{ color: 'var(--text-3)' }}>{entry.ts}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
