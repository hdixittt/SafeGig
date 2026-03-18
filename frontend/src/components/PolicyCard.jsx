import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar } from 'lucide-react';

export default function PolicyCard({ policy }) {
  const start = new Date(policy.week_start).toLocaleDateString('en-IN',{day:'numeric',month:'short'});
  const end   = new Date(policy.week_end).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
  const pct   = Math.min(Math.round((Date.now()-new Date(policy.week_start))/(7*24*3600*1000)*100),100);

  return (
    <motion.div initial={{opacity:0,scale:0.98}} animate={{opacity:1,scale:1}} transition={{duration:0.3}}
      className="rounded-xl p-4" style={{background:'#f0fdf4',border:'1px solid #bbf7d0'}}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <CheckCircle size={15} className="text-green-500" />
          <span className="text-green-600 text-xs font-semibold">ACTIVE</span>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Premium paid</p>
          <p className="text-xl font-bold text-orange-500">₹{policy.premium_paid}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div><p className="text-xs text-gray-400 mb-0.5">Coverage</p><p className="font-bold text-gray-800">₹{policy.coverage_amount}</p></div>
        <div><p className="text-xs text-gray-400 mb-0.5">Risk</p><p className="font-bold text-yellow-500">{Math.round((policy.risk_score||0)*100)}%</p></div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1"><Calendar size={9}/>Period</p>
          <p className="text-xs text-gray-600">{start}–{end}</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Week progress</span><span>{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-green-100">
          <motion.div initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:1,delay:0.3}}
            className="h-full rounded-full bg-green-400" />
        </div>
      </div>
    </motion.div>
  );
}
