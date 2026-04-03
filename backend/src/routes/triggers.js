const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { supabaseAdmin: supabase } = require('../supabase');

/**
 * 5 Automated Triggers
 * Real data sources:
 *   - Weather (rain, temp): Open-Meteo API — free, no key
 *   - AQI: OpenAQ API — free, no key
 *   - Curfew/Strike, Accident Surge: mock (no free real-time API exists)
 */

const TRIGGER_THRESHOLDS = {
  heavy_rain:          { value: 50,  unit: 'mm/hr',        label: 'Heavy Rain',         icon: 'cloud-rain'     },
  extreme_heat:        { value: 42,  unit: 'celsius',      label: 'Extreme Heat',        icon: 'thermometer'    },
  severe_pollution:    { value: 300, unit: 'AQI',          label: 'Severe Pollution',    icon: 'wind'           },
  curfew_strike:       { value: 1,   unit: 'flag',         label: 'Curfew / Strike',     icon: 'alert-octagon'  },
  road_accident_surge: { value: 5,   unit: 'incidents/hr', label: 'Road Accident Surge', icon: 'alert-triangle' },
};

// City coordinates for Open-Meteo + OpenAQ lookups
const CITY_COORDS = {
  mumbai:    { lat: 19.0760, lon: 72.8777, aq_city: 'mumbai'     },
  delhi:     { lat: 28.6139, lon: 77.2090, aq_city: 'delhi'      },
  bangalore: { lat: 12.9716, lon: 77.5946, aq_city: 'bangalore'  },
  bengaluru: { lat: 12.9716, lon: 77.5946, aq_city: 'bangalore'  },
  chennai:   { lat: 13.0827, lon: 80.2707, aq_city: 'chennai'    },
  kolkata:   { lat: 22.5726, lon: 88.3639, aq_city: 'kolkata'    },
  hyderabad: { lat: 17.3850, lon: 78.4867, aq_city: 'hyderabad'  },
  pune:      { lat: 18.5204, lon: 73.8567, aq_city: 'pune'       },
  ahmedabad: { lat: 23.0225, lon: 72.5714, aq_city: 'ahmedabad'  },
  gurgaon:   { lat: 28.4595, lon: 77.0266, aq_city: 'gurgaon'    },
  gurugram:  { lat: 28.4595, lon: 77.0266, aq_city: 'gurgaon'    },
  noida:     { lat: 28.5355, lon: 77.3910, aq_city: 'noida'      },
  jaipur:    { lat: 26.9124, lon: 75.7873, aq_city: 'jaipur'     },
  surat:     { lat: 21.1702, lon: 72.8311, aq_city: 'surat'      },
  lucknow:   { lat: 26.8467, lon: 80.9462, aq_city: 'lucknow'    },
};

// Mock data for cities not in coords list or when APIs fail
const MOCK_FALLBACK = {
  rain: 10, temp: 32, aqi: 120, curfew: 0, accidents: 2,
};

function getCityCoords(city) {
  const key = city?.toLowerCase().trim();
  if (!key) return null;
  if (CITY_COORDS[key]) return CITY_COORDS[key];
  const match = Object.keys(CITY_COORDS).find(k => key.includes(k) || k.includes(key));
  return match ? CITY_COORDS[match] : null;
}

