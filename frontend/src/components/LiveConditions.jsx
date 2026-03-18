import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudRain, Thermometer, Wind, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

// Mock live conditions per city — simulates real Weather/AQI API
const CITY_CONDITIONS = {
  mumbai:    { rain: 65, temp: 32, aqi: 180, humidity: 88 },
  delhi:     { rain: 8,  temp: 44, aqi: 342, humidity: 35 },
  bangalore: { rain: 18, temp: 29, aqi: 88,  humidity: 72 },
  chennai:   { rain: 52, temp: 38, aqi: 215, humidity: 80 },
  kolkata:   { rain: 70, temp: 35, aqi: 265, humidity: 85 },
  hyderabad: { rain: 12, temp: 43, aqi: 148, humidity: 42 },
  gurgaon:   { rain: 5,  temp: 43, aqi: 310, humidity: 38 },
  pune:      { rain: 22, temp: 31, aqi: 95,  humidity: 68 },
};

const THRESHOLDS = { rain: 50, temp: 42, aqi: 300 };

function getAqiLabel(aqi) {
  if (aqi <= 50)  return { label: 'Good',      color: '#22c55e' };
  if (aqi <= 100) return { label: 'Moderate',  color: '#f59e0b' };
  if (aqi <= 200) return { label: 'Unhealthy', color: '#f97316' };
  return                  { label: 'Hazardous', color: '#ef4444' };
}

export default function LiveConditions({ city }) {
  const [data, setData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = () => {
    setRefreshing(true);
    setTimeout(() => {
      const base = CITY_CONDITIONS[city?.toLowerCase()] || CITY_CONDITIONS.mumbai;
      setData({
        rain:     +(base.rain     + (Math.random() * 6 - 3)).toFixed(1),
        temp:     +(base.temp     + (Math.random() * 2 - 1)).toFixed(1),
        aqi:      Math.round(base.aqi + (Math.random() * 20 - 10)),
        humidity: Math.round(base.humidity + (Math.random() * 4 - 2)),
      });
      setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
      setRefreshing(false);
    }, 600);
  };

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, [city]);

  if (!data) return <div className="glass-card-strong p-8 animate-pulse h-64" />;

  const alerts = [];
  if (data.rain > THRESHOLDS.rain) alerts.push({ msg: `Heavy rainfall (${data.rain} mm/hr) — policy may trigger`, color: '#3b82f6' });
  if (data.temp > THRESHOLDS.temp) alerts.push({ msg: `Extreme heat (${data.temp}°C) — policy may trigger`, color: '#ef4444' });
  if (data.aqi  > THRESHOLDS.aqi)  alerts.push({ msg: `Hazardous AQI (${data.aqi}) — policy may trigger`, color: '#8b5cf6' });

  const aqiInfo = getAqiLabel(data.aqi);

  return (
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.35}} className="glass-card-strong p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-black" style={{ color: 'var(--text-1)' }}>Live Conditions</h2>
            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/15 text-green-400 text-xs font-black uppercase">
              <span className="pulse-glow w-2 h-2 rounded-full bg-green-400 inline-block" />
              LIVE
            </span>
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>{city} · Updated {lastUpdated}</p>
        </div>
        <button onClick={load} disabled={refreshing} 
          className="p-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all">
          <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { icon: CloudRain,   label: 'Rainfall',    value: `${data.rain} mm/hr`, alert: data.rain > THRESHOLDS.rain,  color: '#3b82f6' },
          { icon: Thermometer, label: 'Temperature', value: `${data.temp}°C`,     alert: data.temp > THRESHOLDS.temp,  color: '#ef4444' },
          { icon: Wind,        label: 'AQI',         value: data.aqi,             alert: data.aqi  > THRESHOLDS.aqi,   color: aqiInfo.color, sub: aqiInfo.label },
          { icon: Wind,        label: 'Humidity',    value: `${data.humidity}%`,  alert: false,                        color: '#06b6d4' },
        ].map(({ icon: Icon, label, value, alert, color, sub }) => (
          <div key={label} className="rounded-2xl p-5 text-center transition-all hover:scale-105"
            style={{background: alert ? `${color}15` : 'rgba(255,255,255,0.03)', border:`1px solid ${alert ? color+'40' : 'rgba(255,255,255,0.08)'}` }}>
            <Icon size={24} className="mx-auto mb-3" style={{color}} strokeWidth={2.5} />
            <p className="text-2xl font-black mb-1" style={{color: alert ? color : 'var(--text-1)'}}>{value}</p>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-2)' }}>{label}</p>
            {sub && <p className="text-xs font-bold mt-1" style={{color}}>{sub}</p>}
            {alert && <p className="text-xs mt-2 font-black" style={{color}}>⚠ ALERT</p>}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {alerts.length > 0 ? (
          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} className="space-y-3">
            {alerts.map((a, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-4 rounded-xl text-sm font-bold"
                style={{background:`${a.color}15`, border:`1px solid ${a.color}30`, color:a.color}}>
                <AlertTriangle size={18} strokeWidth={2.5} />{a.msg}
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} 
            className="flex items-center gap-3 px-5 py-4 rounded-xl text-sm font-bold bg-green-500/15 border border-green-500/30 text-green-400">
            <CheckCircle size={18} strokeWidth={2.5} />All conditions normal — no triggers active
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
