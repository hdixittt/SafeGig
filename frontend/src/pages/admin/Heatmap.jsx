import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Map, Users, CloudRain, Wind, Thermometer } from 'lucide-react';

const ZONES = [
  { name:'Mumbai South',  lat:18.93, lon:72.83, workers:12, rain:65, aqi:185, temp:32, risk:'high'     },
  { name:'Delhi NCR',     lat:28.61, lon:77.21, workers:18, rain:8,  aqi:345, temp:46, risk:'critical' },
  { name:'Bangalore CBD', lat:12.97, lon:77.59, workers:8,  rain:20, aqi:88,  temp:30, risk:'low'      },
  { name:'Chennai Coast', lat:13.08, lon:80.27, workers:10, rain:55, aqi:215, temp:38, risk:'high'     },
  { name:'Kolkata East',  lat:22.57, lon:88.36, workers:14, rain:72, aqi:262, temp:35, risk:'critical' },
  { name:'Gurgaon Sec22', lat:28.46, lon:77.03, workers:6,  rain:6,  aqi:178, temp:31, risk:'standard' },
  { name:'Pune Kothrud',  lat:18.52, lon:73.86, workers:5,  rain:30, aqi:95,  temp:33, risk:'low'      },
  { name:'Hyderabad HiTec',lat:17.39,lon:78.49, workers:9,  rain:14, aqi:148, temp:44, risk:'high'     },
];

const RISK_COLOR = { low:'#22c55e', standard:'#3b82f6', high:'#f59e0b', critical:'#ef4444' };
const RISK_BG    = { low:'rgba(34,197,94,0.1)', standard:'rgba(59,130,246,0.1)', high:'rgba(245,158,11,0.1)', critical:'rgba(239,68,68,0.1)' };

export default function Heatmap() {
  const [metric, setMetric] = useState('risk');
  const [selected, setSelected] = useState(null);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-black" style={{color:'var(--text-1)'}}>Zone & Risk Heatmap</h2><p className="text-sm" style={{color:'var(--text-3)'}}>Active workers overlaid with current risk levels</p></div>
        <div className="flex gap-2">
          {[['risk','Risk Level'],['rain','Rainfall'],['aqi','AQI'],['temp','Temperature']].map(([k,l])=>(
            <button key={k} onClick={()=>setMetric(k)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${metric===k?'text-white':'hover:bg-white/5'}`}
              style={metric===k?{background:'linear-gradient(135deg,#FFCE32,#1D63FF)'}:{color:'var(--text-3)'}}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Visual grid heatmap */}
      <div className="glass-card-strong p-6 rounded-2xl">
        <div className="flex items-center gap-2 mb-5"><Map size={16} style={{color:'#FFCE32'}} /><h3 className="font-bold" style={{color:'var(--text-1)'}}>India Zone Overview</h3><span className="text-xs ml-auto" style={{color:'var(--text-3)'}}>Click a zone for details</span></div>
        <div className="grid grid-cols-4 gap-3">
          {ZONES.map((z,i) => {
            const color = RISK_COLOR[z.risk];
            const bg    = RISK_BG[z.risk];
            const metricVal = metric==='risk' ? z.risk.toUpperCase() : metric==='rain' ? `${z.rain}mm` : metric==='aqi' ? z.aqi : `${z.temp}°C`;
            const metricColor = metric==='rain' ? (z.rain>50?'#ef4444':'#22c55e') : metric==='aqi' ? (z.aqi>300?'#ef4444':z.aqi>200?'#f59e0b':'#22c55e') : metric==='temp' ? (z.temp>42?'#ef4444':'#22c55e') : color;
            return (
              <motion.div key={z.name} initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} transition={{delay:i*0.05}}
                onClick={()=>setSelected(selected?.name===z.name?null:z)}
                className={`p-4 rounded-2xl cursor-pointer transition-all hover:scale-105 ${selected?.name===z.name?'ring-2':'border'}`}
                style={{background:bg, border:`1px solid ${color}30`, ringColor:color}}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold" style={{color:'var(--text-3)'}}>{z.name}</span>
                  <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{background:color}} />
                </div>
                <p className="text-2xl font-black mb-1" style={{color:metricColor}}>{metricVal}</p>
                <div className="flex items-center gap-1.5">
                  <Users size={11} style={{color:'var(--text-3)'}} />
                  <span className="text-xs" style={{color:'var(--text-3)'}}>{z.workers} workers exposed</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {selected && (
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="glass-card-strong p-6 rounded-2xl">
          <h3 className="font-black text-lg mb-4" style={{color:'var(--text-1)'}}>{selected.name} — Full Conditions</h3>
          <div className="grid grid-cols-4 gap-4">
            {[['Workers Exposed',selected.workers,Users,'#3b82f6'],['Rainfall',`${selected.rain}mm/hr`,CloudRain,'#3b82f6'],['AQI',selected.aqi,Wind,'#8b5cf6'],['Temperature',`${selected.temp}°C`,Thermometer,'#FFCE32']].map(([l,v,Icon,c])=>(
              <div key={l} className="p-4 rounded-xl" style={{background:'var(--bg-2)'}}>
                <div className="flex items-center gap-2 mb-2"><Icon size={13} style={{color:c}} /><span className="text-xs" style={{color:'var(--text-3)'}}>{l}</span></div>
                <p className="text-xl font-black" style={{color:c}}>{v}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
