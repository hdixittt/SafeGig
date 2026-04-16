import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Star, TrendingUp, Award, Zap, CheckCircle, Clock, Target } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const BONUSES = [
  { id: 'clean_week',    icon: Star,       title: 'Clean Week Bonus',       desc: 'No claims filed this week',                  reward: 20,  color: '#f59e0b', earned: true  },
  { id: 'loyalty_3',    icon: Award,       title: '3-Week Loyalty',         desc: 'Active policy for 3 consecutive weeks',       reward: 50,  color: '#7091E6', earned: true  },
  { id: 'referral',     icon: Gift,        title: 'Referral Bonus',         desc: 'Refer a friend who activates a policy',       reward: 100, color: '#22c55e', earned: false },
  { id: 'early_bird',   icon: Clock,       title: 'Early Bird',             desc: 'Activate policy before 8 AM on Monday',      reward: 15,  color: '#3b82f6', earned: false },
  { id: 'high_hours',   icon: TrendingUp,  title: 'Hustle Bonus',           desc: 'Work 50+ hours in a week (with policy)',      reward: 75,  color: '#8b5cf6', earned: true  },
  { id: 'no_fraud',     icon: CheckCircle, title: 'Trust Score Bonus',      desc: 'Zero fraud flags for 4 weeks',                reward: 60,  color: '#22c55e', earned: false },
  { id: 'milestone_10', icon: Target,      title: '10 Weeks Milestone',     desc: 'Complete 10 weeks of continuous coverage',    reward: 200, color: '#ef4444', earned: false },
  { id: 'wellness',     icon: Zap,         title: 'Wellness Break Bonus',   desc: 'Claimed burnout protection this week',        reward: 150, color: '#f59e0b', earned: false },
];

export default function BonusDashboard() {
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(null);
  const [claimed, setClaimed] = useState([]);

  useEffect(() => {
    api.get('/workers/me')
      .then(r => setWorker(r.data))
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false));
  }, []);

  const totalEarned = BONUSES.filter(b => b.earned).reduce((s, b) => s + b.reward, 0);
  const totalPossible = BONUSES.reduce((s, b) => s + b.reward, 0);

  const handleClaim = (id) => {
    setClaiming(id);
    setTimeout(() => {
      setClaimed(prev => [...prev, id]);
      setClaiming(null);
    }, 1000);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-10 h-10 border-4 border-[#7091E6]/20 border-t-[#3D52A0] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      <Sidebar worker={worker} />
      <main className="flex-1 overflow-auto">
        <div className="topbar-premium px-10 py-6 sticky top-0 z-20">
          <h1 className="text-3xl font-black mb-1" style={{ color: 'var(--text-1)' }}>🎁 Bonus Dashboard</h1>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>Earn rewards for safe, consistent coverage</p>
        </div>

        <div className="p-10 space-y-8 max-w-5xl">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: 'Total Earned', value: `₹${totalEarned}`, icon: Gift, color: '#22c55e', sub: 'This month' },
              { label: 'Pending Bonuses', value: `₹${totalPossible - totalEarned}`, icon: Target, color: '#7091E6', sub: 'Unlock more' },
              { label: 'Completion', value: `${Math.round((BONUSES.filter(b=>b.earned).length/BONUSES.length)*100)}%`, icon: Award, color: '#f59e0b', sub: `${BONUSES.filter(b=>b.earned).length}/${BONUSES.length} unlocked` },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="stat-card-premium">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: `${s.color}15` }}>
                    <s.icon size={20} style={{ color: s.color }} />
                  </div>
                </div>
                <p className="text-3xl font-black mb-1" style={{ color: 'var(--text-1)' }}>{s.value}</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-2)' }}>{s.label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{s.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="glass-card-strong p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-black" style={{ color: 'var(--text-1)' }}>Overall Progress</p>
              <p className="text-sm font-bold" style={{ color: '#7091E6' }}>₹{totalEarned} / ₹{totalPossible}</p>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(134,151,196,0.2)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(totalEarned / totalPossible) * 100}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #3D52A0, #7091E6)' }}
              />
            </div>
          </div>

          {/* Bonus cards */}
          <div className="grid grid-cols-2 gap-5">
            {BONUSES.map((bonus, i) => {
              const isClaimed = claimed.includes(bonus.id);
              const isClaiming = claiming === bonus.id;
              return (
                <motion.div key={bonus.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="glass-card p-5 flex items-start gap-4"
                  style={{ opacity: !bonus.earned && !isClaimed ? 0.7 : 1 }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${bonus.color}15`, border: `1px solid ${bonus.color}25` }}>
                    <bonus.icon size={20} style={{ color: bonus.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-black" style={{ color: 'var(--text-1)' }}>{bonus.title}</p>
                      {(bonus.earned || isClaimed) && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                          style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>Earned</span>
                      )}
                    </div>
                    <p className="text-xs mb-3" style={{ color: 'var(--text-3)' }}>{bonus.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black" style={{ color: bonus.color }}>₹{bonus.reward}</span>
                      {(bonus.earned && !isClaimed) ? (
                        <button onClick={() => handleClaim(bonus.id)} disabled={isClaiming}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-105"
                          style={{ background: `linear-gradient(135deg, ${bonus.color}, ${bonus.color}cc)` }}>
                          {isClaiming ? '...' : 'Claim'}
                        </button>
                      ) : isClaimed ? (
                        <span className="text-xs font-bold text-green-400">✓ Claimed</span>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--text-3)' }}>Locked</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
