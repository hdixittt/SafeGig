import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, Zap, AlertTriangle, IndianRupee, ShieldAlert, TrendingUp, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { adminApi } from '../../api';

const TT = { background:'rgba(0,0,0,0.85)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', fontSize:'12px', color:'#fff' };
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const TIER_COLORS = { Low:'#22c55e', Standard:'#3b82f6', High:'#f59e0b', Critical:'#ef4444' };

function getRiskTier(worker) {
  const cityRisk = { mumbai:0.72, delhi:0.68, bangalore:0.42, bengaluru:0.42, chennai:0.58, kolkata:0.63, hyderabad:0.48, pune:0.38, ahmedabad:0.52, gurgaon:0.55, gurugram:0.55, noida:0.58 };
  const base = cityRisk[worker.city?.toLowerCase().trim()] ?? 0.50;
  const score = Math.min(base + Math.min((worker.weekly_hours||40)/80,1)*0.18 + 0.05, 1.0);
  if (score <= 0.25) return 'Low';
  if (score <= 0.50) return 'Standard';
  if (score <= 0.75) return 'High';
  return 'Critical';
}

function SC({ label, value, icon: Icon, color, sub, delay }) {
  return (
    <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay}} className="stat-card-premium">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{background:`${color}18`}}>
        <Icon size={18} style={{color}} strokeWidth={2} />
      </div>
      <p className="text-2xl font-black mb-1" style={{color:'var(--text-1)'}}>{value}</p>
      <p className="text-sm font-semibold" style={{color:'var(--text-2)'}}>{label}</p>
      {sub && <p className="text-xs mt-1" style={{color:'var(--text-3)'}}>{sub}</p>}
    </motion.div>
  );
}

