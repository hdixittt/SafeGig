import React from 'react';
import { motion } from 'framer-motion';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

const TIER_CONFIG = {
  Low:      { color:'#22c55e', bg:'#f0fdf4', border:'#bbf7d0' },
  Standard: { color:'#3b82f6', bg:'#eff6ff', border:'#bfdbfe' },
  High:     { color:'#f59e0b', bg:'#fffbeb', border:'#fde68a' },
  Premium:  { color:'#ef4444', bg:'#fef2f2', border:'#fecaca' },
};

export default function RiskCard({ profile }) {
  const cfg = TIER_CONFIG[profile.tier] || TIER_CONFIG.Standard;
  const chartData = [{ value: profile.risk_score * 100, fill: cfg.color }];

  return (
    <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.4}} className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-gray-800">Risk Profile</h2>
          <p className="text-xs text-gray-400">AI-computed weekly assessment</p>
        </div>
        <span className="badge" style={{background:cfg.bg, border:`1px solid ${cfg.border}`, color:cfg.color}}>
          {profile.tier} Risk
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 items-center">
        <div className="h-32 relative">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%"
              data={chartData} startAngle={90} endAngle={-270}>
              <RadialBar dataKey="value" cornerRadius={6} background={{fill:'#f1f5f9'}} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-900">{(profile.risk_score*100).toFixed(0)}%</span>
            <span className="text-xs text-gray-400">Risk Score</span>
          </div>
        </div>

        <div className="space-y-2.5">
          {[
            { label:'Weekly Premium', value:`₹${profile.premium}`, color:'#f97316' },
            { label:'Coverage',       value:`₹${profile.coverage}`, color:'#22c55e' },
            { label:'City',           value:profile.city,           color:'#3b82f6' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="text-xs text-gray-400">{label}</span>
              <span className="text-sm font-semibold" style={{color}}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
