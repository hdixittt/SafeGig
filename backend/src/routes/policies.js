const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { supabaseAdmin: supabase } = require('../supabase');
const { computeRiskScore } = require('../lib/riskEngine');

// POST /api/policies - create weekly policy with dynamic ML pricing
router.post('/', authMiddleware, async (req, res) => {
  const { worker_id } = req.body;

  const { data: worker, error: workerError } = await supabase
    .from('workers')
    .select('city, pin_code, platform, weekly_hours')
    .eq('id', worker_id)
    .single();

  if (workerError) return res.status(404).json({ error: 'Worker not found' });

  // Pass claim history to pricing engine for loyalty discount
  // First get all policy IDs for this worker, then count claims against them
  const { data: workerPolicies } = await supabase
    .from('policies').select('id').eq('worker_id', worker_id);
  const policyIds = (workerPolicies || []).map(p => p.id);
  const { count: claimCount } = policyIds.length
    ? await supabase.from('claims').select('id', { count: 'exact', head: true }).in('policy_id', policyIds)
    : { count: 0 };

  const riskResult = computeRiskScore({ ...worker, claim_count: claimCount || 0 });

  const weekStart = new Date();
  const weekEnd   = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const { data, error } = await supabase
    .from('policies')
    .insert([{
      worker_id,
      week_start:       weekStart.toISOString(),
      week_end:         weekEnd.toISOString(),
      premium_paid:     riskResult.premium,
      coverage_amount:  riskResult.coverage,
      risk_score:       riskResult.risk_score,
      status:           'active',
    }])
    .select().single();

  if (error) return res.status(400).json({ error: error.message });

  res.json({ ...data, pricing_breakdown: riskResult.adjustments, forecast: riskResult.forecast });
});

// GET /api/policies/worker/:workerId
router.get('/worker/:workerId', authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from('policies')
    .select('*')
    .eq('worker_id', req.params.workerId)
    .order('created_at', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

module.exports = router;
