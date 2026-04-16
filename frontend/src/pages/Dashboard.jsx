import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, TrendingUp, FileText, Zap, Plus, IndianRupee, CheckCircle, Clock, MapPin, X } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, BarChart, Bar } from 'recharts';
import api from '../api';
import Sidebar from '../components/Sidebar';
import LiveConditions from '../components/LiveConditions';
import ClaimsTable from '../components/ClaimsTable';
import CoverageMap from '../components/CoverageMap';
import CoverlyLogo from '../components/CoverlyLogo';
import BurnoutProtection from '../components/BurnoutProtection';
import PlatformDowntime from '../components/PlatformDowntime';
import { useLanguage } from '../context/LanguageContext';

const mockCoverageData = [
  {week:'W1',coverage:800,claims:0},{week:'W2',coverage:1500,claims:150},{week:'W3',coverage:1500,claims:0},
  {week:'W4',coverage:2500,claims:450},{week:'W5',coverage:2500,claims:0},{week:'W6',coverage:3500,claims:750},
];
const mockActivityData = [
  {day:'Mon',hours:8},{day:'Tue',hours:9},{day:'Wed',hours:7},{day:'Thu',hours:10},
  {day:'Fri',hours:9},{day:'Sat',hours:6},{day:'Sun',hours:5},
];

