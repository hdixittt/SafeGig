const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { supabaseAdmin: supabase } = require('../supabase');

const TRIGGER_THRESHOLDS = {
  heavy_rain:       { value: 50,  unit: 'mm/hr' },
  extreme_heat:     { value: 42,  unit: '°C' },
  severe_pollution: { value: 300, unit: 'AQI' },
  curfew_strike:    { value: 1,   unit: 'flag' },
};

// Mock weather/AQI conditions keyed by city (simulates live API response).
// Swap this object out for real API calls when Weather/AQI keys are available.
const MOCK_CONDITIONS = {
  mumbai:    { rain: 65, temp: 32, aqi: 180 },
  delhi:     { rain: 10, temp: 44, aqi: 340 },
  bangalore: { rain: 20, temp: 30, aqi: 90  },
  chennai:   { rain: 55, temp: 38, aqi: 210 },
  kolkata:   { rain: 70, temp: 35, aqi: 260 },
  hyderabad: { rain: 15, temp: 43, aqi: 150 },
  default:   { rain: 60, temp: 43, aqi: 310 },
};

function evaluateTriggers(city) {
  const cond = MOCK_CONDITIONS[city?.toLowerCase()] || MOCK_CONDITIONS.default;
  const fired = [];

  if (cond.rain  > TRIGGER_THRESHOLDS.heavy_rain.value)
    fired.push({ type: 'heavy_rain',       actual_value: cond.rain,  threshold_value: TRIGGER_THRESHOLDS.heavy_rain.value,       source: 'mock' });
  if (cond.temp  > TRIGGER_THRESHOLDS.extreme_heat.value)
    fired.push({ type: 'extreme_heat',     actual_value: cond.temp,  threshold_value: TRIGGER_THRESHOLDS.extreme_heat.value,     source: 'mock' });
  if (cond.aqi   > TRIGGER_THRESHOLDS.severe_pollution.value)
    fired.push({ type: 'severe_pollution', actual_value: cond.aqi,   threshold_value: TRIGGER_THRESHOLDS.severe_pollution.value, source: 'mock' });

  return fired;
}

// POST /api/triggers/check — evaluate mock conditions for a city/pin
router.post('/check', authMiddleware, async (req, res) => {
  const { pin_code, city } = req.body;
  const triggers = evaluateTriggers(city);

  if (triggers.length > 0) {
    await supabase.from('triggers').insert(
      triggers.map(t => ({ ...t, pin_code, fired_at: new Date().toISOString() }))
    );
  }

  res.json({ pin_code, city, triggers_fired: triggers.length > 0, triggers });
});

// POST /api/triggers/mock — admin: manually fire any trigger type for demo
router.post('/mock', async (req, res) => {
  const { type, pin_code, actual_value } = req.body;

  if (!TRIGGER_THRESHOLDS[type]) {
    return res.status(400).json({ error: `Unknown trigger type: ${type}` });
  }

  const threshold_value = TRIGGER_THRESHOLDS[type].value;

  const { data, error } = await supabase
    .from('triggers')
    .insert([{ type, pin_code, threshold_value, actual_value, fired_at: new Date().toISOString() }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Trigger fired successfully', trigger: data });
});

module.exports = router;
