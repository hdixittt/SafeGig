import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, RefreshCw, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const TT = { background:'rgba(255,255,255,0.97)', border:'1px solid rgba(203,203,203,0.5)', borderRadius:'10px', fontSize:'12px', color:'#4A4A4A' };

const predVsActual = [
  {week:'W1',predicted:72,actual:68},{week:'W2',predicted:65,actual:70},{week:'W3',predicted:80,actual:78},
  {week:'W4',predicted:55,actual:58},{week:'W5',predicted:88,actual:85},{week:'W6',predicted:62,actual:65},
];
const driftData = [
  {day:'Mon',drift:0.02},{day:'Tue',drift:0.03},{day:'Wed',drift:0.05},{day:'Thu',drift:0.04},
  {day:'Fri',drift:0.08},{day:'Sat',drift:0.06},{day:'Sun',drift:0.09},
];

export default function MLHealth() {
  const [retraining, setRetraining] = useState(false);
  const [lastRetrain, setLastRetrain] = useState('2026-03-28 02:00 AM');

  const triggerRetrain = () => {
    setRetraining(true);
    setTimeout(() => { setRetraining(false); setLastRetrain('Just now'); }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-black" style={{color:'var(--text-1)'}}>ML Model Health</h2><p className="text-sm" style={{color:'var(--text-3)'}}>Last retrained: {lastRetrain}</p></div>
        <button onClick={triggerRetrain} disabled={retraining}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-105 disabled:opacity-60"
          style={{background:'linear-gradient(135deg,#8b5cf6,#7c3aed)'}}>
          <RefreshCw size={14} className={retraining?'animate-spin':''} />
          {retraining ? 'Retraining...' : 'Trigger Retrain'}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[['Accuracy','94.2%','#22c55e',CheckCircle],['AUC-ROC','0.91','#3b82f6',TrendingUp],['Precision','92.8%','#4A4A4A',Activity],['Drift Score','0.06','#f59e0b',AlertTriangle]].map(([l,v,c,Icon])=>(
          <div key={l} className="glass-card-strong p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-3"><Icon size={14} style={{color:c}} /><span className="text-xs font-bold uppercase" style={{color:'var(--text-3)'}}>{l}</span></div>
            <p className="text-3xl font-black" style={{color:c}}>{v}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="glass-card-strong p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4"><TrendingUp size={15} style={{color:'#3b82f6'}} /><h3 className="font-bold text-sm" style={{color:'var(--text-1)'}}>Predicted vs Actual Risk Score</h3></div>
          <div className="h-48"><ResponsiveContainer width="100%" height="100%"><LineChart data={predVsActual}><XAxis dataKey="week" tick={{fill:'rgba(74,74,74,0.45)',fontSize:10}} axisLine={false} tickLine={false} /><YAxis tick={{fill:'rgba(74,74,74,0.45)',fontSize:10}} axisLine={false} tickLine={false} /><Tooltip contentStyle={TT} /><Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={2} dot={{r:3}} strokeDasharray="5 3" /><Line type="monotone" dataKey="actual" stroke="#22c55e" strokeWidth={2} dot={{r:3}} /></LineChart></ResponsiveContainer></div>
          <div className="flex gap-4 mt-2"><div className="flex items-center gap-1.5"><div className="w-4 h-0.5 bg-blue-400" style={{borderTop:'2px dashed #3b82f6'}} /><span className="text-xs" style={{color:'var(--text-3)'}}>Predicted</span></div><div className="flex items-center gap-1.5"><div className="w-4 h-0.5 bg-green-400" /><span className="text-xs" style={{color:'var(--text-3)'}}>Actual</span></div></div>
        </div>

        <div className="glass-card-strong p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={15} style={{color:'#f59e0b'}} />
            <h3 className="font-bold text-sm" style={{color:'var(--text-1)'}}>Model Drift (7-day)</h3>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold" style={{background:'rgba(245,158,11,0.15)',color:'#f59e0b'}}>Moderate drift</span>
          </div>
          <div className="h-48"><ResponsiveContainer width="100%" height="100%"><AreaChart data={driftData}><defs><linearGradient id="dg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} /><stop offset="95%" stopColor="#f59e0b" stopOpacity={0} /></linearGradient></defs><XAxis dataKey="day" tick={{fill:'rgba(74,74,74,0.45)',fontSize:10}} axisLine={false} tickLine={false} /><YAxis tick={{fill:'rgba(74,74,74,0.45)',fontSize:10}} axisLine={false} tickLine={false} /><Tooltip contentStyle={TT} /><Area type="monotone" dataKey="drift" stroke="#f59e0b" strokeWidth={2} fill="url(#dg)" /></AreaChart></ResponsiveContainer></div>
          <p className="text-xs mt-2" style={{color:'var(--text-3)'}}>Drift threshold: 0.10 — retrain recommended if sustained above threshold</p>
        </div>
      </div>
    </div>
  );
}
