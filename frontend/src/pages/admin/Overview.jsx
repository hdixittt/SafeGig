import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, Zap, AlertTriangle, IndianRupee, ShieldAlert, TrendingUp, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { adminApi as api } from '../../api';

const TT = { background:'rgba(0,0,0,0.85)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', fontSize:'12px', color:'#fff' };

const payoutData = [
  {day:'Mon',amount:450},{day:'Tue',amount:0},{day:'Wed',amount:750},
  {day:'Thu',amount:300},{day:'Fri',amount:900},{day:'Sat',amount:450},{day:'Sun',amount:0},
];
const claimTrend = [
  {day:'Mon',claims:2},{day:'Tue',claims:0},{day:'Wed',claims:5},
  {day:'Thu',claims:3},{day:'Fri',claims:7},{day:'Sat',claims:4},{day:'Sun',claims:1},
];
const tierData = [
  {name:'Low',value:30,color:'#22c55e'},{name:'Standard',value:45,color:'#3b82f6'},
  {name:'High',value:18,color:'#f59e0b'},{name:'Critical',value:7,color:'#ef4444'},
];

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
  const [stats, setStats] = useState({ workers:0, policies:0, claims:0, payouts:0, triggers:0, fraud:0 });

  useEffect(() => {
    (async () => {
      try {
        const [w, p, c, py] = await Promise.all([
          api.get('/admin/stats/workers'),
          api.get('/admin/stats/policies'),
          api.get('/admin/stats/claims'),
          api.get('/admin/stats/payouts'),
        ]);
        setStats({ workers: w.data.total, policies: p.data.active, claims: c.data.pending, payouts: py.data.total_amount, triggers: p.data.triggers_today || 0, fraud: c.data.flagged || 0 });
      } catch { /* use mock */ }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black mb-1" style={{color:'var(--text-1)'}}>Command Center</h2>
        <p className="text-sm" style={{color:'var(--text-3)'}}>Real-time platform pulse</p>
      </div>
      <div className="grid grid-cols-6 gap-4">
        <SC label="Active Workers"    value={stats.workers  || 1}    icon={Users}       color="#3b82f6" delay={0}    sub="Registered" />
        <SC label="Policies Today"    value={stats.policies || 1}    icon={Shield}      color="#22c55e" delay={0.05} sub="Active" />
        <SC label="Triggers Fired"    value={stats.triggers || 3}    icon={Zap}         color="#f97316" delay={0.1}  sub="This week" />
        <SC label="Pending Claims"    value={stats.claims   || 2}    icon={AlertTriangle} color="#f59e0b" delay={0.15} sub="Awaiting review" />
        <SC label="Total Payouts"     value={`₹${(stats.payouts||2850).toLocaleString()}`} icon={IndianRupee} color="#8b5cf6" delay={0.2} sub="This week" />
        <SC label="Fraud Flags"       value={stats.fraud    || 1}    icon={ShieldAlert} color="#ef4444" delay={0.25} sub="Under review" />
      </div>

      <div className="grid grid-cols-3 gap-5">
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.3}} className="glass-card-strong p-6 col-span-1">
          <div className="flex items-center gap-2 mb-4"><TrendingUp size={15} style={{color:'#f97316'}} /><p className="text-sm font-bold" style={{color:'var(--text-1)'}}>Weekly Payouts (₹)</p></div>
          <div className="h-40"><ResponsiveContainer width="100%" height="100%"><BarChart data={payoutData} barSize={12}><XAxis dataKey="day" tick={{fill:'rgba(255,255,255,0.4)',fontSize:10}} axisLine={false} tickLine={false} /><YAxis tick={{fill:'rgba(255,255,255,0.4)',fontSize:10}} axisLine={false} tickLine={false} /><Tooltip contentStyle={TT} cursor={{fill:'rgba(255,255,255,0.04)'}} /><Bar dataKey="amount" fill="#f97316" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div>
        </motion.div>

        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.35}} className="glass-card-strong p-6 col-span-1">
          <div className="flex items-center gap-2 mb-4"><Activity size={15} style={{color:'#8b5cf6'}} /><p className="text-sm font-bold" style={{color:'var(--text-1)'}}>Claims This Week</p></div>
          <div className="h-40"><ResponsiveContainer width="100%" height="100%"><LineChart data={claimTrend}><XAxis dataKey="day" tick={{fill:'rgba(255,255,255,0.4)',fontSize:10}} axisLine={false} tickLine={false} /><YAxis tick={{fill:'rgba(255,255,255,0.4)',fontSize:10}} axisLine={false} tickLine={false} /><Tooltip contentStyle={TT} /><Line type="monotone" dataKey="claims" stroke="#8b5cf6" strokeWidth={2.5} dot={{fill:'#8b5cf6',r:3}} /></LineChart></ResponsiveContainer></div>
        </motion.div>

        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.4}} className="glass-card-strong p-6 col-span-1">
          <div className="flex items-center gap-2 mb-4"><Shield size={15} style={{color:'#22c55e'}} /><p className="text-sm font-bold" style={{color:'var(--text-1)'}}>Risk Tier Distribution</p></div>
          <div className="flex items-center gap-4 mt-2">
            <div className="h-28 w-28 flex-shrink-0"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={tierData} cx="50%" cy="50%" innerRadius={26} outerRadius={44} dataKey="value" paddingAngle={3}>{tierData.map((e,i)=><Cell key={i} fill={e.color} />)}</Pie></PieChart></ResponsiveContainer></div>
            <div className="space-y-2 flex-1">{tierData.map(t=><div key={t.name} className="flex items-center gap-2 text-xs"><div className="w-2 h-2 rounded-full" style={{background:t.color}} /><span className="flex-1" style={{color:'var(--text-2)'}}>{t.name}</span><span className="font-bold" style={{color:'var(--text-1)'}}>{t.value}%</span></div>)}</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
