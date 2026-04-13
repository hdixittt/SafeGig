import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Calendar, Mail } from 'lucide-react';

const REPORTS = [
  { id:'r1', name:'Claims Summary',        desc:'All claims with trigger type, amount, fraud score, and status',  icon:'📋' },
  { id:'r2', name:'Payout Ledger',         desc:'Every UPI transaction with worker ID, amount, and timestamp',    icon:'💸' },
  { id:'r3', name:'Zone-wise Risk Report', desc:'Risk levels, AQI, rainfall, and worker exposure per zone',       icon:'🗺️' },
  { id:'r4', name:'Premium Revenue Report',desc:'Weekly premium collected per tier, city, and platform',          icon:'📈' },
  { id:'r5', name:'Fraud Analysis Report', desc:'Flagged claims, fraud scores, and watchlist accounts',           icon:'🔍' },
  { id:'r6', name:'ML Model Performance',  desc:'Accuracy, AUC-ROC, drift metrics, and retrain history',          icon:'🤖' },
];

export default function Reports() {
  const [from, setFrom] = useState('2026-04-01');
  const [to, setTo]     = useState('2026-04-07');
  const [format, setFormat] = useState('csv');
  const [downloading, setDownloading] = useState(null);

  const download = (id) => {
    setDownloading(id);
    setTimeout(() => setDownloading(null), 1500);
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-black" style={{color:'var(--text-1)'}}>Reports & Exports</h2><p className="text-sm" style={{color:'var(--text-3)'}}>Downloadable reports with date range filters</p></div>

      <div className="glass-card-strong p-5 rounded-2xl flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar size={14} style={{color:'var(--text-3)'}} />
          <span className="text-sm font-semibold" style={{color:'var(--text-2)'}}>From</span>
          <input type="date" value={from} onChange={e=>setFrom(e.target.value)} className="input-premium py-2 text-sm" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{color:'var(--text-2)'}}>To</span>
          <input type="date" value={to} onChange={e=>setTo(e.target.value)} className="input-premium py-2 text-sm" />
        </div>
        <div className="flex gap-2 ml-auto">
          {['csv','pdf'].map(f => (
            <button key={f} onClick={()=>setFormat(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${format===f?'text-white':'hover:bg-white/5'}`}
              style={format===f?{background:'linear-gradient(135deg,#FFCE32,#1D63FF)'}:{color:'var(--text-3)'}}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {REPORTS.map((r,i) => (
          <motion.div key={r.id} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
            className="glass-card-strong p-5 rounded-2xl flex items-center justify-between hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{background:'rgba(255,206,50,0.1)'}}>{r.icon}</div>
              <div>
                <p className="font-bold text-sm" style={{color:'var(--text-1)'}}>{r.name}</p>
                <p className="text-xs mt-0.5" style={{color:'var(--text-3)'}}>{r.desc}</p>
              </div>
            </div>
            <button onClick={()=>download(r.id)} disabled={downloading===r.id}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 disabled:opacity-60 flex-shrink-0"
              style={{background:'linear-gradient(135deg,#FFCE32,#1D63FF)'}}>
              {downloading===r.id ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download size={12} />}
              {format.toUpperCase()}
            </button>
          </motion.div>
        ))}
      </div>

      <div className="glass-card-strong p-6 rounded-2xl">
        <div className="flex items-center gap-2 mb-4"><Mail size={15} style={{color:'#3b82f6'}} /><h3 className="font-bold" style={{color:'var(--text-1)'}}>Scheduled Report Delivery</h3></div>
        <div className="grid grid-cols-3 gap-4">
          {[['Weekly Claims Summary','Every Monday 8AM','ops@safegig.demo'],['Monthly Revenue Report','1st of month','finance@safegig.demo'],['Fraud Analysis','Every Friday 6PM','fraud@safegig.demo']].map(([name,schedule,email])=>(
            <div key={name} className="p-4 rounded-xl" style={{background:'var(--bg-2)'}}>
              <p className="text-sm font-bold mb-1" style={{color:'var(--text-1)'}}>{name}</p>
              <p className="text-xs mb-1" style={{color:'var(--text-3)'}}>{schedule}</p>
              <p className="text-xs font-mono" style={{color:'#3b82f6'}}>{email}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