// Fetch real weather from Open-Meteo (free, no API key)
async function fetchWeather(lat, lon) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation&timezone=Asia%2FKolkata&forecast_days=1`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = await res.json();
    return {
      temp: Math.round(data.current.temperature_2m),
      rain: Math.round((data.current.precipitation || 0) * 10) / 10,
    };
  } catch (e) {
    // silent fallback — no console noise
    return { temp: MOCK_FALLBACK.temp, rain: MOCK_FALLBACK.rain };
  }
}

// Fetch real AQI from Open-Meteo Air Quality API (free, no key)
// We use PM2.5 and convert to US AQI using EPA breakpoints — Open-Meteo's us_aqi field is inaccurate
async function fetchAQI(lat, lon) {
  try {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = await res.json();
    const pm25 = data.current?.pm2_5;
    if (pm25 == null || isNaN(pm25)) throw new Error('no pm2_5 value');
    return pm25ToUsAqi(pm25);
  } catch (e) {
    return MOCK_FALLBACK.aqi;
  }
}

// EPA PM2.5 -> US AQI conversion (official breakpoints)
function pm25ToUsAqi(pm) {
  const bp = [
    [0,    12.0,   0,   50 ],
    [12.1, 35.4,   51,  100],
    [35.5, 55.4,   101, 150],
    [55.5, 150.4,  151, 200],
    [150.5,250.4,  201, 300],
    [250.5,350.4,  301, 400],
    [350.5,500.4,  401, 500],
  ];
  const row = bp.find(([lo, hi]) => pm >= lo && pm <= hi) || bp[bp.length - 1];
  const [cLo, cHi, iLo, iHi] = row;
  return Math.round(((iHi - iLo) / (cHi - cLo)) * (pm - cLo) + iLo);
}

// Main: fetch all real conditions for a city
async function fetchLiveConditions(city) {
  const coords = getCityCoords(city);
  if (!coords) {
    console.warn(`[conditions] No coords for city: ${city}, using fallback`);
    return { ...MOCK_FALLBACK, source: 'mock' };
  }

  const [weather, aqi] = await Promise.all([
    fetchWeather(coords.lat, coords.lon),
    fetchAQI(coords.lat, coords.lon),
  ]);

  return {
    rain:      weather.rain,
    temp:      weather.temp,
    aqi,
    curfew:    0,   // no free real-time API — keep mock
    accidents: 2,   // no free real-time API — keep mock
    source:    'live',
  };
}

function evaluateTriggers(cond) {
  const fired = [];
  if (cond.rain > TRIGGER_THRESHOLDS.heavy_rain.value)
    fired.push({ type: 'heavy_rain', actual_value: cond.rain, threshold_value: TRIGGER_THRESHOLDS.heavy_rain.value, source: cond.source });
  if (cond.temp > TRIGGER_THRESHOLDS.extreme_heat.value)
    fired.push({ type: 'extreme_heat', actual_value: cond.temp, threshold_value: TRIGGER_THRESHOLDS.extreme_heat.value, source: cond.source });
  if (cond.aqi > TRIGGER_THRESHOLDS.severe_pollution.value)
    fired.push({ type: 'severe_pollution', actual_value: cond.aqi, threshold_value: TRIGGER_THRESHOLDS.severe_pollution.value, source: cond.source });
  if (cond.curfew >= TRIGGER_THRESHOLDS.curfew_strike.value)
    fired.push({ type: 'curfew_strike', actual_value: cond.curfew, threshold_value: TRIGGER_THRESHOLDS.curfew_strike.value, source: 'mock_ndma' });
  if (cond.accidents > TRIGGER_THRESHOLDS.road_accident_surge.value)
    fired.push({ type: 'road_accident_surge', actual_value: cond.accidents, threshold_value: TRIGGER_THRESHOLDS.road_accident_surge.value, source: 'mock_traffic' });
  return fired;
}

// GET /api/triggers/conditions/:city
router.get('/conditions/:city', authMiddleware, async (req, res) => {
  const city = req.params.city?.toLowerCase().trim();
  const cond = await fetchLiveConditions(city);
  const triggers = evaluateTriggers(cond);

  res.json({
    city,
    conditions: {
      rain_mm_hr:    cond.rain,
      temperature_c: cond.temp,
      aqi:           cond.aqi,
      curfew_active: cond.curfew === 1,
      accident_rate: cond.accidents,
    },
    active_triggers: triggers,
    thresholds:      TRIGGER_THRESHOLDS,
    data_source:     cond.source,
    last_updated:    new Date().toISOString(),
  });
});

// POST /api/triggers/check
router.post('/check', authMiddleware, async (req, res) => {
  const { pin_code, city } = req.body;
  const cond = await fetchLiveConditions(city);
  const triggers = evaluateTriggers(cond);

  if (triggers.length > 0) {
    await supabase.from('triggers').insert(
      triggers.map(t => ({ ...t, pin_code, fired_at: new Date().toISOString() }))
    );
  }

  res.json({ pin_code, city, triggers_fired: triggers.length > 0, triggers });
});

// POST /api/triggers/mock — admin: manually fire any trigger for demo
router.post('/mock', async (req, res) => {
  const { type, pin_code, actual_value } = req.body;
  if (!TRIGGER_THRESHOLDS[type])
    return res.status(400).json({ error: `Unknown trigger. Valid: ${Object.keys(TRIGGER_THRESHOLDS).join(', ')}` });

  const { data, error } = await supabase
    .from('triggers')
    .insert([{ type, pin_code, threshold_value: TRIGGER_THRESHOLDS[type].value, actual_value, fired_at: new Date().toISOString(), source: 'admin_mock' }])
    .select().single();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Trigger fired', trigger: data });
});

module.exports = router;
