import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Zap } from 'lucide-react';

const STATUS = {
  paid:          { icon: CheckCircle,   color: '#22c55e', bg: 'rgba(34,197,94,0.15)',   border: 'rgba(34,197,94,0.3)',   label: 'Paid'         },
  approved:      { icon: Zap,           color: '#3b82f6', bg: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.3)',  label: 'Approved'     },
  manual_review: { icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.3)',  label: 'Under Review' },
  rejected:      { icon: XCircle,       color: '#ef4444', bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.3)',   label: 'Rejected'     },
};

const TRIGGER_LABELS = {
  heavy_rain:        '🌧 Heavy Rain',
  extreme_heat:      '🌡 Extreme Heat',
  severe_pollution:  '😷 Pollution',
  curfew_strike:     '🚫 Curfew/Strike',
};

export default function ClaimsTable({ claims }) {
  if (!claims?.length) return (
    <div className="text-center py-16">
      <div className="w-20 h-20 rounded-3xl glass-card flex items-center justify-center mx-auto mb-6">
        <Zap size={32} className="text-gray-600" />
      </div>
      <p className="text-gray-400 text-lg font-bold mb-2">No claims yet</p>
      <p className="text-gray-500 text-sm font-medium">Claims auto-generate when a trigger fires in your zone</p>
    </div>
  );

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {claims.map((claim, i) => {
          const s = STATUS[claim.status] || STATUS.approved;
          const Icon = s.icon;
          return (
            <motion.div key={claim.id}
              initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}}
              transition={{delay:i*0.05}} exit={{opacity:0,x:20}}
              className="flex items-center justify-between p-5 rounded-2xl glass-card hover:bg-white/5 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{background:s.bg, border:`1px solid ${s.border}`}}>
                  <Icon size={24} style={{color:s.color}} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-base font-bold mb-1" style={{ color: 'var(--text-1)' }}>
                    {TRIGGER_LABELS[claim.trigger_type] || 'Disruption Event'}
                  </p>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>
                    {new Date(claim.initiated_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="text-right">
                  <p className="text-2xl font-black mb-1" style={{ color: 'var(--text-1)' }}>₹{claim.amount}</p>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-3)' }}>Fraud: {(claim.fraud_score*100).toFixed(0)}%</p>
                </div>
                <span className="px-4 py-2 rounded-xl text-sm font-black"
                  style={{background:s.bg, color:s.color, border:`1px solid ${s.border}`}}>
                  {s.label}
                </span>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
