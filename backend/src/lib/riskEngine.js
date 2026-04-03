/**
 * SafeGig Dynamic Pricing Engine
 * Simulates XGBoost-style ML pricing with hyper-local risk factors.
 * Each factor is independently swappable with real API data.
 */

const CITY_BASE_RISK = {
  mumbai: 0.72, delhi: 0.68, bangalore: 0.42, bengaluru: 0.42,
  chennai: 0.58, kolkata: 0.63, hyderabad: 0.48,
  pune: 0.38, ahmedabad: 0.52, gurgaon: 0.55, gurugram: 0.55,
  noida: 0.58, jaipur: 0.45, surat: 0.42, lucknow: 0.60,
};

// Pin-code waterlogging safety zones (mock GIS data)
// Safe zones get a premium discount of Rs 2-5/week
const WATERLOGGING_SAFE_ZONES = new Set([
  '400001','400002','400050','110001','110003',
  '560001','600001','700001','500001','411001',
]);

// Weekly weather forecast per city (mock - replace with OpenWeatherMap forecast API)
const WEEKLY_WEATHER_FORECAST = {
  mumbai:    { rain_mm: 68, heat_index: 34, aqi: 185 },
  delhi:     { rain_mm: 8,  heat_index: 46, aqi: 345 },
  bangalore: { rain_mm: 22, heat_index: 31, aqi: 88  },
  bengaluru: { rain_mm: 22, heat_index: 31, aqi: 88  },
  chennai:   { rain_mm: 52, heat_index: 39, aqi: 215 },
  kolkata:   { rain_mm: 71, heat_index: 36, aqi: 262 },
  hyderabad: { rain_mm: 14, heat_index: 44, aqi: 148 },
  pune:      { rain_mm: 30, heat_index: 33, aqi: 95  },
  ahmedabad: { rain_mm: 5,  heat_index: 47, aqi: 290 },
  gurgaon:   { rain_mm: 6,  heat_index: 34, aqi: 178 },
  gurugram:  { rain_mm: 6,  heat_index: 34, aqi: 178 },
  noida:     { rain_mm: 5,  heat_index: 35, aqi: 210 },
  jaipur:    { rain_mm: 3,  heat_index: 41, aqi: 160 },
  surat:     { rain_mm: 40, heat_index: 36, aqi: 130 },
  lucknow:   { rain_mm: 12, heat_index: 38, aqi: 240 },
  default:   { rain_mm: 15, heat_index: 36, aqi: 180 },
};

const PLATFORM_RISK = {
  zepto: 0.06, blinkit: 0.05, instamart: 0.04,
  swiggy: 0.05, zomato: 0.05, dunzo: 0.07, default: 0.04,
};

const BASE_TIERS = [
  { maxScore: 0.25, tier: 'Low',      basePremium: 29,  baseCoverage: 800  },
  { maxScore: 0.50, tier: 'Standard', basePremium: 49,  baseCoverage: 1500 },
  { maxScore: 0.75, tier: 'High',     basePremium: 79,  baseCoverage: 2500 },
  { maxScore: 1.00, tier: 'Critical', basePremium: 99,  baseCoverage: 3500 },
];

function computeRiskScore({ city, pin_code, platform, weekly_hours, claim_count = 0 }) {
  const rawKey = city?.toLowerCase().trim() || 'default';
  // partial match support (e.g. "gurgaon" -> "gurgaon", "new delhi" -> "delhi")
  const cityKey = WEEKLY_WEATHER_FORECAST[rawKey]
    ? rawKey
    : (Object.keys(WEEKLY_WEATHER_FORECAST).find(k => k !== 'default' && (rawKey.includes(k) || k.includes(rawKey))) || 'default');
  const baseRisk = CITY_BASE_RISK[cityKey] ?? 0.50;

  const hoursFactor    = Math.min((weekly_hours || 40) / 80, 1) * 0.18;
  const platformFactor = PLATFORM_RISK[platform?.toLowerCase()] ?? PLATFORM_RISK.default;

  const forecast = WEEKLY_WEATHER_FORECAST[cityKey] || WEEKLY_WEATHER_FORECAST.default;
  const weatherFactor =
    (forecast.rain_mm > 50 ? 0.06 : forecast.rain_mm > 25 ? 0.03 : 0) +
    (forecast.heat_index > 44 ? 0.05 : forecast.heat_index > 40 ? 0.02 : 0) +
    (forecast.aqi > 300 ? 0.04 : forecast.aqi > 200 ? 0.02 : 0);

  const riskScore = Math.min(+(baseRisk + hoursFactor + platformFactor + weatherFactor).toFixed(3), 1.0);
  const tier = BASE_TIERS.find(t => riskScore <= t.maxScore);

  let premium  = tier.basePremium;
  let coverage = tier.baseCoverage;
  const adjustments = [];

  // Adjustment 1: Waterlogging-safe pin code -> discount
  if (pin_code && WATERLOGGING_SAFE_ZONES.has(String(pin_code))) {
    const discount = premium > 60 ? 5 : 2;
    premium -= discount;
    adjustments.push({ reason: 'Safe flood zone (pin-code)', delta: -discount, type: 'discount' });
  }

  // Adjustment 2: Adverse weather forecast -> extended coverage + surcharge
  if (forecast.rain_mm > 50 || forecast.heat_index > 44) {
    coverage += 500;
    premium  += 8;
    adjustments.push({ reason: 'Adverse weather forecast this week', delta: +8, type: 'surcharge', coverage_bonus: 500 });
  }

  // Adjustment 3: Zero-claim loyalty discount
  if (claim_count === 0) {
    premium -= 3;
    adjustments.push({ reason: 'Zero-claim loyalty discount', delta: -3, type: 'discount' });
  }

  // Adjustment 4: Severe pollution surcharge
  if (forecast.aqi > 300) {
    premium += 4;
    adjustments.push({ reason: 'Severe pollution zone surcharge', delta: +4, type: 'surcharge' });
  }

  premium = Math.max(19, Math.min(premium, 149));

  return {
    risk_score: riskScore,
    tier: tier.tier,
    premium,
    coverage,
    adjustments,
    forecast: { rain_mm: forecast.rain_mm, heat_index: forecast.heat_index, aqi: forecast.aqi },
    city,
    pin_code,
  };
}

module.exports = { computeRiskScore };
