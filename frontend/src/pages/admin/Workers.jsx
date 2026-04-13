import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Flag, Ban, Eye, ChevronDown, RefreshCw } from 'lucide-react';
import { adminApi } from '../../api';

const RISK_COLOR = { Low:'#22c55e', Standard:'#3b82f6', High:'#f59e0b', Critical:'#ef4444' };

// Compute risk tier from worker data (mirrors riskEngine logic)
function getRiskTier(worker) {
  const cityRisk = { mumbai:0.72, delhi:0.68, bangalore:0.42, bengaluru:0.42, chennai:0.58, kolkata:0.63, hyderabad:0.48, pune:0.38, ahmedabad:0.52, gurgaon:0.55, gurugram:0.55, noida:0.58 };
  const city = worker.city?.toLowerCase().trim() || '';
  const base = cityRisk[city] ?? 0.50;
  const hours = Math.min((worker.weekly_hours || 40) / 80, 1) * 0.18;
  const score = Math.min(base + hours + 0.05, 1.0);
  if (score <= 0.25) return 'Low';
  if (score <= 0.50) return 'Standard';
  if (score <= 0.75) return 'High';
  return 'Critical';
}

export default function Workers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState({ city:'', platform:'', tier:'' });
  const [selected, setSelected] = useState(null);

  const fetchWorkers = () => {
    setLoading(true);
    adminApi.get('/admin/workers')
      .then(r => setWorkers(r.data.map(w => ({ ...w, risk_tier: getRiskTier(w) }))))
      .catch(e => console.error('Failed to fetch workers:', e))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchWorkers(); }, []);

  const filtered = workers.filter(w =>
    (!search || w.name.toLowerCase().includes(search.toLowerCase()) || w.phone.includes(search)) &&
    (!filter.city || w.city.toLowerCase() === filter.city.toLowerCase()) &&
    (!filter.platform || w.platform.toLowerCase() === filter.platform.toLowerCase()) &&
    (!filter.tier || w.risk_tier === filter.tier)
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-black" style={{color:'var(--text-1)'}}>Worker Management</h2><p className="text-sm" style={{color:'var(--text-3)'}}>Full registry of all delivery partners</p></div>
        <div className="flex items-center gap-3">
          <button onClick={fetchWorkers} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <RefreshCw size={15} style={{color:'var(--text-3)'}} className={loading?'animate-spin':''} />
          </button>
          <div className="px-4 py-2 rounded-full text-sm font-bold" style={{background:'rgba(59,130,246,0.1)',color:'#3b82f6'}}>{workers.length} workers</div>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or phone..." className="input-premium pl-9 py-2.5 text-sm w-full" />
        </div>
        {['city','platform','tier'].map(f => (
          <div key={f} className="relative">
            <select value={filter[f]} onChange={e=>setFilter(p=>({...p,[f]:e.target.value}))}
              className="input-premium py-2.5 pr-8 text-sm appearance-none cursor-pointer capitalize">
              <option value="">All {f}s</option>
              {f==='city' && ['Gurgaon','Delhi','Mumbai','Chennai','Bangalore','Kolkata'].map(c=><option key={c}>{c}</option>)}
              {f==='platform' && ['Zepto','Blinkit','Instamart','Swiggy','Zomato'].map(p=><option key={p}>{p}</option>)}
              {f==='tier' && ['Low','Standard','High','Critical'].map(t=><option key={t}>{t}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        ))}
      </div>

      <div className="glass-card-strong rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
            {['Name','City','Platform','Hours/wk','Risk Tier','Status','Actions'].map(h=>(
              <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{color:'var(--text-3)'}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map((w,i) => (
              <motion.tr key={w.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.04}}
                className="hover:bg-white/5 transition-colors" style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white" style={{background:'linear-gradient(135deg,#FFCE32,#1D63FF)'}}>{w.name[0]}</div>
                    <div><p className="font-semibold" style={{color:'var(--text-1)'}}>{w.name}</p><p className="text-xs" style={{color:'var(--text-3)'}}>{w.phone}</p></div>
                  </div>
                </td>
                <td className="px-5 py-3.5" style={{color:'var(--text-2)'}}>{w.city}</td>
                <td className="px-5 py-3.5" style={{color:'var(--text-2)'}}>{w.platform}</td>
                <td className="px-5 py-3.5" style={{color:'var(--text-2)'}}>{w.weekly_hours}h</td>
                <td className="px-5 py-3.5">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{background:`${RISK_COLOR[w.risk_tier]||'#6b7280'}18`,color:RISK_COLOR[w.risk_tier]||'#6b7280'}}>{w.risk_tier||'Standard'}</span>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${w.status==='flagged'?'bg-red-500/15 text-red-400':'bg-green-500/15 text-green-400'}`}>{w.status||'active'}</span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <button onClick={()=>setSelected(w)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"><Eye size={14} style={{color:'var(--text-3)'}} /></button>
                    <button className="p-1.5 rounded-lg hover:bg-yellow-500/10 transition-colors"><Flag size={14} className="text-yellow-500" /></button>
                    <button className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"><Ban size={14} className="text-red-500" /></button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:'rgba(0,0,0,0.7)',backdropFilter:'blur(8px)'}} onClick={()=>setSelected(null)}>
          <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} onClick={e=>e.stopPropagation()}
            className="glass-card-strong p-8 rounded-3xl w-full max-w-md">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white" style={{background:'linear-gradient(135deg,#FFCE32,#1D63FF)'}}>{selected.name[0]}</div>
              <div><h3 className="text-xl font-black" style={{color:'var(--text-1)'}}>{selected.name}</h3><p style={{color:'var(--text-3)'}}>{selected.phone}</p></div>
            </div>
            {[['City',selected.city],['Platform',selected.platform],['PIN Code',selected.pin_code],['Weekly Hours',`${selected.weekly_hours}h`],['Risk Tier',selected.risk_tier||'Standard'],['Member Since',new Date(selected.created_at).toLocaleDateString('en-IN')]].map(([k,v])=>(
              <div key={k} className="flex justify-between py-3" style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                <span className="text-sm" style={{color:'var(--text-3)'}}>{k}</span>
                <span className="text-sm font-bold" style={{color:'var(--text-1)'}}>{v}</span>
              </div>
            ))}
            <button onClick={()=>setSelected(null)} className="mt-6 w-full py-3 rounded-xl font-bold text-white" style={{background:'linear-gradient(135deg,#FFCE32,#1D63FF)'}}>Close</button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
