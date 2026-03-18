import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, FileText, Zap, Plus, IndianRupee, Activity, AlertTriangle, CheckCircle, Clock, MapPin } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, BarChart, Bar } from 'recharts';
import api from '../api';
import Sidebar from '../components/Sidebar';
import LiveConditions from '../components/LiveConditions';
import ClaimsTable from '../components/ClaimsTable';

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
    <motion.div 
      initial={{opacity:0,y:20}} 
      animate={{opacity:1,y:0}} 
      transition={{delay,duration:0.5}}
      className="stat-card-premium group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
          style={{background:`${color}15`}}>
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
  const [worker, setWorker] = useState(null);
  const [riskProfile, setRiskProfile] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);

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

  const activatePolicy = async () => {
    setActivating(true);
    try {
      const { data } = await api.post('/policies', { worker_id: worker.id });
      setPolicies([data, ...policies]);
    } catch { alert('Failed to activate policy'); }
    finally { setActivating(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'var(--bg)'}}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
        <p className="text-gray-400 text-lg font-semibold">Loading your dashboard...</p>
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
        {/* Topbar */}
        <div className="topbar-premium px-10 py-6 flex items-center justify-between sticky top-0 z-20">
          <div>
            <motion.h1 
              initial={{opacity:0,x:-20}} 
              animate={{opacity:1,x:0}}
              className="text-3xl font-black mb-1"
              style={{color:'var(--text-1)'}}
            >
              Welcome back, {worker?.name?.split(' ')[0]} 👋
            </motion.h1>
            <div className="flex items-center gap-4 text-sm font-medium" style={{color:'var(--text-2)'}}>
              <span className="flex items-center gap-2">
                <MapPin size={14} className="text-orange-400" />
                {worker?.city}
              </span>
              <span>•</span>
              <span>{worker?.platform}</span>
              <span>•</span>
              <span className="flex items-center gap-2">
                <Clock size={14} className="text-orange-400" />
                {worker?.weekly_hours}h/week
              </span>
            </div>
          </div>
          {!activePolicy && (
            <motion.button 
              initial={{opacity:0,scale:0.9}} 
              animate={{opacity:1,scale:1}}
              onClick={activatePolicy} 
              disabled={activating}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-base text-white shadow-2xl transition-all hover:scale-105"
              style={{background:'linear-gradient(135deg,#f97316,#ea580c)'}}
            >
              <Plus size={20} strokeWidth={3} />
              {activating ? 'Activating...' : 'Activate Policy'}
            </motion.button>
          )}
        </div>

        <div className="p-10 space-y-8 max-w-[1800px]">
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-6">
            <StatCard label="Risk Score" value={`${riskScore}%`} icon={TrendingUp} color="#f97316" delay={0} sub={riskProfile?.tier+' tier'} trend={-5} />
            <StatCard label="Weekly Premium" value={riskProfile ? `₹${riskProfile.premium}` : '—'} icon={IndianRupee} color="#3b82f6" delay={0.1} sub="This week" />
            <StatCard label="Total Claims" value={totalClaims} icon={FileText} color="#8b5cf6" delay={0.2} sub={`₹${totalPaid} paid out`} trend={12} />
            <StatCard label="Max Coverage" value={riskProfile ? `₹${riskProfile.coverage}` : '—'} icon={Shield} color="#22c55e" delay={0.3} sub="Per week" />
          </div>

          {/* Live Conditions */}
          {worker?.city && <LiveConditions city={worker.city} />}

          {/* Main Content Grid */}
          <div className="grid grid-cols-3 gap-6">
            {/* Risk Profile - 1 col */}
            <motion.div 
              initial={{opacity:0,y:20}} 
              animate={{opacity:1,y:0}} 
              transition={{delay:0.4}}
              className="glass-card-strong p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black mb-1" style={{color:'var(--text-1)'}}>Risk Profile</h2>
                  <p className="text-sm font-medium" style={{color:'var(--text-2)'}}>AI-computed assessment</p>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-xs font-black uppercase ${
                  riskScore < 40 ? 'bg-green-500/15 text-green-400' :
                  riskScore < 70 ? 'bg-yellow-500/15 text-yellow-400' :
                  'bg-red-500/15 text-red-400'
                }`}>
                  {riskProfile?.tier}
                </div>
              </div>

              <div className="flex items-center justify-center mb-8">
                <div className="relative w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart 
                      cx="50%" cy="50%" 
                      innerRadius="70%" outerRadius="100%" 
                      data={[{value:riskScore}]} 
                      startAngle={90} endAngle={-270}
                    >
                      <RadialBar 
                        dataKey="value" 
                        fill="#f97316" 
                        background={{fill:'rgba(255,255,255,0.05)'}}
                        cornerRadius={10}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-5xl font-black" style={{color:'var(--text-1)'}}>{riskScore}%</p>
                    <p className="text-sm font-semibold" style={{color:'var(--text-2)'}}>Risk Score</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl" style={{background:'var(--bg-2)'}}>
                  <span className="text-sm font-semibold" style={{color:'var(--text-2)'}}>Weekly Premium</span>
                  <span className="text-lg font-black text-orange-400">₹{riskProfile?.premium}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl" style={{background:'var(--bg-2)'}}>
                  <span className="text-sm font-semibold" style={{color:'var(--text-2)'}}>Coverage</span>
                  <span className="text-lg font-black text-green-400">₹{riskProfile?.coverage}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl" style={{background:'var(--bg-2)'}}>
                  <span className="text-sm font-semibold" style={{color:'var(--text-2)'}}>City</span>
                  <span className="text-lg font-black" style={{color:'var(--text-1)'}}>{worker?.city}</span>
                </div>
              </div>
            </motion.div>

            {/* Policy Status - 2 cols */}
            <motion.div 
              initial={{opacity:0,y:20}} 
              animate={{opacity:1,y:0}} 
              transition={{delay:0.5}}
              className="col-span-2 glass-card-strong p-8"
            >
              <h2 className="text-xl font-black mb-6" style={{color:'var(--text-1)'}}>Weekly Policy Status</h2>
              {activePolicy ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
                    <div className="w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center">
                      <CheckCircle size={32} className="text-green-400" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <p className="text-2xl font-black mb-1" style={{color:'var(--text-1)'}}>Policy Active</p>
                      <p className="text-sm font-medium" style={{color:'var(--text-2)'}}>You're covered for this week</p>
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
                      <p className="text-2xl font-black text-orange-400">{(activePolicy.risk_score*100).toFixed(0)}%</p>
                    </div>
                    <div className="p-5 rounded-xl" style={{background:'var(--bg-2)'}}>
                      <p className="text-xs font-bold uppercase mb-2" style={{color:'var(--text-3)'}}>Period</p>
                      <p className="text-sm font-black" style={{color:'var(--text-1)'}}>
                        {new Date(activePolicy.week_start).toLocaleDateString('en-IN',{day:'numeric',month:'short'})} - {new Date(activePolicy.week_end).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl" style={{background:'var(--bg-2)'}}>
                    <p className="text-xs font-bold uppercase mb-3" style={{color:'var(--text-3)'}}>Week Progress</p>
                    <div className="h-3 rounded-full overflow-hidden" style={{background:'var(--border)'}}>
                      <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full" style={{width:'65%'}} />
                    </div>
                    <p className="text-xs font-semibold mt-2" style={{color:'var(--text-2)'}}>4 days remaining</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
                    <Shield size={40} className="text-gray-600" />
                  </div>
                  <p className="text-xl font-bold mb-2" style={{color:'var(--text-2)'}}>No Active Policy</p>
                  <p className="text-sm mb-6" style={{color:'var(--text-3)'}}>Activate a policy to get covered this week</p>
                  <button onClick={activatePolicy} disabled={activating}
                    className="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:scale-105 transition-transform">
                    Activate Now
                  </button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-2 gap-6">
            {/* Coverage Trend */}
            <motion.div 
              initial={{opacity:0,y:20}} 
              animate={{opacity:1,y:0}} 
              transition={{delay:0.6}}
              className="glass-card-strong p-8"
            >
              <h2 className="text-xl font-black mb-6" style={{color:'var(--text-1)'}}>Coverage & Claims Trend</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockCoverageData}>
                    <defs>
                      <linearGradient id="cg1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="cg2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="week" stroke="rgba(255,255,255,0.2)" tick={{fill:'#9ca3af',fontSize:12}} />
                    <YAxis stroke="rgba(255,255,255,0.2)" tick={{fill:'#9ca3af',fontSize:12}} />
                    <Tooltip contentStyle={{background:'rgba(0,0,0,0.9)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',color:'#fff'}} />
                    <Area type="monotone" dataKey="coverage" stroke="#f97316" strokeWidth={3} fill="url(#cg1)" />
                    <Area type="monotone" dataKey="claims" stroke="#ef4444" strokeWidth={3} fill="url(#cg2)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Activity */}
            <motion.div 
              initial={{opacity:0,y:20}} 
              animate={{opacity:1,y:0}} 
              transition={{delay:0.7}}
              className="glass-card-strong p-8"
            >
              <h2 className="text-xl font-black mb-6" style={{color:'var(--text-1)'}}>Weekly Activity</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockActivityData}>
                    <XAxis dataKey="day" stroke="rgba(255,255,255,0.2)" tick={{fill:'#9ca3af',fontSize:12}} />
                    <YAxis stroke="rgba(255,255,255,0.2)" tick={{fill:'#9ca3af',fontSize:12}} />
                    <Tooltip contentStyle={{background:'rgba(0,0,0,0.9)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',color:'#fff'}} />
                    <Bar dataKey="hours" fill="#3b82f6" radius={[8,8,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Claims Table */}
          <motion.div 
            initial={{opacity:0,y:20}} 
            animate={{opacity:1,y:0}} 
            transition={{delay:0.8}}
            className="glass-card-strong p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black mb-1" style={{color:'var(--text-1)'}}>Claims History</h2>
                <p className="text-sm font-medium" style={{color:'var(--text-2)'}}>Auto-generated on trigger events</p>
              </div>
              {totalClaims > 0 && (
                <div className="px-4 py-2 rounded-full bg-orange-500/15 text-orange-400 font-black text-sm">
                  {totalClaims} claims
                </div>
              )}
            </div>
            <ClaimsTable claims={claims} />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
