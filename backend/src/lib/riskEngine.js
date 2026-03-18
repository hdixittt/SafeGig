// Inline risk scoring — mirrors the Python ML service logic.
// Replace with a real XGBoost model call when the ML service is integrated.

const CITY_RISK = {
  mumbai: 0.75, delhi: 0.70, bangalore: 0.45,
  chennai: 0.60, kolkata: 0.65, hyderabad: 0.50,
  pune: 0.40, ahmedabad: 0.55,
};

const RISK_TIERS = [
  { maxScore: 0.25, tier: 'Low',      premium: 29,  coverage: 800 },
  { maxScore: 0.50, tier: 'Standard', premium: 49,  coverage: 1500 },
  { maxScore: 0.75, tier: 'High',     premium: 79,  coverage: 2500 },
  { maxScore: 1.00, tier: 'Premium',  premium: 89,  coverage: 3500 },
];

function computeRiskScore({ city, pin_code, platform, weekly_hours }) {
  const baseRisk = CITY_RISK[city?.toLowerCase().trim()] ?? 0.50;
  const hoursFactor = Math.min((weekly_hours || 40) / 60, 1) * 0.2;
  const platformRisk = { zepto: 0.05, blinkit: 0.03, instamart: 0.04 }[platform?.toLowerCase()] ?? 0.03;

  const riskScore = Math.min(+(baseRisk + hoursFactor + platformRisk).toFixed(3), 1.0);
  const tier = RISK_TIERS.find(t => riskScore <= t.maxScore);

  return {
    risk_score: riskScore,
    tier: tier.tier,
    premium: tier.premium,
    coverage: tier.coverage,
    city,
    pin_code,
  };
}

module.exports = { computeRiskScore };
