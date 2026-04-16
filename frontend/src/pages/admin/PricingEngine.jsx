import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu, RefreshCw, TrendingUp, Droplets, Wind, Sun, Activity } from 'lucide-react';

const ZONES = [
  { zone:'Mumbai South',  aqi:185, flood:0.8, seasonal:0.7, activity:0.9, premium:87, tier:'High'     },
  { zone:'Delhi NCR',     aqi:345, flood:0.3, seasonal:0.6, activity:0.8, premium:99, tier:'Critical'  },
  { zone:'Bangalore CBD', aqi:88,  flood:0.2, seasonal:0.4, activity:0.7, premium:46, tier:'Standard'  },
  { zone:'Chennai Coast', aqi:215, flood:0.7, seasonal:0.8, activity:0.6, premium:79, tier:'High'      },
  { zone:'Kolkata East',  aqi:262, flood:0.9, seasonal:0.7, activity:0.7, premium:92, tier:'Critical'  },
  { zone:'Gurgaon Sec22', aqi:178, flood:0.3, seasonal:0.5, activity:0.8, premium:76, tier:'High'      },
  { zone:'Pune Kothrud',  aqi:95,  flood:0.2, seasonal:0.4, activity:0.6, premium:38, tier:'Low'       },
  { zone:'Hyderabad HiTec',aqi:148,flood:0.3, seasonal:0.5, activity:0.7, premium:54, tier:'Standard'  },
];

const TIER_COLOR = { Low:'#22c55e', Standard:'#3b82f6', High:'#f59e0b', Critical:'#ef4444' };

function Signal({ icon: Icon, label, value, color }) {
  return (
    <div className="p-4 rounded-xl" style={{background:'var(--bg-2)'}}>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} style={{color}} />
        <span className="text-xs font-bold uppercase tracking-wider" style={{color:'var(--text-3)'}}>{label}</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-2">
        <div className="h-full rounded-full transition-all" style={{width:`${value*100}%`,background:color}} />
      </div>
      <span className="text-xs font-bold" style={{color}}>{(value*100).toFixed(0)}% weight</span>
    </div>
  );
}

export default function PricingEngine() {
  const [repricing, setRepricing] = useState(false);
  const [lastReprice, setLastReprice] = useState('Today, 09:00 AM');

  const triggerReprice = () => {
    setRepricing(true);
    setTimeout(() => { setRepricing(false); setLastReprice('Just now'); }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-black" style={{color:'var(--text-1)'}}>Dynamic Premium Engine</h2><p className="text-sm" style={{color:'var(--text-3)'}}>ML model pricing monitor — last re-priced: {lastReprice}</p></div>
        <button onClick={triggerReprice} disabled={repricing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-105 disabled:opacity-60"
          style={{background:'linear-gradient(135deg,#6D8196,#4f6070)'}}>
          <RefreshCw size={14} className={repricing?'animate-spin':''} />
          {repricing ? 'Re-pricing...' : 'Trigger Re-price'}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Signal icon={Droplets} label="Flood History"      value={0.72} color="#3b82f6" />
        <Signal icon={Wind}     label="AQI Signal"         value={0.65} color="#8b5cf6" />
        <Signal icon={Sun}      label="Seasonal Pattern"   value={0.48} color="#f59e0b" />
        <Signal icon={Activity} label="Activity Multiplier" value={0.81} color="#6D8196" />
      </div>

      <div className="glass-card-strong rounded-2xl overflow-hidden">
        <div className="px-5 py-4 flex items-center gap-3" style={{borderBottom:'1px solid rgba(203,203,203,0.4)'}}>
          <Cpu size={16} style={{color:'#4A4A4A'}} />
          <h3 className="font-bold" style={{color:'var(--text-1)'}}>Zone Premium Heatmap</h3>
          <span className="ml-auto text-xs px-3 py-1 rounded-full font-bold" style={{background:'rgba(74,74,74,0.1)',color:'#4A4A4A'}}>Live Pricing</span>
        </div>
        <table className="w-full text-sm">
          <thead><tr style={{borderBottom:'1px solid rgba(203,203,203,0.4)'}}>
            {['Zone','AQI','Flood Risk','Seasonal','Activity','Weekly Premium','Tier'].map(h=>(
              <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{color:'var(--text-3)'}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {ZONES.map((z,i) => (
              <motion.tr key={z.zone} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.04}}
                className="hover:bg-white/10 transition-colors" style={{borderBottom:'1px solid rgba(203,203,203,0.3)'}}>
                <td className="px-5 py-3.5 font-semibold" style={{color:'var(--text-1)'}}>{z.zone}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs font-bold ${z.aqi>300?'text-red-400':z.aqi>200?'text-[#6D8196]':'text-green-400'}`}>{z.aqi}</span>
                </td>
                {['flood','seasonal','activity'].map(k => (
                  <td key={k} className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-12 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full bg-yellow-400" style={{width:`${z[k]*100}%`}} /></div>
                      <span className="text-xs" style={{color:'var(--text-3)'}}>{(z[k]*100).toFixed(0)}%</span>
                    </div>
                  </td>
                ))}
                <td className="px-5 py-3.5 font-black text-[#6D8196]">₹{z.premium}</td>
                <td className="px-5 py-3.5">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{background:`${TIER_COLOR[z.tier]}18`,color:TIER_COLOR[z.tier]}}>{z.tier}</span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
