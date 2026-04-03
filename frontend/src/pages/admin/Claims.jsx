import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Zap, CloudRain, Thermometer, Wind, AlertOctagon, Eye, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react';
import { adminApi } from '../../api';

const STATUS_CFG = {
  paid:          { color:'#22c55e', label:'Paid'         },
  approved:      { color:'#3b82f6', label:'Approved'     },
  manual_review: { color:'#f59e0b', label:'Under Review' },
  rejected:      { color:'#ef4444', label:'Rejected'     },
};
const TRIGGER_META = {
  heavy_rain:          { icon:CloudRain,     color:'#3b82f6', label:'Heavy Rain'       },
  extreme_heat:        { icon:Thermometer,   color:'#f97316', label:'Extreme Heat'     },
  severe_pollution:    { icon:Wind,          color:'#8b5cf6', label:'Severe Pollution' },
  curfew_strike:       { icon:AlertOctagon,  color:'#ef4444', label:'Curfew/Strike'    },
  road_accident_surge: { icon:AlertTriangle, color:'#f59e0b', label:'Accident Surge'   },
};

export default function Claims() {
  const [claims, setClaims] = useState([]);
  const [filter, setFilter] = useState('all');
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchClaims = () => {
    setLoading(true);
    adminApi.get('/admin/claims')
      .then(r => setClaims(r.data))
      .catch(e => console.error('Claims fetch failed:', e))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchClaims(); }, []);

  const shown = filter === 'all' ? claims : claims.filter(c => c.status === filter);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-black" style={{color:'var(--text-1)'}}>Claims Management</h2><p className="text-sm" style={{color:'var(--text-3)'}}>Full pipeline: Initiated → Review → Approved → Paid</p></div>
        <div className="flex items-center gap-3">
          <button onClick={fetchClaims} className="p-2 rounded-xl hover:bg-white/10 transition-colors"><RefreshCw size={15} style={{color:'var(--text-3)'}} className={loading?'animate-spin':''} /></button>
          <div className="flex gap-2">
            {['all','manual_review','approved','paid','rejected'].map(s => (
              <button key={s} onClick={()=>setFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${filter===s?'text-white':'hover:bg-white/5'}`}
                style={filter===s?{background:'linear-gradient(135deg,#f97316,#ea580c)'}:{color:'var(--text-3)'}}>
                {s.replace('_',' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card-strong rounded-2xl overflow-hidden">
        {shown.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Zap size={36} className="text-gray-600 mb-4" />
            <p className="text-base font-bold" style={{color:'var(--text-2)'}}>No claims yet</p>
            <p className="text-sm mt-1" style={{color:'var(--text-3)'}}>Claims auto-generate when triggers fire in worker zones</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
              {['Trigger','Worker','City','Amount','Fraud Score','Status','Time','Actions'].map(h=>(
                <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{color:'var(--text-3)'}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {shown.map((c,i) => {
                const tm = TRIGGER_META[c.trigger_type] || { icon:Zap, color:'#6b7280', label:'Event' };
                const Icon = tm.icon;
                const sc = STATUS_CFG[c.status] || STATUS_CFG.approved;
                return (
                  <motion.tr key={c.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.04}}
                    className="hover:bg-white/5 transition-colors" style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:`${tm.color}15`}}><Icon size={13} style={{color:tm.color}} /></div>
                        <span className="text-xs font-semibold" style={{color:'var(--text-2)'}}>{tm.label}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-semibold" style={{color:'var(--text-1)'}}>{c.worker_name||'—'}</td>
                    <td className="px-5 py-3.5" style={{color:'var(--text-2)'}}>{c.city||'—'}</td>
                    <td className="px-5 py-3.5 font-black text-green-400">₹{c.amount}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-bold ${c.fraud_score>0.7?'text-red-400':c.fraud_score>0.4?'text-yellow-400':'text-green-400'}`}>{(c.fraud_score*100).toFixed(0)}%</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold capitalize" style={{background:`${sc.color}18`,color:sc.color}}>{sc.label}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs" style={{color:'var(--text-3)'}}>{new Date(c.initiated_at).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1.5">
                        <button onClick={()=>setDetail(c)} className="p-1.5 rounded-lg hover:bg-white/10"><Eye size={13} style={{color:'var(--text-3)'}} /></button>
                        <button className="p-1.5 rounded-lg hover:bg-green-500/10"><ThumbsUp size={13} className="text-green-400" /></button>
                        <button className="p-1.5 rounded-lg hover:bg-red-500/10"><ThumbsDown size={13} className="text-red-400" /></button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:'rgba(0,0,0,0.7)',backdropFilter:'blur(8px)'}} onClick={()=>setDetail(null)}>
          <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} onClick={e=>e.stopPropagation()}
            className="glass-card-strong p-8 rounded-3xl w-full max-w-md">
            <h3 className="text-xl font-black mb-6" style={{color:'var(--text-1)'}}>Claim Detail</h3>
            {[['Trigger',detail.trigger_type?.replace(/_/g,' ')],['Worker',detail.worker_name||'—'],['Amount',`₹${detail.amount}`],['Fraud Score (Isolation Forest)',`${(detail.fraud_score*100).toFixed(0)}%`],['GPS Validation','Passed (mock)'],['Status',detail.status],['Reason',detail.fraud_score>0.7?'High anomaly score — flagged for review':'Parametric trigger confirmed, auto-approved']].map(([k,v])=>(
              <div key={k} className="flex justify-between py-3" style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                <span className="text-sm" style={{color:'var(--text-3)'}}>{k}</span>
                <span className="text-sm font-bold" style={{color:'var(--text-1)'}}>{v}</span>
              </div>
            ))}
            <button onClick={()=>setDetail(null)} className="mt-6 w-full py-3 rounded-xl font-bold text-white" style={{background:'linear-gradient(135deg,#f97316,#ea580c)'}}>Close</button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
