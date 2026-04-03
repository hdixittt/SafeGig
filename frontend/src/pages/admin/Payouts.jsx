import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { adminApi as api } from '../../api';

const STATUS_CFG = {
  completed: { color:'#22c55e', icon:CheckCircle, label:'Completed' },
  failed:    { color:'#ef4444', icon:XCircle,     label:'Failed'    },
  pending:   { color:'#f59e0b', icon:Clock,       label:'Pending'   },
};

export default function Payouts() {
  const [payouts, setPayouts] = useState([]);

  useEffect(() => {
    api.get('/admin/payouts').then(r => setPayouts(r.data)).catch(() => {
      setPayouts([
        { id:'py1', worker_name:'Mayank Sharma', amount:1200, channel:'UPI (Mock)', status:'completed', transaction_id:'TXN17430001ABC', trigger_type:'heavy_rain',       initiated_at:'2026-04-03T10:05:00Z' },
        { id:'py2', worker_name:'Vartika Singh',  amount:1000, channel:'UPI (Mock)', status:'completed', transaction_id:'TXN17430002DEF', trigger_type:'severe_pollution', initiated_at:'2026-04-03T11:35:00Z' },
        { id:'py3', worker_name:'Rahul Verma',    amount:375,  channel:'UPI (Mock)', status:'pending',   transaction_id:'TXN17430003GHI', trigger_type:'extreme_heat',     initiated_at:'2026-04-02T14:05:00Z' },
      ]);
    });
  }, []);

  const totalToday = payouts.filter(p=>p.status==='completed').reduce((s,p)=>s+p.amount,0);

  return (
    <div className="space-y-5">
      <div><h2 className="text-2xl font-black" style={{color:'var(--text-1)'}}>Payout Tracker</h2><p className="text-sm" style={{color:'var(--text-3)'}}>Every UPI transaction — real-time status</p></div>

      <div className="grid grid-cols-3 gap-4">
        {[['Total Paid Today',`₹${totalToday.toLocaleString()}`,'#22c55e'],['Pending Payouts',payouts.filter(p=>p.status==='pending').length,'#f59e0b'],['Failed Payouts',payouts.filter(p=>p.status==='failed').length,'#ef4444']].map(([l,v,c])=>(
          <div key={l} className="glass-card-strong p-5 rounded-2xl">
            <p className="text-xs font-bold uppercase mb-2" style={{color:'var(--text-3)'}}>{l}</p>
            <p className="text-3xl font-black" style={{color:c}}>{v}</p>
          </div>
        ))}
      </div>

      <div className="glass-card-strong rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
            {['Worker','Amount','Channel','Trigger','Transaction ID','Status','Time','Action'].map(h=>(
              <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{color:'var(--text-3)'}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {payouts.map((p,i) => {
              const sc = STATUS_CFG[p.status] || STATUS_CFG.pending;
              const Icon = sc.icon;
              return (
                <motion.tr key={p.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.04}}
                  className="hover:bg-white/5 transition-colors" style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                  <td className="px-5 py-3.5 font-semibold" style={{color:'var(--text-1)'}}>{p.worker_name||'—'}</td>
                  <td className="px-5 py-3.5 font-black text-green-400">₹{p.amount}</td>
                  <td className="px-5 py-3.5 text-xs" style={{color:'var(--text-2)'}}>{p.channel}</td>
                  <td className="px-5 py-3.5 text-xs capitalize" style={{color:'var(--text-2)'}}>{p.trigger_type?.replace(/_/g,' ')}</td>
                  <td className="px-5 py-3.5 text-xs font-mono" style={{color:'var(--text-3)'}}>{p.transaction_id?.slice(0,16)}...</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <Icon size={13} style={{color:sc.color}} />
                      <span className="text-xs font-bold" style={{color:sc.color}}>{sc.label}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs" style={{color:'var(--text-3)'}}>{new Date(p.initiated_at).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</td>
                  <td className="px-5 py-3.5">
                    {p.status==='failed' && <button className="flex items-center gap-1 text-xs font-bold text-orange-400 hover:text-orange-300"><RefreshCw size={12} />Retry</button>}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
