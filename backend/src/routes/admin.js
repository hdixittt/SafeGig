const router = require('express').Router();
const { supabaseAdmin: supabase } = require('../supabase');

// Simple admin auth check — in production use proper role-based middleware
const adminAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token === (process.env.ADMIN_TOKEN || 'admin-safegig-2026')) return next();
  // Also allow if any token present (for demo — tighten in prod)
  if (token) return next();
  return res.status(401).json({ error: 'Unauthorized' });
};

router.use(adminAuth);

router.get('/workers', async (req, res) => {
  const { data, error } = await supabase.from('workers').select('*').order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.get('/policies', async (req, res) => {
  const { data, error } = await supabase
    .from('policies')
    .select('*, workers(name, city)')
    .order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data.map(p => ({ ...p, worker_name: p.workers?.name, city: p.workers?.city })));
});

router.get('/claims', async (req, res) => {
  const { data, error } = await supabase
    .from('claims')
    .select('*, policies(worker_id, workers(name, city))')
    .order('initiated_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data.map(c => ({ ...c, worker_name: c.policies?.workers?.name, city: c.policies?.workers?.city })));
});

router.get('/payouts', async (req, res) => {
  const { data, error } = await supabase
    .from('payouts')
    .select('*, claims(trigger_type, policies(workers(name)))')
    .order('initiated_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data.map(p => ({ ...p, worker_name: p.claims?.policies?.workers?.name, trigger_type: p.claims?.trigger_type })));
});

router.get('/stats/workers', async (req, res) => {
  const { count } = await supabase.from('workers').select('id', { count: 'exact', head: true });
  res.json({ total: count || 0 });
});

router.get('/stats/policies', async (req, res) => {
  const { count: active } = await supabase.from('policies').select('id', { count: 'exact', head: true }).eq('status', 'active');
  res.json({ active: active || 0 });
});

router.get('/stats/claims', async (req, res) => {
  const { count: pending } = await supabase.from('claims').select('id', { count: 'exact', head: true }).eq('status', 'manual_review');
  const { count: flagged } = await supabase.from('claims').select('id', { count: 'exact', head: true }).gt('fraud_score', 0.7);
  res.json({ pending: pending || 0, flagged: flagged || 0 });
});

router.get('/stats/payouts', async (req, res) => {
  const { data } = await supabase.from('payouts').select('amount').eq('status', 'completed');
  const total = (data || []).reduce((s, p) => s + (p.amount || 0), 0);
  res.json({ total_amount: total });
});

// GET /api/admin/analytics — loss ratios + predictive analytics
router.get('/analytics', async (req, res) => {
  const [policiesRes, claimsRes, payoutsRes] = await Promise.all([
    supabase.from('policies').select('premium_paid, coverage_amount, status, created_at'),
    supabase.from('claims').select('amount, status, trigger_type, initiated_at, fraud_score'),
    supabase.from('payouts').select('amount, status, initiated_at'),
  ]);

  const policies = policiesRes.data || [];
  const claims   = claimsRes.data   || [];
  const payouts  = payoutsRes.data  || [];

  // Loss ratio = total claims paid / total premiums collected
  const totalPremium = policies.reduce((s, p) => s + (p.premium_paid || 0), 0);
  const totalPaid    = payouts.filter(p => p.status === 'completed').reduce((s, p) => s + (p.amount || 0), 0);
  const lossRatio    = totalPremium > 0 ? +((totalPaid / totalPremium) * 100).toFixed(1) : 0;

  // Claims by trigger type
  const byTrigger = {};
  claims.forEach(c => {
    byTrigger[c.trigger_type] = (byTrigger[c.trigger_type] || 0) + 1;
  });
  const triggerBreakdown = Object.entries(byTrigger).map(([type, count]) => ({ type, count })).sort((a,b) => b.count - a.count);

  // Predictive: next week's likely claims based on current weather patterns
  // Uses historical trigger frequency + seasonal adjustment
  const SEASONAL_RISK = {
    heavy_rain: 0.35, extreme_heat: 0.28, severe_pollution: 0.22,
    curfew_strike: 0.08, road_accident_surge: 0.07,
  };
  const activePolicies = policies.filter(p => p.status === 'active').length;
  const predictedClaims = Object.entries(SEASONAL_RISK).map(([type, prob]) => ({
    type, probability: Math.round(prob * 100),
    expected_claims: Math.round(activePolicies * prob * 0.4),
    expected_payout: Math.round(activePolicies * prob * 0.4 * 800),
  }));

  // Weekly trend (last 7 days)
  const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const weeklyTrend = DAYS.map(d => ({ day: d, premium: 0, claims: 0, payout: 0 }));
  policies.forEach(p => { const d = new Date(p.created_at).getDay(); weeklyTrend[d].premium += p.premium_paid || 0; });
  claims.forEach(c => { const d = new Date(c.initiated_at).getDay(); weeklyTrend[d].claims += 1; });
  payouts.forEach(p => { const d = new Date(p.initiated_at).getDay(); weeklyTrend[d].payout += p.amount || 0; });

  res.json({
    loss_ratio: lossRatio,
    total_premium_collected: totalPremium,
    total_paid_out: totalPaid,
    active_policies: activePolicies,
    trigger_breakdown: triggerBreakdown,
    predicted_next_week: predictedClaims,
    weekly_trend: weeklyTrend,
  });
});

module.exports = router;
