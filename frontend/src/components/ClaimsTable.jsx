import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Zap, CloudRain, Thermometer, Wind, AlertOctagon } from 'lucide-react';

const STATUS = {
  paid:          { icon: CheckCircle,  color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  label: 'Paid'         },
  approved:      { icon: Zap,          color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', label: 'Approved'     },
  manual_review: { icon: AlertTriangle,color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Under Review' },
  rejected:      { icon: XCircle,      color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  label: 'Rejected'     },
};

const TRIGGER_META = {
  heavy_rain:          { icon: CloudRain,     label: 'Heavy Rain',        color: '#3b82f6' },
  extreme_heat:        { icon: Thermometer,   label: 'Extreme Heat',      color: '#FFFFE3' },
  severe_pollution:    { icon: Wind,          label: 'Severe Pollution',  color: '#8b5cf6' },
  curfew_strike:       { icon: AlertOctagon,  label: 'Curfew / Strike',   color: '#ef4444' },
  road_accident_surge: { icon: AlertTriangle, label: 'Accident Surge',    color: '#f59e0b' },
};

export default function ClaimsTable({ claims }) {
  if (!claims?.length) return (
    <div className="text-center py-16">
      <div className="w-20 h-20 rounded-3xl glass-card flex items-center justify-center mx-auto mb-6">
        <Zap size={32} className="text-gray-600" />
      </div>
      <p className="text-lg font-bold mb-2" style={{ color: 'var(--text-2)' }}>No claims yet</p>
      <p className="text-sm font-medium" style={{ color: 'var(--text-3)' }}>
        Claims auto-generate when a trigger fires in your zone. Zero forms needed.
      </p>
    </div>
  );

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {claims.map((claim, i) => {
          const s = STATUS[claim.status] || STATUS.approved;
          const StatusIcon = s.icon;
          const tm = TRIGGER_META[claim.trigger_type] || { icon: Zap, label: 'Disruption Event', color: '#6b7280' };
          const TriggerIcon = tm.icon;

          return (
            <motion.div key={claim.id}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }} exit={{ opacity: 0, x: 20 }}
              className="flex items-center justify-between p-5 rounded-2xl glass-card hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-4">
                {/* Trigger type icon */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${tm.color}15`, border: `1px solid ${tm.color}30` }}>
                  <TriggerIcon size={22} style={{ color: tm.color }} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-base font-bold" style={{ color: 'var(--text-1)' }}>{tm.label}</p>
                    {/* Zero-touch badge */}
                    <span className="px-2 py-0.5 rounded-full text-xs font-black bg-green-500/10 text-green-400">
                      Zero-Touch
                    </span>
                  </div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>
                    {new Date(claim.initiated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="text-right">
                  <p className="text-2xl font-black mb-1" style={{ color: 'var(--text-1)' }}>₹{claim.amount}</p>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-3)' }}>
                    Fraud score: {(claim.fraud_score * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black"
                  style={{ background: s.bg, color: s.color }}>
                  <StatusIcon size={14} strokeWidth={2.5} />
                  {s.label}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
