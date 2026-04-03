import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, Eye, Flag, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const TT = { background:'rgba(0,0,0,0.85)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', fontSize:'12px', color:'#fff' };

const fraudDist = [
  {range:'0-10%',count:45},{range:'10-30%',count:28},{range:'30-50%',count:12},
  {range:'50-70%',count:8},{range:'70-90%',count:5},{range:'90-100%',count:2},
];
const watchlist = [
  { id:'w1', name:'Rahul Verma',   city:'Delhi',   score:0.82, pattern:'Zone mismatch',       claims:5, status:'investigating' },
  { id:'w2', name:'Priya Nair',    city:'Mumbai',  score:0.76, pattern:'High frequency',      claims:8, status:'flagged'       },
  { id:'w3', name:'Amit Gupta',    city:'Kolkata', score:0.71, pattern:'Off-hours claiming',  claims:3, status:'watchlist'     },
];
const patterns = [
  { pattern:'Zone mismatch (GPS vs claim zone)', count:3, severity:'high'   },
  { pattern:'Claim frequency > 3/week',          count:5, severity:'medium' },
  { pattern:'Off-hours trigger claims',           count:2, severity:'medium' },
  { pattern:'Multiple claims same trigger',       count:1, severity:'high'   },
];

export default function Fraud() {
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-black" style={{color:'var(--text-1)'}}>Fraud & Risk Console</h2><p className="text-sm" style={{color:'var(--text-3)'}}>Aggregated anomaly detection — Isolation Forest model</p></div>

      <div className="grid grid-cols-3 gap-5">
        <div className="glass-card-strong p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4"><ShieldAlert size={15} style={{color:'#ef4444'}} /><h3 className="font-bold text-sm" style={{color:'var(--text-1)'}}>Fraud Score Distribution</h3></div>
          <div className="h-40"><ResponsiveContainer width="100%" height="100%"><BarChart data={fraudDist} barSize={18}><XAxis dataKey="range" tick={{fill:'rgba(255,255,255,0.4)',fontSize:9}} axisLine={false} tickLine={false} /><YAxis tick={{fill:'rgba(255,255,255,0.4)',fontSize:9}} axisLine={false} tickLine={false} /><Tooltip contentStyle={TT} /><Bar dataKey="count" fill="#ef4444" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div>
        </div>

        <div className="glass-card-strong p-6 rounded-2xl col-span-2">
          <div className="flex items-center gap-2 mb-4"><AlertTriangle size={15} style={{color:'#f59e0b'}} /><h3 className="font-bold text-sm" style={{color:'var(--text-1)'}}>Suspicious Patterns Detected</h3></div>
          <div className="space-y-3">
            {patterns.map((p,i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{background:'var(--bg-2)'}}>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${p.severity==='high'?'bg-red-400':'bg-yellow-400'}`} />
                  <span className="text-sm font-medium" style={{color:'var(--text-1)'}}>{p.pattern}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold px-2 py-1 rounded-full" style={{background:p.severity==='high'?'rgba(239,68,68,0.15)':'rgba(245,158,11,0.15)',color:p.severity==='high'?'#ef4444':'#f59e0b'}}>{p.severity}</span>
                  <span className="text-sm font-black" style={{color:'var(--text-1)'}}>{p.count} cases</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card-strong rounded-2xl overflow-hidden">
        <div className="px-5 py-4 flex items-center gap-3" style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
          <Flag size={15} style={{color:'#ef4444'}} />
          <h3 className="font-bold" style={{color:'var(--text-1)'}}>Watchlist Accounts</h3>
          <span className="ml-auto text-xs px-3 py-1 rounded-full font-bold" style={{background:'rgba(239,68,68,0.1)',color:'#ef4444'}}>{watchlist.length} flagged</span>
        </div>
        <table className="w-full text-sm">
          <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
            {['Worker','City','Fraud Score','Pattern','Claims','Status','Actions'].map(h=>(
              <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{color:'var(--text-3)'}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {watchlist.map((w,i) => (
              <motion.tr key={w.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.05}}
                className="hover:bg-white/5 transition-colors" style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                <td className="px-5 py-3.5 font-semibold" style={{color:'var(--text-1)'}}>{w.name}</td>
                <td className="px-5 py-3.5" style={{color:'var(--text-2)'}}>{w.city}</td>
                <td className="px-5 py-3.5 font-black text-red-400">{(w.score*100).toFixed(0)}%</td>
                <td className="px-5 py-3.5 text-xs" style={{color:'var(--text-2)'}}>{w.pattern}</td>
                <td className="px-5 py-3.5 font-bold" style={{color:'var(--text-1)'}}>{w.claims}</td>
                <td className="px-5 py-3.5">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold capitalize" style={{background:'rgba(239,68,68,0.15)',color:'#ef4444'}}>{w.status}</span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-1.5">
                    <button className="p-1.5 rounded-lg hover:bg-white/10"><Eye size={13} style={{color:'var(--text-3)'}} /></button>
                    <button className="p-1.5 rounded-lg hover:bg-green-500/10" title="Clear"><CheckCircle size={13} className="text-green-400" /></button>
                    <button className="p-1.5 rounded-lg hover:bg-red-500/10" title="Escalate"><AlertTriangle size={13} className="text-red-400" /></button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
