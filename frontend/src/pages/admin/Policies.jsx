import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, XCircle, FileText } from 'lucide-react';
import { adminApi } from '../../api';

const STATUS_COLOR = { active:'#22c55e', expired:'#6b7280', cancelled:'#ef4444' };

export default function Policies() {
  const [policies, setPolicies] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchPolicies = () => {
    setLoading(true);
    adminApi.get('/admin/policies')
      .then(r => setPolicies(r.data))
      .catch(e => console.error('Policies fetch failed:', e))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPolicies(); }, []);

  const shown = filter === 'all' ? policies : policies.filter(p => p.status === filter);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-black" style={{color:'var(--text-1)'}}>Policy Management</h2><p className="text-sm" style={{color:'var(--text-3)'}}>All active, expired, and cancelled policies</p></div>
        <div className="flex items-center gap-3">
          <button onClick={fetchPolicies} className="p-2 rounded-xl hover:bg-white/10 transition-colors"><RefreshCw size={15} style={{color:'var(--text-3)'}} className={loading?'animate-spin':''} /></button>
          <div className="flex gap-2">
            {['all','active','expired','cancelled'].map(s => (
              <button key={s} onClick={()=>setFilter(s)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${filter===s?'text-white':'hover:bg-white/5'}`}
                style={filter===s?{background:'linear-gradient(135deg,#f97316,#ea580c)'}:{color:'var(--text-3)'}}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card-strong rounded-2xl overflow-hidden">
        {shown.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileText size={36} className="text-gray-600 mb-4" />
            <p className="text-base font-bold" style={{color:'var(--text-2)'}}>No policies found</p>
            <p className="text-sm mt-1" style={{color:'var(--text-3)'}}>Policies appear here once workers activate them</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
              {['Worker','City','Premium','Coverage','Risk Score','Period','Status','Actions'].map(h=>(
                <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{color:'var(--text-3)'}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {shown.map((p,i) => (
                <motion.tr key={p.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.04}}
                  className="hover:bg-white/5 transition-colors" style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                  <td className="px-5 py-3.5 font-semibold" style={{color:'var(--text-1)'}}>{p.worker_name||'—'}</td>
                  <td className="px-5 py-3.5" style={{color:'var(--text-2)'}}>{p.city||'—'}</td>
                  <td className="px-5 py-3.5 font-bold text-orange-400">₹{p.premium_paid}</td>
                  <td className="px-5 py-3.5 font-bold text-green-400">₹{p.coverage_amount}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full bg-orange-400" style={{width:`${(p.risk_score||0)*100}%`}} /></div>
                      <span className="text-xs font-bold text-orange-400">{((p.risk_score||0)*100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs" style={{color:'var(--text-3)'}}>
                    {new Date(p.week_start).toLocaleDateString('en-IN',{day:'numeric',month:'short'})} – {new Date(p.week_end).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold capitalize" style={{background:`${STATUS_COLOR[p.status]||'#6b7280'}18`,color:STATUS_COLOR[p.status]||'#6b7280'}}>{p.status}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2">
                      <button className="p-1.5 rounded-lg hover:bg-green-500/10 transition-colors" title="Extend"><RefreshCw size={13} className="text-green-400" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" title="Cancel"><XCircle size={13} className="text-red-400" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