function StatCard({ label, value, sub, icon: Icon, color, trend, delay }) {
  return (
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay,duration:0.5}} className="stat-card-premium group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110" style={{background:`${color}15`}}>
          <Icon size={20} style={{color}} strokeWidth={2.5} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${trend > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            <TrendingUp size={12} className={trend < 0 ? 'rotate-180' : ''} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-3xl font-black mb-2" style={{color:'var(--text-1)'}}>{value}</p>
      <p className="text-sm font-semibold mb-1" style={{color:'var(--text-2)'}}>{label}</p>
      {sub && <p className="text-xs font-medium" style={{color:'var(--text-3)'}}>{sub}</p>}
    </motion.div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [worker, setWorker]               = useState(null);
  const [riskProfile, setRiskProfile]     = useState(null);
  const [policies, setPolicies]           = useState([]);
  const [claims, setClaims]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [autoClaimBanner, setAutoClaimBanner] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: w } = await api.get('/workers/me');
        setWorker(w);
        const [riskRes, policiesRes, claimsRes] = await Promise.all([
          api.get(`/workers/${w.id}/risk-profile`),
          api.get(`/policies/worker/${w.id}`),
          api.get(`/claims/worker/${w.id}`),
        ]);
        setRiskProfile(riskRes.data);
        setPolicies(policiesRes.data);
        setClaims(claimsRes.data);
      } catch { navigate('/login'); }
      finally { setLoading(false); }
    })();
  }, [navigate]);

  const activatePolicy = () => {
    navigate('/plans');
  };

  // Zero-touch: check triggers and auto-file claim
  const checkAndAutoClaim = async () => {
    try {
      const { data } = await api.post('/claims/auto', { worker_id: worker.id });
      if (data.triggered) {
        setAutoClaimBanner(data);
        const claimsRes = await api.get(`/claims/worker/${worker.id}`);
        setClaims(claimsRes.data);
        setTimeout(() => setAutoClaimBanner(null), 10000);
      }
    } catch (e) { console.error('Auto-claim check failed', e); }
  };

  useEffect(() => {
    if (worker?.id) {
      // Check immediately on load, then every 10 seconds
      checkAndAutoClaim();
      const interval = setInterval(checkAndAutoClaim, 10000);
      return () => clearInterval(interval);
    }
  }, [worker]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'var(--bg)'}}>
      <div className="flex flex-col items-center gap-5">
        <div className="float-anim" style={{
          width: 64, height: 64,
          borderRadius: '18px 22px 18px 22px',
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(61,82,160,0.12)',
        }}>
          <CoverlyLogo size={40} />
        </div>
        <p className="text-base font-semibold" style={{color:'var(--text-2)'}}>Loading your dashboard…</p>
      </div>
    </div>
  );

  const activePolicy = policies.find(p => p.status === 'active');
  const totalClaims  = claims.length;
  const totalPaid    = claims.filter(c => c.status === 'paid').reduce((s, c) => s + c.amount, 0);
  const riskScore    = riskProfile ? (riskProfile.risk_score * 100).toFixed(0) : 0;

  return (
    <div className="flex min-h-screen" style={{background:'var(--bg)'}}>
      <Sidebar worker={worker} />
      <main className="flex-1 overflow-auto">

        {/* Zero-Touch Payout — Full Screen UPI Receipt Overlay */}
        <AnimatePresence>
          {autoClaimBanner && (
            <motion.div
              initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="fixed inset-0 z-50 flex items-center justify-center"
              style={{background:'rgba(0,0,0,0.85)',backdropFilter:'blur(12px)'}}
            >
              <motion.div
                initial={{scale:0.7,opacity:0,y:40}} animate={{scale:1,opacity:1,y:0}}
                exit={{scale:0.9,opacity:0}} transition={{type:'spring',damping:20}}
                className="w-full max-w-md mx-4 rounded-3xl overflow-hidden shadow-2xl"
              >
                <div className="p-8 text-center" style={{background:'linear-gradient(135deg,#16a34a,#15803d)'}}>
                  <motion.div initial={{scale:0}} animate={{scale:1}} transition={{delay:0.2,type:'spring',damping:12}}
                    className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={40} className="text-white" strokeWidth={2.5} />
                  </motion.div>
                  <p className="text-white text-2xl font-black mb-1">Payment Received!</p>
                  <p className="text-white/80 text-sm font-medium">Your claim was auto-approved and paid instantly</p>
                </div>
                <div className="p-6" style={{background:'var(--bg-2)'}}>
                  <div className="text-center mb-6 p-4 rounded-2xl" style={{background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.2)'}}>
                    <p className="text-xs font-bold uppercase mb-1" style={{color:'var(--text-3)'}}>Amount Credited to UPI</p>
                    <p className="text-5xl font-black text-green-400">₹{autoClaimBanner.claim?.amount || autoClaimBanner.payout_amount || '—'}</p>
                    <p className="text-sm font-semibold mt-1" style={{color:'var(--text-3)'}}>UPI (Simulated) · Instant</p>
                  </div>
                  <div className="space-y-3 mb-6">
                    {[
                      ['Trigger', (autoClaimBanner.claim?.trigger_type || '').replace(/_/g,' ') || '—'],
                      ['GPS Zone', autoClaimBanner.gps_validated !== false ? '✓ Confirmed' : '⚠ Mismatch'],
                      ['Fraud Check', `${autoClaimBanner.fraud_score ? (autoClaimBanner.fraud_score*100).toFixed(0) : '4'}% — Safe`],
                      ['Status', 'Auto-Approved & Paid'],
                      ['Time', new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})],
                    ].map(([k,v]) => (
                      <div key={k} className="flex items-center justify-between py-2" style={{borderBottom:'1px solid rgba(74,74,74,0.05)'}}>
                        <span className="text-sm" style={{color:'var(--text-3)'}}>{k}</span>
                        <span className="text-sm font-bold capitalize" style={{color:'var(--text-1)'}}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-center mb-4" style={{color:'var(--text-3)'}}>No forms. No calls. Fully automated parametric payout.</p>
                  <button onClick={() => setAutoClaimBanner(null)} className="w-full py-3.5 rounded-2xl font-black text-white text-base" style={{background:'linear-gradient(135deg,#16a34a,#15803d)'}}>
                    Got it — View Claims History
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Topbar */}
        <div className="topbar-premium px-10 py-6 flex items-center justify-between sticky top-0 z-20">
          <div>
            <motion.h1 initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} className="text-2xl font-black mb-1" style={{color:'var(--text-1)'}}>
              {t('tagline')}
            </motion.h1>
            <div className="flex items-center gap-4 text-sm font-medium" style={{color:'var(--text-2)'}}>
              <span className="font-semibold" style={{color:'var(--text-1)'}}>{worker?.name?.split(' ')[0]}</span>
              <span>·</span>
              <span className="flex items-center gap-1.5"><MapPin size={13} style={{color:'#7091E6'}} />{worker?.city}</span>
              <span>·</span><span>{worker?.platform}</span>
              <span>·</span>
              <span className="flex items-center gap-1.5"><Clock size={13} style={{color:'#7091E6'}} />{worker?.weekly_hours}h/week</span>
            </div>
          </div>
          {!activePolicy && (
            <motion.button initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
              onClick={activatePolicy}
              className="flex items-center gap-2.5 px-6 py-3.5 font-bold text-sm text-white transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(140deg, #3D52A0, #7091E6)',
                borderRadius: '14px 18px 14px 18px',
                boxShadow: '0 6px 20px rgba(61,82,160,0.3)',
              }}>
              <Plus size={18} strokeWidth={2.5} />
              {t('activatePolicy')}
            </motion.button>
          )}
        </div>

        <div className="p-10 space-y-8 max-w-[1800px]">
          {/* Stats — fluid, not rigid grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard label={t('riskScore')}        value={`${riskScore}%`}                               icon={TrendingUp}  color="#5B6FD4" delay={0}   sub={riskProfile?.tier + ' tier'} trend={-5} />
            <StatCard label={t('weeklyPremium')}    value={riskProfile ? `₹${riskProfile.premium}` : '—'} icon={IndianRupee} color="#3b82f6" delay={0.08} sub={t('dynamicPricing')} />
            <StatCard label={t('earningsProtected')} value={activePolicy ? `₹${activePolicy.coverage_amount}` : '—'} icon={Shield} color="#22c55e" delay={0.16} sub={activePolicy ? t('thisWeek') : t('noActivePolicy')} />
            <StatCard label={t('totalPaidOut')}     value={`₹${totalPaid}`}                               icon={FileText}    color="#8b5cf6" delay={0.24} sub={`${totalClaims} ${t('claimsFiled')}`} trend={totalClaims > 0 ? 12 : 0} />
          </div>

          {/* Live Conditions — 5 triggers */}
          {worker?.city && <LiveConditions city={worker.city} />}

          {/* Burnout Protection + Platform Downtime */}
          <div className="grid grid-cols-2 gap-6">
            <BurnoutProtection worker={worker} />
            <PlatformDowntime worker={worker} riskTier={riskProfile?.tier} />
          </div>

          {/* Pricing Breakdown — shown on Plans page after payment */}

          {/* Risk Profile + Policy Status */}
          <div className="grid grid-cols-3 gap-6">
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.4}} className="glass-card-strong p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black mb-1" style={{color:'var(--text-1)'}}>Risk Profile</h2>
                  <p className="text-sm font-medium" style={{color:'var(--text-2)'}}>AI-computed assessment</p>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-xs font-black uppercase ${
                  riskScore < 40 ? 'bg-green-500/15 text-green-400' :
                  riskScore < 70 ? 'bg-yellow-500/15 text-[#4A4A4A]' : 'bg-red-500/15 text-red-400'}`}>
                  {riskProfile?.tier}
                </div>
              </div>
              <div className="flex items-center justify-center mb-8">
                <div className="relative w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" data={[{value:riskScore}]} startAngle={90} endAngle={-270}>
                      <RadialBar dataKey="value" fill="#5B6FD4" background={{fill:'rgba(61,82,160,0.06)'}} cornerRadius={10} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-5xl font-black" style={{color:'var(--text-1)'}}>{riskScore}%</p>
                    <p className="text-sm font-semibold" style={{color:'var(--text-2)'}}>Risk Score</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl" style={{background:'var(--bg-2)'}}>
                  <span className="text-sm font-semibold" style={{color:'var(--text-2)'}}>Weekly Premium</span>
                  <span className="text-lg font-black" style={{color:'var(--accent-mid)'}}>₹{riskProfile?.premium}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl" style={{background:'var(--bg-2)'}}>
                  <span className="text-sm font-semibold" style={{color:'var(--text-2)'}}>Coverage</span>
                  <span className="text-lg font-black text-green-400">₹{riskProfile?.coverage}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl" style={{background:'var(--bg-2)'}}>
                  <span className="text-sm font-semibold" style={{color:'var(--text-2)'}}>City</span>
                  <span className="text-lg font-black" style={{color:'var(--text-1)'}}>{worker?.city}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl" style={{background:'rgba(34,197,94,0.08)',border:'1px solid rgba(34,197,94,0.2)'}}>
                  <div>
                    <span className="text-sm font-semibold" style={{color:'var(--text-2)'}}>GPS Zone (PIN)</span>
                    <p className="text-xs mt-0.5" style={{color:'var(--text-3)'}}>Claims validated against this zone</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-green-400">{worker?.pin_code}</span>
                    <p className="text-xs mt-0.5 text-green-400 font-bold">✓ Verified</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.5}} className="col-span-2 glass-card-strong p-8">
              <h2 className="text-xl font-black mb-6" style={{color:'var(--text-1)'}}>Weekly Policy Status</h2>
              {activePolicy ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
                    <div className="w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center">
                      <CheckCircle size={32} className="text-green-400" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <p className="text-2xl font-black mb-1" style={{color:'var(--text-1)'}}>Policy Active</p>
                      <p className="text-sm font-medium" style={{color:'var(--text-2)'}}>You are covered. Claims auto-file when triggers fire.</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold mb-1" style={{color:'var(--text-2)'}}>Premium Paid</p>
                      <p className="text-3xl font-black text-green-400">₹{activePolicy.premium_paid}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-5 rounded-xl" style={{background:'var(--bg-2)'}}>
                      <p className="text-xs font-bold uppercase mb-2" style={{color:'var(--text-3)'}}>Coverage</p>
                      <p className="text-2xl font-black" style={{color:'var(--text-1)'}}>₹{activePolicy.coverage_amount}</p>
                    </div>
                    <div className="p-5 rounded-xl" style={{background:'var(--bg-2)'}}>
                      <p className="text-xs font-bold uppercase mb-2" style={{color:'var(--text-3)'}}>Risk Score</p>
                      <p className="text-2xl font-black" style={{color:'var(--accent-mid)'}}>{(activePolicy.risk_score*100).toFixed(0)}%</p>
                    </div>
                    <div className="p-5 rounded-xl" style={{background:'var(--bg-2)'}}>
                      <p className="text-xs font-bold uppercase mb-2" style={{color:'var(--text-3)'}}>Period</p>
                      <p className="text-sm font-black" style={{color:'var(--text-1)'}}>
                        {new Date(activePolicy.week_start).toLocaleDateString('en-IN',{day:'numeric',month:'short'})} - {new Date(activePolicy.week_end).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
                      </p>
                    </div>
                  </div>
                  {/* Zero-touch explainer */}
                  <div className="flex items-start gap-4 p-5 rounded-xl" style={{background:'var(--bg-2)'}}>
                    <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center flex-shrink-0">
                      <Zap size={18} className="text-green-400" strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-sm font-black mb-1" style={{color:'var(--text-1)'}}>Zero-Touch Claims Active</p>
                      <p className="text-xs font-medium" style={{color:'var(--text-3)'}}>
                        When a trigger fires in your zone (rain, heat, pollution, curfew, accidents), your claim is auto-filed and payout dispatched to your UPI — no forms, no waiting.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
                    <Shield size={40} className="text-gray-600" />
                  </div>
                  <p className="text-xl font-bold mb-2" style={{color:'var(--text-2)'}}>No Active Policy</p>
                  <p className="text-sm mb-6" style={{color:'var(--text-3)'}}>Activate to get covered and enable zero-touch claims</p>
                  <button onClick={activatePolicy}
                    className="px-8 py-3 font-bold text-white transition-all hover:scale-105"
                    style={{ background: 'linear-gradient(140deg, #3D52A0, #7091E6)', borderRadius: '12px 16px 12px 16px', boxShadow: '0 6px 20px rgba(61,82,160,0.28)' }}>
                    {t('viewPlans')}
                  </button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-6">
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.6}} className="glass-card-strong p-8">
              <h2 className="text-xl font-black mb-6" style={{color:'var(--text-1)'}}>Coverage and Claims Trend</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockCoverageData}>
                    <defs>
                      <linearGradient id="cg1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#5B6FD4" stopOpacity={0.25} /><stop offset="95%" stopColor="#5B6FD4" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="cg2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="week" stroke="rgba(134,151,196,0.2)" tick={{fill:'var(--text-3)',fontSize:11}} />
                    <YAxis stroke="rgba(134,151,196,0.2)" tick={{fill:'var(--text-3)',fontSize:11}} />
                    <Tooltip contentStyle={{background:'rgba(255,255,255,0.95)',border:'1px solid rgba(134,151,196,0.2)',borderRadius:'14px',color:'var(--text-1)',boxShadow:'0 8px 24px rgba(61,82,160,0.1)'}} />
                    <Area type="monotone" dataKey="coverage" stroke="#5B6FD4" strokeWidth={2.5} fill="url(#cg1)" />
                    <Area type="monotone" dataKey="claims" stroke="#ef4444" strokeWidth={2.5} fill="url(#cg2)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.7}} className="glass-card-strong p-8">
              <h2 className="text-xl font-black mb-6" style={{color:'var(--text-1)'}}>Weekly Activity</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockActivityData}>
                    <XAxis dataKey="day" stroke="rgba(134,151,196,0.2)" tick={{fill:'var(--text-3)',fontSize:11}} />
                    <YAxis stroke="rgba(134,151,196,0.2)" tick={{fill:'var(--text-3)',fontSize:11}} />
                    <Tooltip contentStyle={{background:'rgba(255,255,255,0.95)',border:'1px solid rgba(134,151,196,0.2)',borderRadius:'14px',color:'var(--text-1)',boxShadow:'0 8px 24px rgba(61,82,160,0.1)'}} />
                    <Bar dataKey="hours" fill="#7091E6" radius={[10,10,4,4]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Coverage Map + Claims Table */}
          <div className="grid grid-cols-5 gap-6">
            {/* Google Maps Coverage Zone */}
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.75}} className="col-span-2 glass-card-strong p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={18} style={{color:'#3D52A0'}} />
                <h2 className="text-lg font-black" style={{color:'var(--text-1)'}}>Coverage Zone</h2>
                <span className="ml-auto text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{background:'rgba(61,82,160,0.1)',color:'#3D52A0'}}>Live Map</span>
              </div>
              <div className="h-64 rounded-2xl overflow-hidden">
                {worker?.city && (
                  <CoverageMap city={worker.city} pinCode={worker.pin_code} workerName={worker.name} />
                )}
              </div>
            </motion.div>

            {/* Claims Table */}
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.8}} className="col-span-3 glass-card-strong p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black mb-1" style={{color:'var(--text-1)'}}>{t('claimsHistory')}</h2>
                  <p className="text-sm font-medium" style={{color:'var(--text-2)'}}>Auto-generated on trigger events. Zero forms required.</p>
                </div>
                {totalClaims > 0 && (
                  <div className="px-4 py-2 rounded-full font-black text-sm"
                    style={{background:'rgba(61,82,160,0.1)',color:'#3D52A0'}}>
                    {totalClaims} {t('claimsFiled')}
                  </div>
                )}
              </div>
              <ClaimsTable claims={claims} />
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
