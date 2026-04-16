import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, CheckCircle, AlertCircle, RefreshCw, IndianRupee } from 'lucide-react';

// Simulated platform status — in production this would call a real status API
const PLATFORM_STATUS = {
  Zepto:     { status: 'operational', uptime: '99.8%', lastIncident: null },
  Blinkit:   { status: 'operational', uptime: '99.5%', lastIncident: null },
  Instamart: { status: 'degraded',    uptime: '97.2%', lastIncident: '2h ago' },
  Swiggy:    { status: 'operational', uptime: '99.9%', lastIncident: null },
  Zomato:    { status: 'operational', uptime: '99.7%', lastIncident: null },
};

const DOWNTIME_COMPENSATION = { low: 50, standard: 100, high: 200, critical: 300 };

export default function PlatformDowntime({ worker, riskTier }) {
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState(null);
  const [claimed, setClaimed] = useState(false);

  const platform = worker?.platform || 'Zepto';
  const platformStatus = PLATFORM_STATUS[platform] || PLATFORM_STATUS.Zepto;
  const isDown = platformStatus.status !== 'operational';
  const compensation = DOWNTIME_COMPENSATION[riskTier?.toLowerCase()] || 100;

  const checkStatus = () => {
    setChecking(true);
    setTimeout(() => {
      setStatus(platformStatus);
      setChecking(false);
    }, 1200);
  };

  useEffect(() => {
    checkStatus();
  }, [platform]);

  const handleClaim = () => {
    setClaimed(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card-strong p-6 rounded-2xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: isDown ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)' }}>
            {isDown ? <WifiOff size={18} style={{ color: '#ef4444' }} /> : <CheckCircle size={18} style={{ color: '#22c55e' }} />}
          </div>
          <div>
            <h3 className="text-sm font-black" style={{ color: 'var(--text-1)' }}>Platform Downtime Protection</h3>
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>Monitoring {platform} status</p>
          </div>
        </div>
        <button onClick={checkStatus} disabled={checking}
          className="p-2 rounded-xl transition-all hover:scale-105"
          style={{ background: 'rgba(61,82,160,0.08)' }}>
          <RefreshCw size={14} style={{ color: '#3D52A0' }} className={checking ? 'animate-spin' : ''} />
        </button>
      </div>

      {checking ? (
        <div className="flex items-center gap-2 py-2">
          <RefreshCw size={14} style={{ color: '#8697C4' }} className="animate-spin" />
          <span className="text-xs" style={{ color: 'var(--text-3)' }}>Checking {platform} status...</span>
        </div>
      ) : status ? (
        <div className="space-y-3">
          {/* Status row */}
          <div className="flex items-center justify-between p-3 rounded-xl"
            style={{ background: isDown ? 'rgba(239,68,68,0.06)' : 'rgba(34,197,94,0.06)', border: `1px solid ${isDown ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}` }}>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isDown ? 'bg-red-400' : 'bg-green-400 animate-pulse'}`} />
              <span className="text-sm font-bold" style={{ color: isDown ? '#ef4444' : '#22c55e' }}>
                {platform}: {isDown ? 'Degraded / Down' : 'Operational'}
              </span>
            </div>
            <span className="text-xs font-semibold" style={{ color: 'var(--text-3)' }}>
              Uptime: {status.uptime}
            </span>
          </div>

          {/* All platforms mini status */}
          <div className="grid grid-cols-5 gap-1.5">
            {Object.entries(PLATFORM_STATUS).map(([name, s]) => (
              <div key={name} className="text-center p-2 rounded-lg"
                style={{ background: 'rgba(61,82,160,0.05)', border: '1px solid rgba(134,151,196,0.15)' }}>
                <span className={`block w-2 h-2 rounded-full mx-auto mb-1 ${s.status === 'operational' ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-xs font-semibold" style={{ color: 'var(--text-3)', fontSize: 10 }}>{name.slice(0,4)}</span>
              </div>
            ))}
          </div>

          {/* Downtime claim */}
          {isDown && !claimed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="p-4 rounded-xl"
              style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={14} style={{ color: '#ef4444' }} />
                <p className="text-xs font-bold" style={{ color: '#ef4444' }}>
                  {platform} is experiencing issues — you may be losing earnings!
                </p>
              </div>
              <p className="text-xs mb-3" style={{ color: 'var(--text-2)' }}>
                Your {riskTier || 'Standard'} plan covers platform downtime. Claim ₹{compensation} compensation now.
              </p>
              <button onClick={handleClaim}
                className="w-full py-2 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                <IndianRupee size={12} />
                Claim ₹{compensation} Downtime Compensation
              </button>
            </motion.div>
          )}

          {claimed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="py-3 rounded-xl text-center text-xs font-bold text-green-400"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
              ₹{compensation} downtime compensation credited to UPI
            </motion.div>
          )}

          {!isDown && (
            <p className="text-xs text-center" style={{ color: 'var(--text-3)' }}>
              ✓ All platforms operational. You're protected if any goes down.
            </p>
          )}
        </div>
      ) : null}
    </motion.div>
  );
}