export default function Overview() {
  const [stats, setStats]         = useState({ workers:0, policies:0, claims:0, payouts:0, fraud:0 });
  const [payoutChart, setPayoutChart] = useState(DAYS.map(d=>({day:d,amount:0})));
  const [claimChart, setClaimChart]   = useState(DAYS.map(d=>({day:d,claims:0})));
  const [tierData, setTierData]       = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [w, p, c, py, workers, payouts, claims] = await Promise.all([
          adminApi.get('/admin/stats/workers'),
          adminApi.get('/admin/stats/policies'),
          adminApi.get('/admin/stats/claims'),
          adminApi.get('/admin/stats/payouts'),
          adminApi.get('/admin/workers'),
          adminApi.get('/admin/payouts'),
          adminApi.get('/admin/claims'),
        ]);

        setStats({
          workers:  w.data.total,
          policies: p.data.active,
          claims:   c.data.pending,
          payouts:  py.data.total_amount,
          fraud:    c.data.flagged,
        });

        // Build payout chart — aggregate by day of week
        const pd = DAYS.map(d=>({day:d,amount:0}));
        (payouts.data||[]).forEach(p => {
          const d = new Date(p.initiated_at).getDay();
          pd[d].amount += p.amount || 0;
        });
        setPayoutChart(pd);

        // Build claims chart — aggregate by day of week
        const cd = DAYS.map(d=>({day:d,claims:0}));
        (claims.data||[]).forEach(c => {
          const d = new Date(c.initiated_at).getDay();
          cd[d].claims += 1;
        });
        setClaimChart(cd);

        // Build tier distribution from real workers
        const tiers = { Low:0, Standard:0, High:0, Critical:0 };
        (workers.data||[]).forEach(w => { const t = getRiskTier(w); tiers[t]++; });
        const total = Object.values(tiers).reduce((a,b)=>a+b,0) || 1;
        setTierData(Object.entries(tiers).map(([name,count])=>({
          name, value: Math.round((count/total)*100), color: TIER_COLORS[name]
        })).filter(t=>t.value>0));

      } catch(e) { console.error('Overview stats failed:', e); }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black mb-1" style={{color:'var(--text-1)'}}>Command Center</h2>
        <p className="text-sm" style={{color:'var(--text-3)'}}>Real-time platform pulse</p>
      </div>
      <div className="grid grid-cols-6 gap-4">
        <SC label="Active Workers"  value={stats.workers}  icon={Users}        color="#3b82f6" delay={0}    sub="Registered" />
        <SC label="Active Policies" value={stats.policies} icon={Shield}       color="#22c55e" delay={0.05} sub="This week" />
        <SC label="Pending Claims"  value={stats.claims}   icon={AlertTriangle} color="#f59e0b" delay={0.1}  sub="Awaiting review" />
        <SC label="Fraud Flags"     value={stats.fraud}    icon={ShieldAlert}  color="#ef4444" delay={0.15} sub="Under review" />
        <SC label="Total Payouts"   value={`₹${(stats.payouts||0).toLocaleString()}`} icon={IndianRupee} color="#8b5cf6" delay={0.2} sub="All time" />
        <SC label="Triggers"        value={claimChart.reduce((s,d)=>s+d.claims,0)} icon={Zap} color="#f97316" delay={0.25} sub="This week" />
      </div>

      <div className="grid grid-cols-3 gap-5">
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.3}} className="glass-card-strong p-6">
          <div className="flex items-center gap-2 mb-4"><TrendingUp size={15} style={{color:'#f97316'}} /><p className="text-sm font-bold" style={{color:'var(--text-1)'}}>Weekly Payouts (₹)</p></div>
          <div className="h-40"><ResponsiveContainer width="100%" height="100%"><BarChart data={payoutChart} barSize={12}><XAxis dataKey="day" tick={{fill:'rgba(255,255,255,0.4)',fontSize:10}} axisLine={false} tickLine={false} /><YAxis tick={{fill:'rgba(255,255,255,0.4)',fontSize:10}} axisLine={false} tickLine={false} /><Tooltip contentStyle={TT} cursor={{fill:'rgba(255,255,255,0.04)'}} /><Bar dataKey="amount" fill="#f97316" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div>
        </motion.div>

        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.35}} className="glass-card-strong p-6">
          <div className="flex items-center gap-2 mb-4"><Activity size={15} style={{color:'#8b5cf6'}} /><p className="text-sm font-bold" style={{color:'var(--text-1)'}}>Claims This Week</p></div>
          <div className="h-40"><ResponsiveContainer width="100%" height="100%"><LineChart data={claimChart}><XAxis dataKey="day" tick={{fill:'rgba(255,255,255,0.4)',fontSize:10}} axisLine={false} tickLine={false} /><YAxis tick={{fill:'rgba(255,255,255,0.4)',fontSize:10}} axisLine={false} tickLine={false} /><Tooltip contentStyle={TT} /><Line type="monotone" dataKey="claims" stroke="#8b5cf6" strokeWidth={2.5} dot={{fill:'#8b5cf6',r:3}} /></LineChart></ResponsiveContainer></div>
        </motion.div>

        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.4}} className="glass-card-strong p-6">
          <div className="flex items-center gap-2 mb-4"><Shield size={15} style={{color:'#22c55e'}} /><p className="text-sm font-bold" style={{color:'var(--text-1)'}}>Risk Tier Distribution</p></div>
          {tierData.length === 0 ? (
            <div className="flex items-center justify-center h-28 text-sm" style={{color:'var(--text-3)'}}>No workers yet</div>
          ) : (
            <div className="flex items-center gap-4 mt-2">
              <div className="h-28 w-28 flex-shrink-0"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={tierData} cx="50%" cy="50%" innerRadius={26} outerRadius={44} dataKey="value" paddingAngle={3}>{tierData.map((e,i)=><Cell key={i} fill={e.color} />)}</Pie></PieChart></ResponsiveContainer></div>
              <div className="space-y-2 flex-1">{tierData.map(t=><div key={t.name} className="flex items-center gap-2 text-xs"><div className="w-2 h-2 rounded-full" style={{background:t.color}} /><span className="flex-1" style={{color:'var(--text-2)'}}>{t.name}</span><span className="font-bold" style={{color:'var(--text-1)'}}>{t.value}%</span></div>)}</div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
// Note: predictive analytics section added below the existing component via separate export
