import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, AlertTriangle, Heart, X, Gift, Clock } from 'lucide-react';

const BURNOUT_THRESHOLD = 55; // hours/week
const COMPENSATION = 150; // ₹ wellness bonus

export default function BurnoutProtection({ worker }) {
  const [show, setShow] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const hours = worker?.weekly_hours || 0;
  const isBurnoutRisk = hours >= BURNOUT_THRESHOLD;
  const severity = hours >= 70 ? 'critical' : hours >= 60 ? 'high' : 'moderate';

  useEffect(() => {
    if (isBurnoutRisk && !dismissed) {
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isBurnoutRisk, dismissed]);

  const handleClaim = () => {
    setClaimed(true);
    setTimeout(() => { setShow(false); setDismissed(true); }, 2500);
  };

  if (!isBurnoutRisk) return null;

  const severityConfig = {
    moderate: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', label: 'Moderate Risk' },
    high:     { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.3)',  label: 'High Risk' },
    critical: { color: '#dc2626', bg: 'rgba(220,38,38,0.12)', border: 'rgba(220,38,38,0.4)',  label: 'Critical Risk' },
  };
  const cfg = severityConfig[severity];

  return (
    <>
      {/* Inline card in dashboard */}
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card-strong p-6 rounded-2xl"
          style={{ border: `1.5px solid ${cfg.border}` }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: cfg.bg }}>
              <Coffee size={22} style={{ color: cfg.color }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-black" style={{ color: 'var(--text-1)' }}>Burnout Protection Alert</h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
              </div>
              <p className="text-sm mb-3" style={{ color: 'var(--text-2)' }}>
                You've logged <strong style={{ color: cfg.color }}>{hours} hours</strong> this week — that's above the healthy limit of {BURNOUT_THRESHOLD}h.
                Take a break. Your wellbeing matters more than any delivery.
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold"
                  style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <Gift size={14} />
                  Claim ₹{COMPENSATION} Wellness Bonus
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-3)' }}>
                  <Clock size={12} />
                  Suggested break: 4–6 hours
                </div>
              </div>
            </div>
            <button onClick={() => setDismissed(true)} style={{ color: 'var(--text-3)' }}
              className="hover:text-red-400 transition-colors mt-1">
              <X size={16} />
            </button>
          </div>

          {!claimed ? (
            <div className="mt-4 flex gap-3">
              <button onClick={handleClaim}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                ✓ Claim ₹{COMPENSATION} Wellness Bonus
              </button>
              <button onClick={() => setDismissed(true)}
                className="px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
                style={{ background: 'rgba(134,151,196,0.15)', color: 'var(--text-2)' }}>
                Dismiss
              </button>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mt-4 py-3 rounded-xl text-center font-bold text-sm text-green-400"
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
              ₹{COMPENSATION} credited to your UPI. Take care of yourself.
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Floating popup */}
      <AnimatePresence>
        {show && !dismissed && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-24 right-6 z-40 w-80 rounded-2xl p-5 shadow-2xl"
            style={{
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              border: `1.5px solid ${cfg.border}`,
              boxShadow: '0 16px 48px rgba(61,82,160,0.2)',
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: cfg.bg }}>
                <Heart size={18} style={{ color: cfg.color }} />
              </div>
              <div>
                <p className="text-sm font-black" style={{ color: 'var(--text-1)' }}>Burnout Alert</p>
                <p className="text-xs" style={{ color: 'var(--text-3)' }}>{hours}h this week — take a break!</p>
              </div>
              <button onClick={() => setShow(false)} className="ml-auto" style={{ color: 'var(--text-3)' }}>
                <X size={14} />
              </button>
            </div>
            <p className="text-xs mb-3" style={{ color: 'var(--text-2)' }}>
              Coverly cares about your health. Claim your ₹{COMPENSATION} wellness bonus and rest.
            </p>
            <button onClick={handleClaim}
              className="w-full py-2 rounded-xl font-bold text-xs text-white"
              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
              Claim ₹{COMPENSATION} Wellness Bonus
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
