import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, IndianRupee, Zap, RefreshCw, CloudRain, Thermometer, Wind, AlertOctagon, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { adminApi } from '../../api';

const TT = { background:'rgba(255,255,255,0.97)', border:'1px solid rgba(203,203,203,0.5)', borderRadius:'10px', fontSize:'12px', color:'#4A4A4A' };

const TRIGGER_ICONS = {
  heavy_rain: CloudRain, extreme_heat: Thermometer,
  severe_pollution: Wind, curfew_strike: AlertOctagon, road_accident_surge: AlertTriangle,
};
const TRIGGER_COLORS = {
  heavy_rain:'#3b82f6', extreme_heat:'#6D8196', severe_pollution:'#8b5cf6',
  curfew_strike:'#ef4444', road_accident_surge:'#f59e0b',
};

export default function Analytics() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    adminApi.get('/admin/analytics')
      .then(r => setData(r.data))
      .catch(e => console.error('Analytics failed:', e))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  if (loading || !data) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-yellow-400/20 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );

  const lossColor = data.loss_ratio > 80 ? '#ef4444' : data.loss_ratio > 50 ? '#f59e0b' : '#22c55e';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black" style={{color:'var(--text-1)'}}>Predictive Analytics</h2>
          <p className="text-sm" style={{color:'var(--text-3)'}}>Loss ratios, next-week forecasts, trigger probability models</p>
        </div>
        <button onClick={fetch} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
          <RefreshCw size={15} style={{color:'var(--text-3)'}} className={loading?'animate-spin':''} />
        </button>
      </div>

      {/* Loss Ratio + Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {[
          ['Loss Ratio', `${data.loss_ratio}%`, lossColor, 'Claims paid / premiums collected'],
          ['Total Premium', `₹${data.total_premium_collected.toLocaleString()}`, '#22c55e', 'All time collected'],
          ['Total Paid Out', `₹${data.total_paid_out.toLocaleString()}`, '#8b5cf6', 'All time disbursed'],
          ['Active Policies', data.active_policies, '#3b82f6', 'Currently covered workers'],
        ].map(([label, value, color, sub]) => (
          <div key={label} className="glass-card-strong p-5 rounded-2xl">
            <p className="text-xs font-bold uppercase mb-2" style={{color:'var(--text-3)'}}>{label}</p>
            <p className="text-3xl font-black mb-1" style={{color}}>{value}</p>
            <p className="text-xs" style={{color:'var(--text-3)'}}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Weekly Trend */}
      <div className="grid grid-cols-2 gap-5">
        <div className="glass-card-strong p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4"><TrendingUp size={15} style={{color:'#4A4A4A'}} /><h3 className="font-bold text-sm" style={{color:'var(--text-1)'}}>Premium vs Payout Trend</h3></div>
          <div className="h-48"><ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.weekly_trend}>
              <defs>
                <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/><stop offset="95%" stopColor="#22c55e" stopOpacity={0}/></linearGradient>
                <linearGradient id="og" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{fill:'rgba(74,74,74,0.45)',fontSize:10}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill:'rgba(74,74,74,0.45)',fontSize:10}} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TT} />
              <Area type="monotone" dataKey="premium" stroke="#22c55e" strokeWidth={2} fill="url(#pg)" name="Premium" />
              <Area type="monotone" dataKey="payout" stroke="#ef4444" strokeWidth={2} fill="url(#og)" name="Payout" />
            </AreaChart>
          </ResponsiveContainer></div>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-green-400" /><span className="text-xs" style={{color:'var(--text-3)'}}>Premium</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-red-400" /><span className="text-xs" style={{color:'var(--text-3)'}}>Payout</span></div>
          </div>
        </div>

        <div className="glass-card-strong p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4"><Zap size={15} style={{color:'#4A4A4A'}} /><h3 className="font-bold text-sm" style={{color:'var(--text-1)'}}>Claims by Trigger Type</h3></div>
          {data.trigger_breakdown.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-sm" style={{color:'var(--text-3)'}}>No claims yet</div>
          ) : (
            <div className="h-48"><ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.trigger_breakdown} barSize={20}>
                <XAxis dataKey="type" tick={{fill:'rgba(74,74,74,0.45)',fontSize:9}} axisLine={false} tickLine={false} tickFormatter={v=>v.replace(/_/g,' ').slice(0,8)} />
                <YAxis tick={{fill:'rgba(74,74,74,0.45)',fontSize:10}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TT} />
                <Bar dataKey="count" fill="#6D8196" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer></div>
          )}
        </div>
      </div>

      {/* Predictive Next Week */}
      <div className="glass-card-strong p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-5">
          <TrendingUp size={16} style={{color:'#8b5cf6'}} />
          <h3 className="font-bold" style={{color:'var(--text-1)'}}>Next Week Disruption Forecast</h3>
          <span className="text-xs px-2.5 py-1 rounded-full font-bold ml-auto" style={{background:'rgba(139,92,246,0.15)',color:'#8b5cf6'}}>ML Prediction</span>
        </div>
        <div className="grid grid-cols-5 gap-4">
          {data.predicted_next_week.map(p => {
            const Icon = TRIGGER_ICONS[p.type] || Zap;
            const color = TRIGGER_COLORS[p.type] || '#6b7280';
            return (
              <motion.div key={p.type} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
                className="p-4 rounded-2xl" style={{background:`${color}10`, border:`1px solid ${color}25`}}>
                <Icon size={18} style={{color}} className="mb-3" strokeWidth={2.5} />
                <p className="text-xs font-bold mb-2 capitalize" style={{color:'var(--text-2)'}}>{p.type.replace(/_/g,' ')}</p>
                <p className="text-2xl font-black mb-1" style={{color}}>{p.probability}%</p>
                <p className="text-xs" style={{color:'var(--text-3)'}}>~{p.expected_claims} claims</p>
                <p className="text-xs font-bold mt-1" style={{color}}>₹{p.expected_payout.toLocaleString()} exposure</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
