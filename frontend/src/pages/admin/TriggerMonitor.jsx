import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudRain, Thermometer, Wind, AlertOctagon, AlertTriangle, Zap, CheckCircle, RefreshCw } from 'lucide-react';
import { adminApi as api } from '../../api';

const TRIGGERS = [
  { type:'heavy_rain',          icon:CloudRain,     color:'#3b82f6', label:'Heavy Rain',        unit:'mm/hr', threshold:50  },
  { type:'extreme_heat',        icon:Thermometer,   color:'#ef4444', label:'Extreme Heat',       unit:'°C',    threshold:42  },
  { type:'severe_pollution',    icon:Wind,          color:'#8b5cf6', label:'Severe Pollution',   unit:'AQI',   threshold:300 },
  { type:'curfew_strike',       icon:AlertOctagon,  color:'#f59e0b', label:'Curfew / Strike',    unit:'flag',  threshold:1   },
  { type:'road_accident_surge', icon:AlertTriangle, color:'#4A4A4A', label:'Accident Surge',     unit:'/hr',   threshold:5   },
];

const CITIES = ['Gurgaon','Delhi','Mumbai','Chennai','Kolkata','Bangalore'];

export default function TriggerMonitor() {
  const [city, setCity]       = useState('Gurgaon');
  const [cond, setCond]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [firing, setFiring]   = useState(null);
  const [log, setLog]         = useState([]);
  const [pinCode, setPinCode] = useState('122004');
  const [manualVal, setManualVal] = useState(65);
  const [selType, setSelType] = useState(TRIGGERS[0]);

  const fetchCond = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/triggers/conditions/${city.toLowerCase()}`);
      setCond(data);
    } catch { setCond(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCond(); }, [city]);

  const fireTrigger = async () => {
    setFiring(selType.type);
    try {
      const { data } = await api.post('/triggers/mock', { type: selType.type, pin_code: pinCode, actual_value: parseFloat(manualVal) });
      setLog(p => [{ type: selType.type, pin_code: pinCode, value: manualVal, ts: new Date().toLocaleTimeString(), id: data.trigger?.id }, ...p.slice(0,9)]);
    } catch {}
    finally { setFiring(null); }
  };

  const conditions = cond?.conditions || {};
  const active = cond?.active_triggers || [];

  const currentValues = {
    heavy_rain: conditions.rain_mm_hr,
    extreme_heat: conditions.temperature_c,
    severe_pollution: conditions.aqi,
    curfew_strike: conditions.curfew_active ? 1 : 0,
    road_accident_surge: conditions.accident_rate,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-black" style={{color:'var(--text-1)'}}>Trigger Monitor</h2><p className="text-sm" style={{color:'var(--text-3)'}}>Live API integrations — real-time vs thresholds</p></div>
        <div className="flex items-center gap-3">
          <select value={city} onChange={e=>setCity(e.target.value)} className="input-premium py-2 text-sm">
            {CITIES.map(c=><option key={c}>{c}</option>)}
          </select>
          <button onClick={fetchCond} className="p-2 rounded-xl hover:bg-white/10 transition-colors"><RefreshCw size={16} style={{color:'var(--text-3)'}} className={loading?'animate-spin':''} /></button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {TRIGGERS.map(t => {
          const Icon = t.icon;
          const val = currentValues[t.type];
          const isActive = active.some(a => a.type === t.type);
          const pct = val != null ? Math.min((val / (t.threshold * 1.5)) * 100, 100) : 0;
          return (
            <motion.div key={t.type} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}
              className={`p-5 rounded-2xl border transition-all ${isActive ? 'ring-2' : ''}`}
              style={{background:`${t.color}08`, border:`1px solid ${t.color}${isActive?'50':'20'}`, ringColor: t.color}}>
              <div className="flex items-center justify-between mb-3">
                <Icon size={18} style={{color:t.color}} strokeWidth={2.5} />
                {isActive
                  ? <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{background:`${t.color}20`,color:t.color}}>ACTIVE</span>
                  : <CheckCircle size={14} className="text-green-400" />}
              </div>
              <p className="text-xs font-bold mb-2" style={{color:'var(--text-2)'}}>{t.label}</p>
              <p className="text-2xl font-black mb-1" style={{color:isActive?t.color:'var(--text-1)'}}>
                {val != null ? val : '--'}<span className="text-xs font-normal ml-1" style={{color:'var(--text-3)'}}>{t.unit}</span>
              </p>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-1">
                <div className="h-full rounded-full transition-all" style={{width:`${pct}%`,background:isActive?t.color:`${t.color}60`}} />
              </div>
              <p className="text-xs" style={{color:'var(--text-3)'}}>Threshold: {t.threshold} {t.unit}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="glass-card-strong p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-5"><Zap size={16} style={{color:'#4A4A4A'}} /><h3 className="font-bold" style={{color:'var(--text-1)'}}>Manual Fire Trigger</h3></div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {TRIGGERS.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.type} onClick={()=>{setSelType(t);setManualVal(t.threshold+5);}}
                  className={`flex items-center gap-2 p-3 rounded-xl text-xs font-semibold transition-all text-left ${selType.type===t.type?'ring-1':''}`}
                  style={{background:selType.type===t.type?`${t.color}14`:'rgba(203,203,203,0.3)',border:`1px solid ${selType.type===t.type?t.color+'40':'rgba(203,203,203,0.4)'}`,color:selType.type===t.type?t.color:'rgba(74,74,74,0.55)'}}>
                  <Icon size={13} />{t.label}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div><label className="text-xs font-bold uppercase mb-1.5 block" style={{color:'var(--text-3)'}}>PIN Code</label><input value={pinCode} onChange={e=>setPinCode(e.target.value)} className="input-premium py-2.5 text-sm w-full" /></div>
            <div><label className="text-xs font-bold uppercase mb-1.5 block" style={{color:'var(--text-3)'}}>Value ({selType.unit})</label><input type="number" value={manualVal} onChange={e=>setManualVal(e.target.value)} className="input-premium py-2.5 text-sm w-full" /></div>
          </div>
          <button onClick={fireTrigger} disabled={!!firing}
            className="w-full py-3 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all hover:scale-105 disabled:opacity-60"
            style={{background:`linear-gradient(135deg,${selType.color},${selType.color}bb)`}}>
            {firing ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Firing...</> : <><Zap size={14} />Fire {selType.label}</>}
          </button>
        </div>

        <div className="glass-card-strong p-6 rounded-2xl">
          <h3 className="font-bold mb-4" style={{color:'var(--text-1)'}}>Trigger Activity Log</h3>
          {log.length === 0
            ? <div className="flex flex-col items-center justify-center h-40 text-center"><Zap size={28} className="text-gray-600 mb-3" /><p className="text-sm" style={{color:'var(--text-3)'}}>No triggers fired yet</p></div>
            : <div className="space-y-2 max-h-52 overflow-auto">
                <AnimatePresence>{log.map((e,i)=>(
                  <motion.div key={i} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}}
                    className="flex items-center justify-between p-3 rounded-xl text-xs"
                    style={{background:'rgba(203,203,203,0.3)',border:'1px solid rgba(203,203,203,0.4)'}}>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-400" />
                      <span className="font-semibold" style={{color:'var(--text-1)'}}>{e.type?.replace(/_/g,' ')}</span>
                      <span style={{color:'var(--text-3)'}}>PIN {e.pin_code} · {e.value}</span>
                    </div>
                    <span style={{color:'var(--text-3)'}}>{e.ts}</span>
                  </motion.div>
                ))}</AnimatePresence>
              </div>
          }
        </div>
      </div>
    </div>
  );
}
