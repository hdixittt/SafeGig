import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudRain, Thermometer, Wind, AlertOctagon, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import api from '../api';

const TRIGGER_CONFIG = {
  heavy_rain:          { icon: CloudRain,      color: '#3b82f6', label: 'Heavy Rain',         unit: 'mm/hr',  threshold: 50  },
  extreme_heat:        { icon: Thermometer,    color: '#f97316', label: 'Extreme Heat',        unit: '°C',     threshold: 42  },
  severe_pollution:    { icon: Wind,           color: '#8b5cf6', label: 'Severe Pollution',    unit: 'AQI',    threshold: 300 },
  curfew_strike:       { icon: AlertOctagon,   color: '#ef4444', label: 'Curfew / Strike',     unit: 'active', threshold: 1   },
  road_accident_surge: { icon: AlertTriangle,  color: '#f59e0b', label: 'Accident Surge',      unit: '/hr',    threshold: 5   },
};

function TriggerBadge({ type, actual_value }) {
  const cfg = TRIGGER_CONFIG[type];
  if (!cfg) return null;
  const Icon = cfg.icon;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
      style={{ background: `${cfg.color}20`, color: cfg.color, border: `1px solid ${cfg.color}40` }}
    >
      <Icon size={12} strokeWidth={2.5} />
      {cfg.label}: {actual_value}{cfg.unit !== 'active' ? ` ${cfg.unit}` : ''}
    </motion.div>
  );
}

export default function LiveConditions({ city }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchConditions = async () => {
    if (!city) return;
    setLoading(true);
    try {
      const res = await api.get(`/triggers/conditions/${city.toLowerCase()}`);
      setData(res.data);
      setLastRefresh(new Date());
    } catch (e) {
      console.error('LiveConditions fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConditions();
    const interval = setInterval(fetchConditions, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, [city]);

  if (loading && !data) return (
    <div className="glass-card-strong p-6 animate-pulse">
      <div className="h-4 bg-white/10 rounded w-48 mb-4" />
      <div className="flex gap-3">
        {[1,2,3,4,5].map(i => <div key={i} className="h-8 bg-white/10 rounded-full w-28" />)}
      </div>
    </div>
  );

  const activeTriggers = data?.active_triggers || [];
  const cond = data?.conditions || {};
  const allClear = activeTriggers.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card-strong p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${allClear ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
          <h3 className="text-base font-black" style={{ color: 'var(--text-1)' }}>
            Live Conditions — {city}
          </h3>
          {!allClear && (
            <span className="px-2 py-0.5 rounded-full text-xs font-black bg-red-500/15 text-red-400">
              {activeTriggers.length} ALERT{activeTriggers.length > 1 ? 'S' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-xs font-medium" style={{ color: 'var(--text-3)' }}>
              Updated {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button onClick={fetchConditions} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <RefreshCw size={14} style={{ color: 'var(--text-3)' }} />
          </button>
        </div>
      </div>

      {/* Condition metrics row */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: 'var(--bg-2)', color: 'var(--text-2)' }}>
          <CloudRain size={13} className="text-blue-400" />
          Rain: {cond.rain_mm_hr ?? '--'} mm/hr
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: 'var(--bg-2)', color: 'var(--text-2)' }}>
          <Thermometer size={13} className="text-orange-400" />
          Temp: {cond.temperature_c ?? '--'}°C
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: 'var(--bg-2)', color: 'var(--text-2)' }}>
          <Wind size={13} className="text-purple-400" />
          AQI: {cond.aqi ?? '--'}
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: 'var(--bg-2)', color: 'var(--text-2)' }}>
          <AlertTriangle size={13} className="text-yellow-400" />
          Accidents: {cond.accident_rate ?? '--'}/hr
        </div>
        {cond.curfew_active && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-500/15 text-red-400">
            <AlertOctagon size={13} />
            Curfew Active
          </div>
        )}
      </div>

      {/* Active trigger badges */}
      <AnimatePresence>
        {allClear ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-sm font-semibold text-green-400"
          >
            <CheckCircle size={16} strokeWidth={2.5} />
            All clear — no active disruptions in your zone
          </motion.div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {activeTriggers.map((t, i) => (
              <TriggerBadge key={i} type={t.type} actual_value={t.actual_value} />
            ))}
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
