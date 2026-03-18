import React from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ label, value, sub, icon: Icon, color = '#f97316', delay = 0 }) {
  return (
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay, duration:0.4}}
      className="stat-card">
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 -translate-y-6 translate-x-6"
        style={{background:`radial-gradient(circle, ${color}, transparent)`}} />
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{background:`${color}20`, border:`1px solid ${color}30`}}>
          <Icon size={18} style={{color}} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
      {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
    </motion.div>
  );
}
